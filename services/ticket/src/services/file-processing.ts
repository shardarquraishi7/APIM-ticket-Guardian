import { encode } from 'gpt-tokenizer';
import { FileData, ProcessedChunk, ProcessedChunkMetadata } from '@/types';

interface Section {
  heading: string | null;
  content: string;
  subHeadings: string[];
}

export class FileProcessingService {
  constructor() {}

  async processFiles(files: FileData[]): Promise<ProcessedChunk[]> {
    if (files.length === 0) {
      return [];
    }

    const allChunks: ProcessedChunk[] = [];
    const maxTokens = 8000;

    for (const file of files) {
      // If the entire file is within token limit, keep it as one chunk
      if (encode(file.content).length <= maxTokens) {
        allChunks.push({
          content: file.content,
          metadata: {
            ...file.metadata,
            type: 'document',
            part: 0,
          },
        });
        continue;
      }

      // Split the file into sections by headers
      const sections = this.splitIntoSections(file.content);
      let currentSection: Section | null = null;
      let part = 0;

      for (const section of sections) {
        const sectionTokens = encode(section.content).length;

        // If section alone exceeds maxTokens, split it
        if (sectionTokens > maxTokens) {
          if (currentSection) {
            allChunks.push(this.createChunk(currentSection, file.metadata, part++));
            currentSection = null;
          }

          // Split large section into smaller chunks
          const chunks = this.splitSectionByTokens(section, maxTokens);
          for (const chunk of chunks) {
            allChunks.push({
              content: chunk.content,
              metadata: {
                ...file.metadata,
                type: 'section',
                heading: section.heading,
                subPart: chunk.subPart,
                part: part++,
              },
            });
          }
          continue;
        }

        // Try to combine with previous section
        if (currentSection) {
          const combinedContent = currentSection.content + '\n\n' + section.content;
          const combinedTokens = encode(combinedContent).length;

          if (combinedTokens <= maxTokens) {
            currentSection.content = combinedContent;
            if (section.heading) {
              currentSection.subHeadings.push(section.heading);
            }
          } else {
            // Can't combine, flush current and start new
            allChunks.push(this.createChunk(currentSection, file.metadata, part++));
            currentSection = section;
          }
        } else {
          currentSection = section;
        }
      }

      // Don't forget the last section
      if (currentSection) {
        allChunks.push(this.createChunk(currentSection, file.metadata, part++));
      }
    }

    return allChunks;
  }

  private splitIntoSections(content: string): Section[] {
    const lines = content.split('\n');
    const sections: Section[] = [];
    let currentSection: Section = {
      heading: null,
      content: '',
      subHeadings: [],
    };

    for (const line of lines) {
      // Check if line is a heading
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headingMatch) {
        // If we have content in current section, save it
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection });
        }

        // Start new section
        currentSection = {
          heading: headingMatch[2].trim(),
          content: line + '\n', // Include the heading in content
          subHeadings: [],
        };
      } else {
        currentSection.content += line + '\n';
      }
    }

    // Don't forget the last section
    if (currentSection.content.trim()) {
      sections.push(currentSection);
    }

    return sections;
  }

  private createChunk(
    section: Section,
    fileMetadata: ProcessedChunkMetadata,
    part: number,
  ): ProcessedChunk {
    return {
      content: section.content,
      metadata: {
        ...fileMetadata,
        type: 'section',
        heading: section.heading,
        subHeadings: section.subHeadings,
        part,
      },
    };
  }

  private splitSectionByTokens(
    section: Section,
    maxTokens: number,
  ): { content: string; subPart: number }[] {
    const chunks: { content: string; subPart: number }[] = [];
    const paragraphs = section.content.split(/\n\n+/);
    let currentChunk = '';
    let subPart = 0;

    const pushChunk = (content: string) => {
      if (content.trim()) {
        chunks.push({ content: content.trim(), subPart: subPart++ });
      }
    };

    for (const paragraph of paragraphs) {
      const nextChunk = currentChunk ? currentChunk + '\n\n' + paragraph : paragraph;
      const tokens = encode(nextChunk).length;

      if (tokens > maxTokens) {
        if (currentChunk) {
          pushChunk(currentChunk);
          currentChunk = paragraph;
        } else {
          // Single paragraph is too large, split by sentences
          const sentences = paragraph.split(/([.!?]+\s+)/);
          let sentenceChunk = '';

          for (const sentence of sentences) {
            const nextSentence = sentenceChunk ? sentenceChunk + sentence : sentence;
            const sentenceTokens = encode(nextSentence).length;

            if (sentenceTokens > maxTokens) {
              if (sentenceChunk) {
                pushChunk(sentenceChunk);
                sentenceChunk = sentence;
              } else {
                // Single sentence is too large, split by words
                const words = sentence.split(/\s+/);
                let wordChunk = '';

                for (const word of words) {
                  const nextWord = wordChunk ? wordChunk + ' ' + word : word;
                  const wordTokens = encode(nextWord).length;

                  if (wordTokens > maxTokens) {
                    if (wordChunk) {
                      pushChunk(wordChunk);
                      wordChunk = word;
                    } else {
                      // Single word is too large, split by characters
                      let chars = '';
                      for (const char of word) {
                        const nextChar = chars + char;
                        const charTokens = encode(nextChar).length;

                        if (charTokens > maxTokens) {
                          if (chars) {
                            pushChunk(chars);
                            chars = char;
                          } else {
                            pushChunk(char);
                          }
                        } else {
                          chars = nextChar;
                        }
                      }
                      if (chars) {
                        pushChunk(chars);
                      }
                    }
                  } else {
                    wordChunk = nextWord;
                  }
                }
                if (wordChunk) {
                  pushChunk(wordChunk);
                }
              }
            } else {
              sentenceChunk = nextSentence;
            }
          }
          if (sentenceChunk) {
            pushChunk(sentenceChunk);
          }
        }
      } else {
        currentChunk = nextChunk;
      }
    }

    if (currentChunk) {
      pushChunk(currentChunk);
    }

    return chunks;
  }
}

export const fileProcessingService = new FileProcessingService();
