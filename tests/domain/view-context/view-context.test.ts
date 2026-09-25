import { describe, expect, it } from 'vitest';

import { Change } from '@/domain/change-delta/change.js';
import { ChangeDelta } from '@/domain/change-delta/change-delta.js';
import { ChangeType } from '@/domain/change-delta/change-type.js';
import { ChangeProposal } from '@/domain/change-proposal/change-proposal.js';
import { AnnotationNotFoundError } from '@/domain/view-context/annotation-not-found-error.js';
import { ChangeDeltaNotAssociatedError } from '@/domain/view-context/change-delta-not-associated-error.js';
import { ChangeNotInDeltaError } from '@/domain/view-context/change-not-in-delta-error.js';
import { ElementNotInStateError } from '@/domain/view-context/element-not-in-state-error.js';
import { InvalidAnnotationTextError } from '@/domain/view-context/invalid-annotation-text-error.js';
import { RelationshipNotInStateError } from '@/domain/view-context/relationship-not-in-state-error.js';
import { ViewContext } from '@/domain/view-context/view-context.js';
import { ViewContextSubmittedError } from '@/domain/view-context/view-context-submitted-error.js';

import { ProjectStateBuilder } from '../../support/builders/project-state.builder.js';

const buildStatesWithDelta = () => {
  const sourceState = ProjectStateBuilder.aState()
    .withElement({ id: 'B', name: 'B' })
    .withElement({ id: 'C', name: 'C' })
    .build();
  const targetState = ProjectStateBuilder.aState()
    .withElement({ id: 'A', name: 'A' })
    .withElement({ id: 'B', name: 'B2' })
    .build();

  return { sourceState, targetState, delta: ChangeDelta.between(sourceState, targetState) };
};

const firstChangeOf = (delta: ChangeDelta): Change => {
  const change = delta.changes[0];

  if (change === undefined) {
    throw new Error('Expected the delta to contain changes');
  }

  return change;
};

const changeOfType = (delta: ChangeDelta, type: ChangeType): Change => {
  const change = delta.changes.find((candidate) => candidate.type === type);

  if (change === undefined) {
    throw new Error(`Expected the delta to contain a ${type} change`);
  }

  return change;
};

describe('ViewContext', () => {
  it('can be created empty', () => {
    const context = ViewContext.create();

    expect(context.projectState).toBeUndefined();
    expect(context.isSubmitted).toBe(false);
  });

  it('can be associated with a project state', () => {
    const projectState = ProjectStateBuilder.aState().build();

    const context = ViewContext.create(projectState);

    expect(context.projectState).toBe(projectState);
  });

  it('preserves the project state it was created with', () => {
    const projectState = ProjectStateBuilder.aState().build();

    const context = ViewContext.create(projectState);

    expect(context.projectState).toBe(projectState);
  });

  it('does not modify the project state when created', () => {
    const projectState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const expectedState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();

    ViewContext.create(projectState);

    expect(projectState.hasSameModelAs(expectedState)).toBe(true);
  });

  it('has its own identity', () => {
    const firstContext = ViewContext.create();
    const secondContext = ViewContext.create();

    expect(firstContext.id).not.toBe(secondContext.id);
  });

  it('is immutable after being submitted', () => {
    const projectState = ProjectStateBuilder.aState().build();
    const replacementState = ProjectStateBuilder.aState().build();
    const context = ViewContext.create(projectState);

    context.submit();

    expect(context.isSubmitted).toBe(true);
    expect(Object.isFrozen(context)).toBe(true);
    expect(() => {
      (context as unknown as { projectState: typeof replacementState }).projectState =
        replacementState;
    }).toThrow();
    expect(context.projectState).toBe(projectState);
  });

  it('can contain one selected element', () => {
    const projectState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const context = ViewContext.create(projectState);

    context.select('Order');

    expect(context.selection.getElements().map((element) => element.id)).toEqual(['Order']);
  });

  it('can contain several selected elements', () => {
    const projectState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .withElement({ id: 'Customer', name: 'Customer' })
      .withElement({ id: 'Payment', name: 'Payment' })
      .build();
    const context = ViewContext.create(projectState);

    context.select('Order');
    context.select('Customer');
    context.select('Payment');

    expect(context.selection.getElements().map((element) => element.id)).toEqual([
      'Order',
      'Customer',
      'Payment',
    ]);
  });

  it('does not include an element twice in the selection', () => {
    const projectState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const context = ViewContext.create(projectState);

    context.select('Order');
    context.select('Order');

    expect(context.selection.size()).toBe(1);
  });

  it('only references elements that exist in the project state', () => {
    const projectState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const context = ViewContext.create(projectState);

    expect(() => context.select('Unknown')).toThrow(ElementNotInStateError);
    expect(context.selection.isEmpty()).toBe(true);
  });

  it('can contain an empty selection', () => {
    const projectState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const context = ViewContext.create(projectState);

    expect(context.selection.isEmpty()).toBe(true);

    context.select('Order');
    context.deselect('Order');

    expect(context.selection.isEmpty()).toBe(true);
  });

  it('does not modify the project state when the selection changes', () => {
    const projectState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .withElement({ id: 'Customer', name: 'Customer' })
      .build();
    const expectedState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .withElement({ id: 'Customer', name: 'Customer' })
      .build();
    const context = ViewContext.create(projectState);

    context.select('Order');
    context.select('Customer');
    context.deselect('Order');

    expect(projectState.hasSameModelAs(expectedState)).toBe(true);
  });

  it('can contain an annotation', () => {
    const projectState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const context = ViewContext.create(projectState);

    context.annotateElement('Order', 'Esta clase no debe conocer PaymentGateway');

    expect(context.annotations).toHaveLength(1);
  });

  it('associates an annotation with an element', () => {
    const projectState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const context = ViewContext.create(projectState);

    const annotation = context.annotateElement('Order', 'No depender de Payment');

    expect(context.annotations[0]).toBe(annotation);
    expect(annotation.elementId).toBe('Order');
    expect(annotation.relationshipId).toBeUndefined();
  });

  it('associates an annotation with a relationship', () => {
    const projectState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .withElement({ id: 'Payment', name: 'Payment' })
      .withRelationship({ id: 'Order->Payment', name: 'depends' })
      .build();
    const context = ViewContext.create(projectState);

    const annotation = context.annotateRelationship(
      'Order->Payment',
      'Order must not depend directly on Payment',
    );

    expect(annotation.relationshipId).toBe('Order->Payment');
    expect(annotation.elementId).toBeUndefined();
    expect(context.annotations).toHaveLength(1);
  });

  it('can contain several annotations', () => {
    const projectState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .withRelationship({ id: 'Order->Customer', name: 'owns' })
      .build();
    const context = ViewContext.create(projectState);

    context.annotateElement('Order', 'First note');
    context.annotateRelationship('Order->Customer', 'Second note');
    context.annotate('Third note');

    expect(context.annotations).toHaveLength(3);
  });

  it('stores free text in an annotation', () => {
    const projectState = ProjectStateBuilder.aState().build();
    const context = ViewContext.create(projectState);

    const annotation = context.annotate('Prefiero composición sobre herencia.');

    expect(annotation.text).toBe('Prefiero composición sobre herencia.');
    expect(annotation.elementId).toBeUndefined();
    expect(annotation.relationshipId).toBeUndefined();
  });

  it('identifies the element an annotation refers to', () => {
    const projectState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const context = ViewContext.create(projectState);

    const annotation = context.annotateElement('Order', 'Add a status attribute');

    expect(annotation.elementId).toBe('Order');
    expect(
      context.annotations.find((candidate) => candidate.elementId === 'Order'),
    ).toBe(annotation);
  });

  it('does not modify the project state when an annotation is removed', () => {
    const projectState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const expectedState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const context = ViewContext.create(projectState);
    const annotation = context.annotateElement('Order', 'Temporary note');

    context.removeAnnotation(annotation.id);

    expect(context.annotations).toHaveLength(0);
    expect(projectState.hasSameModelAs(expectedState)).toBe(true);
  });

  it('rejects annotations for elements that do not exist in the project state', () => {
    const projectState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const context = ViewContext.create(projectState);

    expect(() => context.annotateElement('Unknown', 'Note')).toThrow(ElementNotInStateError);
    expect(context.annotations).toHaveLength(0);
  });

  it('rejects annotations for relationships that do not exist in the project state', () => {
    const projectState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const context = ViewContext.create(projectState);

    expect(() => context.annotateRelationship('Unknown->Unknown', 'Note')).toThrow(
      RelationshipNotInStateError,
    );
    expect(context.annotations).toHaveLength(0);
  });

  it('rejects empty annotation text', () => {
    const projectState = ProjectStateBuilder.aState().build();
    const context = ViewContext.create(projectState);

    expect(() => context.annotate('   ')).toThrow(InvalidAnnotationTextError);
    expect(context.annotations).toHaveLength(0);
  });

  it('cannot remove an annotation that does not exist', () => {
    const projectState = ProjectStateBuilder.aState().build();
    const context = ViewContext.create(projectState);

    expect(() => context.removeAnnotation('missing-id')).toThrow(AnnotationNotFoundError);
  });

  it('cannot add or remove annotations after being submitted', () => {
    const projectState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const context = ViewContext.create(projectState);
    const annotation = context.annotateElement('Order', 'Kept note');

    context.submit();

    expect(() => context.annotate('New note')).toThrow(ViewContextSubmittedError);
    expect(() => context.removeAnnotation(annotation.id)).toThrow(ViewContextSubmittedError);
    expect(context.annotations).toHaveLength(1);
  });

  it('can express the rejection of a change', () => {
    const { sourceState, delta } = buildStatesWithDelta();
    const context = ViewContext.create(sourceState, delta);
    const change = firstChangeOf(delta);

    const rejected = context.rejectChange(change);

    expect(context.rejectedChanges).toHaveLength(1);
    expect(rejected.change).toBe(change);
  });

  it('can reject a concrete change of a change delta', () => {
    const { sourceState, delta } = buildStatesWithDelta();
    const context = ViewContext.create(sourceState, delta);
    const modifiedChange = changeOfType(delta, ChangeType.Modified);

    context.rejectChange(modifiedChange);

    expect(
      context.rejectedChanges[0]?.change.isEquivalentTo(modifiedChange),
    ).toBe(true);
    expect(context.rejectedChanges).toHaveLength(1);
  });

  it('can reject several changes', () => {
    const { sourceState, delta } = buildStatesWithDelta();
    const context = ViewContext.create(sourceState, delta);

    for (const change of delta.changes) {
      context.rejectChange(change);
    }

    expect(context.rejectedChanges).toHaveLength(delta.changes.length);
  });

  it('does not modify the original change proposal when a change is rejected', () => {
    const { sourceState, targetState, delta } = buildStatesWithDelta();
    const proposal = ChangeProposal.create(sourceState, targetState);
    const deltaBefore = ChangeDelta.from(proposal);
    const statusBefore = proposal.status;
    const context = ViewContext.create(sourceState, delta);

    context.rejectChange(firstChangeOf(delta));

    expect(proposal.status).toBe(statusBefore);
    expect(ChangeDelta.from(proposal).isEquivalentTo(deltaBefore)).toBe(true);
  });

  it('does not modify the project state when a change is rejected', () => {
    const { sourceState, targetState, delta } = buildStatesWithDelta();
    const sourceBefore = ProjectStateBuilder.aState()
      .withElement({ id: 'B', name: 'B' })
      .withElement({ id: 'C', name: 'C' })
      .build();
    const targetBefore = ProjectStateBuilder.aState()
      .withElement({ id: 'A', name: 'A' })
      .withElement({ id: 'B', name: 'B2' })
      .build();
    const context = ViewContext.create(sourceState, delta);

    context.rejectChange(firstChangeOf(delta));

    expect(sourceState.hasSameModelAs(sourceBefore)).toBe(true);
    expect(targetState.hasSameModelAs(targetBefore)).toBe(true);
  });

  it('associates the rejection with the rejected change', () => {
    const { sourceState, delta } = buildStatesWithDelta();
    const context = ViewContext.create(sourceState, delta);
    const addedChange = changeOfType(delta, ChangeType.Added);

    const rejected = context.rejectChange(addedChange);

    expect(rejected.change).toBe(addedChange);
    expect(rejected.elementId).toBe('A');
    expect(rejected.relationshipId).toBeUndefined();
    expect(context.rejectedChanges[0]).toBe(rejected);
  });

  it('rejects changes that do not belong to the associated delta', () => {
    const { sourceState, delta } = buildStatesWithDelta();
    const context = ViewContext.create(sourceState, delta);
    const foreignChange = Change.forElement(ChangeType.Added, {
      id: 'Invoice',
      name: 'Invoice',
    });

    expect(() => context.rejectChange(foreignChange)).toThrow(ChangeNotInDeltaError);
    expect(context.rejectedChanges).toHaveLength(0);
  });

  it('rejects changes when no delta is associated', () => {
    const { delta } = buildStatesWithDelta();
    const context = ViewContext.create();

    expect(() => context.rejectChange(firstChangeOf(delta))).toThrow(
      ChangeDeltaNotAssociatedError,
    );
  });

  it('does not duplicate a rejected change', () => {
    const { sourceState, delta } = buildStatesWithDelta();
    const context = ViewContext.create(sourceState, delta);
    const change = firstChangeOf(delta);

    const firstRejection = context.rejectChange(change);
    const secondRejection = context.rejectChange(change);

    expect(context.rejectedChanges).toHaveLength(1);
    expect(secondRejection).toBe(firstRejection);
  });

  it('cannot reject changes after being submitted', () => {
    const { sourceState, delta } = buildStatesWithDelta();
    const context = ViewContext.create(sourceState, delta);

    context.rejectChange(firstChangeOf(delta));
    context.submit();

    expect(() => context.rejectChange(changeOfType(delta, ChangeType.Modified))).toThrow(
      ViewContextSubmittedError,
    );
    expect(context.rejectedChanges).toHaveLength(1);
  });
});
