import type { ProjectState } from '../project/project-state/project-state.js';

export interface RefactoringAnalysisContext {
  readonly projectState: ProjectState;
  readonly userIntent?: string;
}
