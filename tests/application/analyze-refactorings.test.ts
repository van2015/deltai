import { describe, expect, it } from 'vitest';

import { AnalyzeRefactoringsCommand } from '@/application/analyze-refactorings/analyze-refactorings-command.js';
import { AnalyzeRefactorings } from '@/application/analyze-refactorings/analyze-refactorings.js';
import { CodeLocation } from '@/domain/refactoring-analyzer/code-location.js';
import { RefactoringProposal } from '@/domain/refactoring-analyzer/refactoring-proposal.js';
import { SourceCode } from '@/domain/refactoring-analyzer/source-code.js';
import { Project } from '@/domain/project/project.js';

import { ProjectStateBuilder } from '../support/builders/project-state.builder.js';
import { FakeAgentGateway } from '../support/fakes/fake-agent-gateway.js';
import { FakeProjectRepository } from '../support/fakes/fake-project-repository.js';

describe('AnalyzeRefactorings', () => {
  it('returns proposals from the agent gateway', async () => {
    const projectState = ProjectStateBuilder.aState().build();
    const sourceCode = SourceCode.of('class Order {}', 'src/order.ts');
    const proposal = RefactoringProposal.of({
      type: 'long-method',
      description: 'extract-method',
      rationale: 'The method is too long',
      target: CodeLocation.of('src/order.ts', 'processOrder'),
    });
    const gateway = new FakeAgentGateway({ proposals: [proposal] });
    const project = Project.create(projectState);
    const analyzeRefactorings = new AnalyzeRefactorings(
      gateway,
      new FakeProjectRepository(project),
    );

    const proposals = await analyzeRefactorings.execute(
      new AnalyzeRefactoringsCommand('project-1', sourceCode),
    );

    expect(proposals).toEqual([proposal]);
  });

  it('sends the project state and source code to the agent gateway', async () => {
    const projectState = ProjectStateBuilder.aState().build();
    const sourceCode = SourceCode.of('class Order {}', 'src/order.ts');
    const gateway = new FakeAgentGateway({ proposals: [] });
    const analyzeRefactorings = new AnalyzeRefactorings(
      gateway,
      new FakeProjectRepository(Project.create(projectState)),
    );

    await analyzeRefactorings.execute(
      new AnalyzeRefactoringsCommand('project-1', sourceCode, 'Find safe refactorings'),
    );

    expect(gateway.lastRequest?.projectState).toBe(projectState);
    expect(gateway.lastRequest?.sourceCode).toBe(sourceCode);
    expect(gateway.lastRequest?.userIntent).toBe('Find safe refactorings');
  });

  it('does not modify the project state', async () => {
    const projectState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const expectedState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const gateway = new FakeAgentGateway({ proposals: [] });
    const analyzeRefactorings = new AnalyzeRefactorings(
      gateway,
      new FakeProjectRepository(Project.create(projectState)),
    );

    await analyzeRefactorings.execute(
      new AnalyzeRefactoringsCommand('project-1', SourceCode.of('class Order {}')),
    );

    expect(projectState.hasSameModelAs(expectedState)).toBe(true);
  });
});
