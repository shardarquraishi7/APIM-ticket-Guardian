import type { Octokit } from '@octokit/rest';
import gunzip from 'gunzip-maybe';
import path from 'path';
import { Readable } from 'stream';
import tar from 'tar-stream';
import { octokit } from '@/lib/octokit';
import type { FileData } from '@/types';

export interface FetchOpts {
  owner: string;
  repo: string;
  ref: string;
  filesToProcess?: string[];
}

export class GitHubService {
  private readonly octokit: Octokit;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }

  async fetchMarkdownFiles(opts: FetchOpts): Promise<FileData[]> {
    return await this.getFilesFromTarball(opts);
  }

  async getFilesFromTarball(opts: FetchOpts): Promise<FileData[]> {
    const { data, error } = await this.getTarball(opts);
    if (error) {
      throw new Error(`Failed to get tarball for ${opts.owner}/${opts.repo}@${opts.ref}`);
    }
    const stream = await this.tarballToStream(data);
    const files = await this.extractFilesFromTarballStream(stream, opts);
    return (await this.injectShas(files, opts)) satisfies FileData[];
  }

  async getTarball(opts: FetchOpts) {
    try {
      const response = await this.octokit.request('GET /repos/{owner}/{repo}/tarball/{ref}', {
        owner: opts.owner,
        repo: opts.repo,
        ref: opts.ref,
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      return { data: response.data as unknown as ArrayBuffer, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async tarballToStream(tarball: ArrayBuffer) {
    const buffer = Buffer.from(tarball);
    const stream = Readable.from(buffer).pipe(gunzip());
    return stream;
  }

  async extractFilesFromTarballStream(stream: Readable, opts: FetchOpts) {
    const files: FileData[] = [];
    const extract = tar.extract();
    const extractPromise = new Promise<void>((resolve, reject) => {
      extract.on('entry', (header: any, streamEntry: any, next: any) => {
        const relPath = header.name.split('/').slice(1).join('/');

        // Skip binary and non-standard file formats
        const fileExt = path.extname(relPath).toLowerCase();

        if (fileExt !== '.md') {
          streamEntry.resume(); // Drain the stream
          next();
          return;
        }

        if (
          opts.filesToProcess &&
          !opts.filesToProcess.some((file) => file.endsWith('.md') && file === relPath)
        ) {
          streamEntry.resume(); // Drain the stream
          next();
          return;
        }

        let content = '';
        streamEntry.setEncoding('utf8');

        streamEntry.on('data', (chunk: any) => (content += chunk));
        streamEntry.on('end', () => {
          // Filter out empty files or files that contain only a newline character
          if (content.trim() !== '') {
            files.push({
              content,
              metadata: {
                owner: opts.owner,
                repo: opts.repo,
                path: relPath,
                name: path.basename(relPath),
                sha: '', // sha injected later
              },
            });
          }
          next();
        });
        streamEntry.on('error', reject);
      });

      extract.on('finish', resolve);
      extract.on('error', reject);
    });

    stream.pipe(extract);
    await extractPromise;
    return files;
  }

  async injectShas(files: FileData[], opts: FetchOpts) {
    const { data, error } = await this.getFilteredTreePaths(opts);
    if (error) {
      throw new Error(
        `Failed to get filtered tree paths for ${opts.owner}/${opts.repo}@${opts.ref}`,
      );
    }
    const shaMap = new Map(data.map((item) => [item.path, item.sha]));
    return files.map((file) => ({
      ...file,
      metadata: {
        ...file.metadata,
        sha: shaMap.get(file.metadata?.path as string) || '',
      },
    }));
  }

  async getFilteredTreePaths(opts: FetchOpts) {
    try {
      const { data: refData } = await this.octokit.rest.git.getRef({
        owner: opts.owner,
        repo: opts.repo,
        ref: `heads/${opts.ref}`,
      });

      const commitSha = refData.object.sha;

      const { data: commitData } = await this.octokit.rest.git.getCommit({
        owner: opts.owner,
        repo: opts.repo,
        commit_sha: commitSha,
      });

      const treeSha = commitData.tree.sha;

      const { data: treeData } = await this.octokit.rest.git.getTree({
        owner: opts.owner,
        repo: opts.repo,
        tree_sha: treeSha,
        recursive: '1',
      });

      return {
        data: treeData.tree
          .filter((item) => item.type === 'blob' && item.path)
          .map((item) => ({ path: item.path!, sha: item.sha! })),
        error: null,
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}

export const githubService = new GitHubService(octokit);
