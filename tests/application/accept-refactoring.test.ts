import { describe, expect, it } from 'vitest';

import { AcceptRefactoringCommand } from '@/application/accept-refactoring/accept-refactoring-command.js';
import { AcceptRefactoring } from '@/application/accept-refactoring/accept-refactoring.js';
import { ChangeProposal } from '@/domain/change-proposal/change-proposal.js';
import { Project } from '@/domain/project/project.js';
import { RefactoringProposal } from '@/domain/refactoring-analyzer/refactoring-proposal.js';
import { CodeLocation } from '@/domain/refactoring-analyzer/code-location.js';

import { ProjectStateBuilder } from '../support/builders/project-state.builder.js';
import { FakeProjectRepository } from '../support/fakes/fake-project-repository.js';
import { FakeRefactoringEngine } from '../support/fakes/fake-refactoring-engine.js';

const createProposal = (): RefactoringProposal =>
  RefactoringProposal.of({
    type: 'long-method',
    description: 'extract-method',
    rationale: 'The method is too long',
    target: CodeLocation.of('src/order.ts', 'processOrder'),
  });

describe('AcceptRefactoring', () => {
  it('turns an accepted agent proposal into a ChangeProposal', async () => {
    const sourceState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const targetState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .withElement({ id: 'OrderValidator', name: 'OrderValidator' })
      .build();
    const project = Project.create(sourceState);
    const engine = new FakeRefactoringEngine(targetState);
    const acceptRefactoring = new AcceptRefactoring(
      new FakeProjectRepository(project),
      engine,
    );

    const changeProposal = await acceptRefactoring.execute(
      new AcceptRefactoringCommand('project-1', createProposal()),
    );

    expect(changeProposal).toBeInstanceOf(ChangeProposal);
    expect(changeProposal.sourceState).toBe(sourceState);
    expect(changeProposal.targetState).toBe(targetState);
  });

  it('passes the current state and agent proposal to the engine', async () => {
    const sourceState = ProjectStateBuilder.aState().build();
    const project = Project.create(sourceState);
    const proposal = createProposal();
    const engine = new FakeRefactoringEngine(sourceState);
    const acceptRefactoring = new AcceptRefactoring(
      new FakeProjectRepository(project),
      engine,
    );

    await acceptRefactoring.execute(new AcceptRefactoringCommand('project-1', proposal));

    expect(engine.sourceState).toBe(sourceState);
    expect(engine.proposal).toBe(proposal);
  });

  it('does not modify the project while creating the ChangeProposal', async () => {
    const sourceState = ProjectStateBuilder.aState().build();
    const targetState = ProjectStateBuilder.aState()
      .withElement({ id: 'OrderValidator', name: 'OrderValidator' })
      .build();
    const project = Project.create(sourceState);
    const acceptRefactoring = new AcceptRefactoring(
      new FakeProjectRepository(project),
      new FakeRefactoringEngine(targetState),
    );

    await acceptRefactoring.execute(
      new AcceptRefactoringCommand('project-1', createProposal()),
    );

    expect(project.currentState).toBe(sourceState);
  });
});
