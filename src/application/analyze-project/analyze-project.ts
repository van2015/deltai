import { AnalysisStatus } from '../../domain/project/analysis-status.js';
import type { Element } from '../../domain/project/project-state/element.js';
import type { ProjectModel } from '../../domain/project/project-state/project-model.js';
import type { Relationship } from '../../domain/project/project-state/relationship.js';
import type { AnalysisResult } from './analysis-result.js';
import type { AnalyzeProjectCommand } from './analyze-project-command.js';
import type { ProjectAnalyzer } from './project-analyzer.js';
import type { ProjectRepository } from '../analyze-refactorings/project-repository.js';
import { ProjectLocationRequiredError } from './project-location-required-error.js';
import type { ProjectSourceReader } from './project-source-reader.js';

export class AnalyzeProject {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly sourceReader: ProjectSourceReader,
    private readonly analyzer: ProjectAnalyzer,
  ) {}

  async execute(command: AnalyzeProjectCommand): Promise<AnalysisResult> {
    const project = await this.projectRepository.get(command.projectId);
    project.startAnalysis();

    if (command.signal?.aborted) {
      project.cancelAnalysis();
      return AnalyzeProject.cancelled(project.currentState.getElements(), project.currentState.getRelationships());
    }

    if (project.location === undefined) {
      project.failAnalysis();
      const error = new ProjectLocationRequiredError();

      return AnalyzeProject.failed(
        project.currentState.getElements(),
        project.currentState.getRelationships(),
        error.message,
      );
    }

    try {
      const files = await this.sourceReader.read(project.location);

      if (command.signal?.aborted) {
        project.cancelAnalysis();
        return AnalyzeProject.cancelled(
          project.currentState.getElements(),
          project.currentState.getRelationships(),
        );
      }

      const result = await this.analyzer.analyze(files);

      if (result.status === AnalysisStatus.Analyzed) {
        project.completeAnalysis(result.model, AnalysisStatus.Analyzed);
      } else if (result.status === AnalysisStatus.PartiallyAnalyzed) {
        project.completeAnalysis(result.model, AnalysisStatus.PartiallyAnalyzed);
      } else if (result.status === AnalysisStatus.Cancelled) {
        project.cancelAnalysis();
      } else {
        project.failAnalysis();
      }

      return result;
    } catch (error) {
      project.failAnalysis();

      return AnalyzeProject.failed(
        project.currentState.getElements(),
        project.currentState.getRelationships(),
        error instanceof Error ? error.message : 'Project analysis failed',
      );
    }
  }

  private static model(
    elements: readonly Element[],
    relationships: readonly Relationship[],
  ): ProjectModel {
    return { elements, relationships };
  }

  private static cancelled(
    elements: readonly Element[],
    relationships: readonly Relationship[],
  ): AnalysisResult {
    return {
      status: AnalysisStatus.Cancelled,
      model: AnalyzeProject.model(elements, relationships),
      issues: [],
    };
  }

  private static failed(
    elements: readonly Element[],
    relationships: readonly Relationship[],
    message: string,
  ): AnalysisResult {
    return {
      status: AnalysisStatus.Failed,
      model: AnalyzeProject.model(elements, relationships),
      issues: [{ path: '', message, severity: 'error' }],
    };
  }
}
