import type { AnalysisResult } from './analysis-result.js';
import type { SourceFile } from './source-file.js';

export interface ProjectAnalyzer {
  analyze(files: readonly SourceFile[]): Promise<AnalysisResult>;
}
