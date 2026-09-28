import type { AnalysisStatus } from '../../domain/project/analysis-status.js';
import type { ProjectModel } from '../../domain/project/project-state/project-model.js';
import type { AnalysisIssue } from './analysis-issue.js';

export interface AnalysisResult {
  readonly status: AnalysisStatus;
  readonly model: ProjectModel;
  readonly issues: readonly AnalysisIssue[];
}
