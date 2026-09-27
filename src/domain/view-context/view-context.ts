import { randomUUID } from 'node:crypto';

import type { Change } from '../change-delta/change.js';
import type { ChangeDelta } from '../change-delta/change-delta.js';
import type { Element } from '../project/project-state/element.js';
import type { ProjectState } from '../project/project-state/project-state.js';
import { AnnotationNotFoundError } from './annotation-not-found-error.js';
import { Annotation } from './annotation.js';
import type { AnnotationId } from './annotation-id.js';
import { ChangeDeltaNotAssociatedError } from './change-delta-not-associated-error.js';
import { ChangeNotInDeltaError } from './change-not-in-delta-error.js';
import { ElementNotInStateError } from './element-not-in-state-error.js';
import type { ViewContextId } from './view-context-id.js';
import { RelationshipNotInStateError } from './relationship-not-in-state-error.js';
import { RejectedChange } from './rejected-change.js';
import { Selection } from './selection.js';
import { ViewContextSubmittedError } from './view-context-submitted-error.js';

export class ViewContext {
  static create(projectState?: ProjectState, delta?: ChangeDelta): ViewContext {
    return new ViewContext(randomUUID(), projectState, delta);
  }

  private annotationList: Annotation[] = [];
  private rejectedChangeList: RejectedChange[] = [];
  private selectedElements: Selection = Selection.empty();

  get annotations(): readonly Annotation[] {
    return [...this.annotationList];
  }

  get delta(): ChangeDelta | undefined {
    return this.associatedDelta;
  }

  get id(): ViewContextId {
    return this.contextId;
  }

  get isSubmitted(): boolean {
    return this.submitted;
  }

  get projectState(): ProjectState | undefined {
    return this.state;
  }

  get rejectedChanges(): readonly RejectedChange[] {
    return [...this.rejectedChangeList];
  }

  get selection(): Selection {
    return this.selectedElements;
  }

  private constructor(
    private readonly contextId: ViewContextId,
    private readonly state: ProjectState | undefined,
    private readonly associatedDelta: ChangeDelta | undefined,
    private submitted = false,
  ) {}

  private ensureElementExists(elementId: string): Element {
    const element = this.state?.getElements().find((candidate) => candidate.id === elementId);

    if (element === undefined) {
      throw new ElementNotInStateError(elementId);
    }

    return element;
  }

  private ensureNotSubmitted(): void {
    if (this.submitted) {
      throw new ViewContextSubmittedError();
    }
  }

  annotate(text: string): Annotation {
    this.ensureNotSubmitted();

    const annotation = Annotation.freeText(text);
    this.annotationList.push(annotation);

    return annotation;
  }

  annotateElement(elementId: string, text: string): Annotation {
    this.ensureNotSubmitted();
    this.ensureElementExists(elementId);

    const annotation = Annotation.forElement(elementId, text);
    this.annotationList.push(annotation);

    return annotation;
  }

  annotateRelationship(relationshipId: string, text: string): Annotation {
    this.ensureNotSubmitted();

    const relationship = this.state
      ?.getRelationships()
      .find((candidate) => candidate.id === relationshipId);

    if (relationship === undefined) {
      throw new RelationshipNotInStateError(relationshipId);
    }

    const annotation = Annotation.forRelationship(relationshipId, text);
    this.annotationList.push(annotation);

    return annotation;
  }

  deselect(elementId: string): void {
    this.ensureNotSubmitted();

    this.selectedElements = Selection.of(
      this.selectedElements.getElements().filter((element) => element.id !== elementId),
    );
  }

  rejectChange(change: Change): RejectedChange {
    this.ensureNotSubmitted();

    if (this.associatedDelta === undefined) {
      throw new ChangeDeltaNotAssociatedError();
    }

    if (!this.associatedDelta.contains(change)) {
      throw new ChangeNotInDeltaError();
    }

    const existing = this.rejectedChangeList.find((rejected) =>
      rejected.change.isEquivalentTo(change),
    );

    if (existing !== undefined) {
      return existing;
    }

    const rejected = RejectedChange.of(change);
    this.rejectedChangeList.push(rejected);

    return rejected;
  }

  removeAnnotation(annotationId: AnnotationId): void {
    this.ensureNotSubmitted();

    const index = this.annotationList.findIndex(
      (annotation) => annotation.id === annotationId,
    );

    if (index === -1) {
      throw new AnnotationNotFoundError(annotationId);
    }

    this.annotationList.splice(index, 1);
  }

  select(elementId: string): void {
    this.ensureNotSubmitted();

    const element = this.ensureElementExists(elementId);

    if (this.selectedElements.contains(elementId)) {
      return;
    }

    this.selectedElements = Selection.of([
      ...this.selectedElements.getElements(),
      element,
    ]);
  }

  submit(): void {
    if (this.submitted) {
      return;
    }

    this.submitted = true;
    Object.freeze(this);
  }
}
