import { describe, expect, it } from 'vitest';

import { AnalysisStatus } from '@/domain/project/analysis-status.js';
import { Project } from '@/domain/project/project.js';
import { ProjectLocation } from '@/domain/project/project-location.js';
import type { ProjectModel } from '@/domain/project/project-state/project-model.js';
import { AnalyzeProjectCommand } from '@/application/analyze-project/analyze-project-command.js';
import { AnalyzeProject } from '@/application/analyze-project/analyze-project.js';
import type { AnalysisResult } from '@/application/analyze-project/analysis-result.js';
import { SourceFile } from '@/application/analyze-project/source-file.js';

import { ProjectStateBuilder } from '../support/builders/project-state.builder.js';
import { FakeProjectAnalyzer } from '../support/fakes/fake-project-analyzer.js';
import { FakeProjectRepository } from '../support/fakes/fake-project-repository.js';
import { FakeProjectSourceReader } from '../support/fakes/fake-project-source-reader.js';

const sourceFile = SourceFile.of(
  'src/order.ts',
  'export class Order {}',
  'typescript',
);

const createProject = (model: ProjectModel = { elements: [], relationships: [] }) =>
  Project.create(
    ProjectStateBuilder.aState().withModel(model).build(),
    ProjectLocation.of('/projects/orders'),
  );

const result = (status: AnalysisStatus, model: AnalysisResult['model']): AnalysisResult => ({
  status,
  model,
  issues: [],
});

describe('AnalyzeProject', () => {
  it('updates the project with a complete analyzed model', async () => {
    const project = createProject();
    const analyzedModel = {
      elements: [{ id: 'Order', name: 'Order' }],
      relationships: [],
    };
    const reader = new FakeProjectSourceReader([sourceFile]);
    const analyzer = new FakeProjectAnalyzer(
      result(AnalysisStatus.Analyzed, analyzedModel),
    );
    const service = new AnalyzeProject(
      new FakeProjectRepository(project),
      reader,
      analyzer,
    );

    const analysis = await service.execute(new AnalyzeProjectCommand('project-1'));

    expect(analysis.status).toBe(AnalysisStatus.Analyzed);
    expect(project.analysisStatus).toBe(AnalysisStatus.Analyzed);
    expect(project.currentState.getElements()).toEqual(analyzedModel.elements);
    expect(analyzer.files).toEqual([sourceFile]);
  });

  it('reads sources from the project location', async () => {
    const project = createProject();
    const reader = new FakeProjectSourceReader([]);
    const service = new AnalyzeProject(
      new FakeProjectRepository(project),
      reader,
      new FakeProjectAnalyzer(result(AnalysisStatus.Analyzed, { elements: [], relationships: [] })),
    );

    await service.execute(new AnalyzeProjectCommand('project-1'));

    expect(reader.location?.path).toBe('/projects/orders');
  });

  it('supports an empty analyzed project', async () => {
    const project = createProject();
    const service = new AnalyzeProject(
      new FakeProjectRepository(project),
      new FakeProjectSourceReader([]),
      new FakeProjectAnalyzer(result(AnalysisStatus.Analyzed, { elements: [], relationships: [] })),
    );

    const analysis = await service.execute(new AnalyzeProjectCommand('project-1'));

    expect(analysis.status).toBe(AnalysisStatus.Analyzed);
    expect(project.currentState.getElements()).toEqual([]);
    expect(project.currentState.getRelationships()).toEqual([]);
  });

  it('replaces the current state with a partial model and keeps issues', async () => {
    const project = createProject({
      elements: [{ id: 'Old', name: 'Old' }],
      relationships: [],
    });
    const partialResult: AnalysisResult = {
      status: AnalysisStatus.PartiallyAnalyzed,
      model: { elements: [{ id: 'Order', name: 'Order' }], relationships: [] },
      issues: [{ path: 'src/broken.ts', message: 'Syntax error', severity: 'error' }],
    };
    const service = new AnalyzeProject(
      new FakeProjectRepository(project),
      new FakeProjectSourceReader([sourceFile]),
      new FakeProjectAnalyzer(partialResult),
    );

    const analysis = await service.execute(new AnalyzeProjectCommand('project-1'));

    expect(analysis.status).toBe(AnalysisStatus.PartiallyAnalyzed);
    expect(project.analysisStatus).toBe(AnalysisStatus.PartiallyAnalyzed);
    expect(project.currentState.getElements()).toEqual([{ id: 'Order', name: 'Order' }]);
    expect(analysis.issues).toHaveLength(1);
  });

  it('removes obsolete elements when re-analyzing', async () => {
    const project = createProject({
      elements: [{ id: 'Old', name: 'Old' }],
      relationships: [],
    });
    const service = new AnalyzeProject(
      new FakeProjectRepository(project),
      new FakeProjectSourceReader([sourceFile]),
      new FakeProjectAnalyzer(
        result(AnalysisStatus.Analyzed, {
          elements: [{ id: 'New', name: 'New' }],
          relationships: [],
        }),
      ),
    );

    await service.execute(new AnalyzeProjectCommand('project-1'));

    expect(project.currentState.getElements()).toEqual([{ id: 'New', name: 'New' }]);
  });

  it('preserves the previous state when reading sources fails', async () => {
    const project = createProject({
      elements: [{ id: 'Existing', name: 'Existing' }],
      relationships: [],
    });
    const reader = new FakeProjectSourceReader([]);
    reader.shouldFail = true;
    const service = new AnalyzeProject(
      new FakeProjectRepository(project),
      reader,
      new FakeProjectAnalyzer(result(AnalysisStatus.Analyzed, { elements: [], relationships: [] })),
    );

    const analysis = await service.execute(new AnalyzeProjectCommand('project-1'));

    expect(analysis.status).toBe(AnalysisStatus.Failed);
    expect(project.analysisStatus).toBe(AnalysisStatus.Failed);
    expect(project.currentState.getElements()).toEqual([
      { id: 'Existing', name: 'Existing' },
    ]);
  });

  it('preserves the previous state when analysis is cancelled', async () => {
    const project = createProject({
      elements: [{ id: 'Existing', name: 'Existing' }],
      relationships: [],
    });
    const controller = new AbortController();
    controller.abort();
    const analyzer = new FakeProjectAnalyzer(
      result(AnalysisStatus.Analyzed, { elements: [{ id: 'New', name: 'New' }], relationships: [] }),
    );
    const service = new AnalyzeProject(
      new FakeProjectRepository(project),
      new FakeProjectSourceReader([sourceFile]),
      analyzer,
    );

    const analysis = await service.execute(
      new AnalyzeProjectCommand('project-1', controller.signal),
    );

    expect(analysis.status).toBe(AnalysisStatus.Cancelled);
    expect(project.analysisStatus).toBe(AnalysisStatus.Cancelled);
    expect(project.currentState.getElements()).toEqual([
      { id: 'Existing', name: 'Existing' },
    ]);
    expect(analyzer.files).toBeUndefined();
  });

  it('fails when the project has no location', async () => {
    const project = Project.create(ProjectStateBuilder.aState().build());
    const service = new AnalyzeProject(
      new FakeProjectRepository(project),
      new FakeProjectSourceReader([]),
      new FakeProjectAnalyzer(result(AnalysisStatus.Analyzed, { elements: [], relationships: [] })),
    );

    const analysis = await service.execute(new AnalyzeProjectCommand('project-1'));

    expect(analysis.status).toBe(AnalysisStatus.Failed);
    expect(project.analysisStatus).toBe(AnalysisStatus.Failed);
  });
});
