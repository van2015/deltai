import type { ProjectLocation } from '@/domain/project/project-location.js';
import type { ProjectSourceReader } from '@/application/analyze-project/project-source-reader.js';
import type { SourceFile } from '@/application/analyze-project/source-file.js';

export class FakeProjectSourceReader implements ProjectSourceReader {
  location: ProjectLocation | undefined;
  shouldFail = false;

  constructor(private readonly files: readonly SourceFile[]) {}

  async read(location: ProjectLocation): Promise<readonly SourceFile[]> {
    this.location = location;

    if (this.shouldFail) {
      throw new Error('source reading failed');
    }

    return this.files;
  }
}
