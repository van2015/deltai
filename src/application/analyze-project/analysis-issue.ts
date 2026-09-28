export type AnalysisIssueSeverity = 'error' | 'warning';

export interface AnalysisIssue {
  readonly path: string;
  readonly message: string;
  readonly severity: AnalysisIssueSeverity;
}
