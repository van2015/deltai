import type { ProjectState } from '../../domain/project/project-state/project-state.js';
import type { SourceCode } from '../../domain/refactoring-analyzer/source-code.js';

export interface AgentRequest {
  readonly projectState: ProjectState;
  readonly sourceCode: SourceCode;
  readonly userIntent?: string;
}
