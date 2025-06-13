import { Octokit } from '@octokit/rest';
import gunzip from 'gunzip-maybe';
import { Readable } from 'stream';
import tar from 'tar-stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FileData } from '@/types';
import { GitHubService } from './github';

// Mock dependencies
vi.mock('@octokit/rest');
vi.mock('gunzip-maybe', () => ({
  default: vi.fn((input) => input),
}));
vi.mock('tar-stream', () => ({
  default: {
    extract: vi.fn(() => ({
      on: vi.fn((event, callback) => {
        if (event === 'finish') {
          setTimeout(callback, 0);
        }
        return { pipe: vi.fn() };
      }),
      pipe: vi.fn(),
    })),
  },
}));

describe('GitHubService', () => {
  let githubService: GitHubService;
  let mockOctokit: Octokit;

  const mockOpts = {
    owner: 'testOwner',
    repo: 'testRepo',
    ref: 'main',
  };

  beforeEach(() => {
    vi.resetAllMocks();

    mockOctokit = {
      request: vi.fn(),
      rest: {
        git: {
          getRef: vi.fn(),
          getCommit: vi.fn(),
          getTree: vi.fn(),
        },
      },
    } as unknown as Octokit;

    githubService = new GitHubService(mockOctokit);
  });

  describe('fetchMarkdownFiles', () => {
    it('should call getFilesFromTarball with the provided options', async () => {
      const mockFiles: FileData[] = [
        {
          content: 'Test content',
          metadata: {
            owner: 'testOwner',
            repo: 'testRepo',
            path: 'test.md',
            name: 'test.md',
            sha: 'abc123',
          },
        },
      ];

      vi.spyOn(githubService, 'getFilesFromTarball').mockResolvedValue(mockFiles);

      const result = await githubService.fetchMarkdownFiles(mockOpts);

      expect(githubService.getFilesFromTarball).toHaveBeenCalledWith(mockOpts);
      expect(result).toEqual(mockFiles);
    });
  });

  describe('getTarball', () => {
    it('should return data when request is successful', async () => {
      const mockResponse = {
        data: new ArrayBuffer(8),
      };

      (mockOctokit.request as vi.Mock).mockResolvedValue(mockResponse);

      const result = await githubService.getTarball(mockOpts);

      expect(mockOctokit.request).toHaveBeenCalledWith('GET /repos/{owner}/{repo}/tarball/{ref}', {
        owner: mockOpts.owner,
        repo: mockOpts.repo,
        ref: mockOpts.ref,
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      expect(result).toEqual({ data: mockResponse.data, error: null });
    });

    it('should return error when request fails', async () => {
      const mockError = new Error('Request failed');

      (mockOctokit.request as vi.Mock).mockRejectedValue(mockError);

      const result = await githubService.getTarball(mockOpts);

      expect(result).toEqual({ data: null, error: mockError });
    });
  });

  describe('tarballToStream', () => {
    it('should convert ArrayBuffer to readable stream', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockStream = {} as Readable;

      vi.spyOn(Readable, 'from').mockReturnValue({
        pipe: () => mockStream,
      } as unknown as Readable);

      const result = await githubService.tarballToStream(mockArrayBuffer);

      expect(Readable.from).toHaveBeenCalled();
      expect(gunzip).toHaveBeenCalled();
      expect(result).toBe(mockStream);
    });
  });

  describe('extractFilesFromTarballStream', () => {
    it('should extract markdown files from tarball stream', async () => {
      const mockStream = new Readable();
      const mockExtract = {
        on: vi.fn((event, callback) => {
          if (event === 'entry') {
            // Simulate a markdown file entry
            const mockHeader = { name: 'repo-main/test.md' };
            const mockStreamEntry = new Readable();

            // Add methods to mockStreamEntry
            mockStreamEntry.setEncoding = vi.fn();
            mockStreamEntry.on = vi.fn((event, callback) => {
              if (event === 'data') {
                callback('Test content');
              }
              if (event === 'end') {
                callback();
              }
              return mockStreamEntry;
            });

            const mockNext = vi.fn();
            callback(mockHeader, mockStreamEntry, mockNext);
          }
          if (event === 'finish') {
            setTimeout(callback, 0);
          }
          return mockExtract;
        }),
        pipe: vi.fn(),
      };

      (tar.extract as vi.Mock).mockReturnValue(mockExtract);

      mockStream.pipe = vi.fn().mockReturnValue(mockExtract);

      const result = await githubService.extractFilesFromTarballStream(mockStream, mockOpts);

      expect(result).toHaveLength(1);
      expect(result[0].content).toBe('Test content');
      expect(result[0].metadata.path).toBe('test.md');
    });

    it('should filter files based on filesToProcess option', async () => {
      const mockStream = new Readable();
      const mockExtract = {
        on: vi.fn((event, callback) => {
          if (event === 'entry') {
            // Simulate a markdown file entry that should be filtered out
            const mockHeader = { name: 'repo-main/ignored.md' };
            const mockStreamEntry = new Readable();

            mockStreamEntry.setEncoding = vi.fn();
            mockStreamEntry.on = vi.fn();
            mockStreamEntry.resume = vi.fn();

            const mockNext = vi.fn();
            callback(mockHeader, mockStreamEntry, mockNext);
          }
          if (event === 'finish') {
            setTimeout(callback, 0);
          }
          return mockExtract;
        }),
        pipe: vi.fn(),
      };

      (tar.extract as vi.Mock).mockReturnValue(mockExtract);

      mockStream.pipe = vi.fn().mockReturnValue(mockExtract);

      const optsWithFilter = {
        ...mockOpts,
        filesToProcess: ['specific.md'],
      };

      const result = await githubService.extractFilesFromTarballStream(mockStream, optsWithFilter);

      expect(result).toHaveLength(0);
    });
  });

  describe('getFilteredTreePaths', () => {
    it('should return filtered tree paths when successful', async () => {
      const mockRefData = {
        data: {
          object: {
            sha: 'commitSha123',
          },
        },
      };

      const mockCommitData = {
        data: {
          tree: {
            sha: 'treeSha456',
          },
        },
      };

      const mockTreeData = {
        data: {
          tree: [
            { type: 'blob', path: 'test.md', sha: 'fileSha789' },
            { type: 'tree', path: 'folder', sha: 'folderSha' },
          ],
        },
      };

      (mockOctokit.rest.git.getRef as vi.Mock).mockResolvedValue(mockRefData);
      (mockOctokit.rest.git.getCommit as vi.Mock).mockResolvedValue(mockCommitData);
      (mockOctokit.rest.git.getTree as vi.Mock).mockResolvedValue(mockTreeData);

      const result = await githubService.getFilteredTreePaths(mockOpts);

      expect(mockOctokit.rest.git.getRef).toHaveBeenCalledWith({
        owner: mockOpts.owner,
        repo: mockOpts.repo,
        ref: `heads/${mockOpts.ref}`,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        path: 'test.md',
        sha: 'fileSha789',
      });
    });

    it('should return error when request fails', async () => {
      const mockError = new Error('Request failed');

      (mockOctokit.rest.git.getRef as vi.Mock).mockRejectedValue(mockError);

      const result = await githubService.getFilteredTreePaths(mockOpts);

      expect(result).toEqual({ data: null, error: mockError });
    });
  });

  describe('injectShas', () => {
    it('should inject SHAs into file metadata', async () => {
      const mockFiles: FileData[] = [
        {
          content: 'Test content',
          metadata: {
            owner: 'testOwner',
            repo: 'testRepo',
            path: 'test.md',
            name: 'test.md',
            sha: '',
          },
        },
      ];

      const mockTreePaths = {
        data: [{ path: 'test.md', sha: 'fileSha789' }],
        error: null,
      };

      vi.spyOn(githubService, 'getFilteredTreePaths').mockResolvedValue(mockTreePaths);

      const result = await githubService.injectShas(mockFiles, mockOpts);

      expect(githubService.getFilteredTreePaths).toHaveBeenCalledWith(mockOpts);
      expect(result[0].metadata.sha).toBe('fileSha789');
    });

    it('should throw error when getFilteredTreePaths fails', async () => {
      const mockFiles: FileData[] = [];
      const mockError = new Error('Failed to get tree paths');

      vi.spyOn(githubService, 'getFilteredTreePaths').mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(githubService.injectShas(mockFiles, mockOpts)).rejects.toThrow(
        `Failed to get filtered tree paths for ${mockOpts.owner}/${mockOpts.repo}@${mockOpts.ref}`,
      );
    });
  });

  describe('getFilesFromTarball', () => {
    it('should process tarball and return files with SHAs', async () => {
      const mockTarballData = new ArrayBuffer(8);
      const mockStream = new Readable();
      const mockFiles: FileData[] = [
        {
          content: 'Test content',
          metadata: {
            owner: 'testOwner',
            repo: 'testRepo',
            path: 'test.md',
            name: 'test.md',
            sha: '',
          },
        },
      ];

      const mockFilesWithSha: FileData[] = [
        {
          content: 'Test content',
          metadata: {
            owner: 'testOwner',
            repo: 'testRepo',
            path: 'test.md',
            name: 'test.md',
            sha: 'fileSha789',
          },
        },
      ];

      vi.spyOn(githubService, 'getTarball').mockResolvedValue({
        data: mockTarballData,
        error: null,
      });

      vi.spyOn(githubService, 'tarballToStream').mockResolvedValue(mockStream);
      vi.spyOn(githubService, 'extractFilesFromTarballStream').mockResolvedValue(mockFiles);
      vi.spyOn(githubService, 'injectShas').mockResolvedValue(mockFilesWithSha);

      const result = await githubService.getFilesFromTarball(mockOpts);

      expect(githubService.getTarball).toHaveBeenCalledWith(mockOpts);
      expect(githubService.tarballToStream).toHaveBeenCalledWith(mockTarballData);
      expect(githubService.extractFilesFromTarballStream).toHaveBeenCalledWith(
        mockStream,
        mockOpts,
      );
      expect(githubService.injectShas).toHaveBeenCalledWith(mockFiles, mockOpts);
      expect(result).toEqual(mockFilesWithSha);
    });

    it('should throw error when getTarball fails', async () => {
      vi.spyOn(githubService, 'getTarball').mockResolvedValue({
        data: null,
        error: new Error('Failed to get tarball'),
      });

      await expect(githubService.getFilesFromTarball(mockOpts)).rejects.toThrow(
        `Failed to get tarball for ${mockOpts.owner}/${mockOpts.repo}@${mockOpts.ref}`,
      );
    });
  });
});
