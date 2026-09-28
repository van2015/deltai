import type { AnalysisResult } from '@/application/analyze-project/analysis-result.js';
import type { ProjectAnalyzer } from '@/application/analyze-project/project-analyzer.js';
import type { SourceFile } from '@/application/analyze-project/source-file.js';

export class FakeProjectAnalyzer implements ProjectAnalyzer {
  files: readonly SourceFile[] | undefined;

  constructor(private readonly result: AnalysisResult) {}

  async analyze(files: readonly SourceFile[]): Promise<AnalysisResult> {
    this.files = files;

    return this.result;
  }
}
