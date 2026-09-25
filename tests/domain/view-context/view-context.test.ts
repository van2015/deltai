import { describe, expect, it } from 'vitest';

import { AnnotationNotFoundError } from '@/domain/view-context/annotation-not-found-error.js';
import { ElementNotInStateError } from '@/domain/view-context/element-not-in-state-error.js';
import { InvalidAnnotationTextError } from '@/domain/view-context/invalid-annotation-text-error.js';
import { RelationshipNotInStateError } from '@/domain/view-context/relationship-not-in-state-error.js';
import { ViewContext } from '@/domain/view-context/view-context.js';
import { ViewContextSubmittedError } from '@/domain/view-context/view-context-submitted-error.js';

import { ProjectStateBuilder } from '../../support/builders/project-state.builder.js';

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
});
