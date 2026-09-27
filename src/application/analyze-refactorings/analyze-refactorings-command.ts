import type { ProjectId } from '../../domain/project/project-state/project-id.js';
import type { SourceCode } from '../../domain/refactoring-analyzer/source-code.js';

export class AnalyzeRefactoringsCommand {
  constructor(
    readonly projectId: ProjectId,
    readonly sourceCode: SourceCode,
    readonly userIntent?: string,
  ) {}
}
