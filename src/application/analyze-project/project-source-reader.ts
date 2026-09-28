import type { ProjectLocation } from '../../domain/project/project-location.js';
import type { SourceFile } from './source-file.js';

export interface ProjectSourceReader {
  read(location: ProjectLocation): Promise<readonly SourceFile[]>;
}
