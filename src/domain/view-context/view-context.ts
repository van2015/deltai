import { randomUUID } from 'node:crypto';

import type { Element } from '../project/project-state/element.js';
import type { ProjectState } from '../project/project-state/project-state.js';
import { AnnotationNotFoundError } from './annotation-not-found-error.js';
import { Annotation } from './annotation.js';
import type { AnnotationId } from './annotation-id.js';
import { ElementNotInStateError } from './element-not-in-state-error.js';
import type { ViewContextId } from './view-context-id.js';
import { RelationshipNotInStateError } from './relationship-not-in-state-error.js';
import { Selection } from './selection.js';
import { ViewContextSubmittedError } from './view-context-submitted-error.js';

export class ViewContext {
  private selectedElements: Selection = Selection.empty();
  private annotationList: Annotation[] = [];

  private constructor(
    private readonly contextId: ViewContextId,
    private readonly state: ProjectState | undefined,
    private submitted = false,
  ) {}

  static create(projectState?: ProjectState): ViewContext {
    return new ViewContext(randomUUID(), projectState);
  }

  get id(): ViewContextId {
    return this.contextId;
  }

  get projectState(): ProjectState | undefined {
    return this.state;
  }

  get isSubmitted(): boolean {
    return this.submitted;
  }

  get selection(): Selection {
    return this.selectedElements;
  }

  get annotations(): readonly Annotation[] {
    return [...this.annotationList];
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

  deselect(elementId: string): void {
    this.ensureNotSubmitted();

    this.selectedElements = Selection.of(
      this.selectedElements.getElements().filter((element) => element.id !== elementId),
    );
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

  annotate(text: string): Annotation {
    this.ensureNotSubmitted();

    const annotation = Annotation.freeText(text);
    this.annotationList.push(annotation);

    return annotation;
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

  submit(): void {
    if (this.submitted) {
      return;
    }

    this.submitted = true;
    Object.freeze(this);
  }

  private ensureNotSubmitted(): void {
    if (this.submitted) {
      throw new ViewContextSubmittedError();
    }
  }

  private ensureElementExists(elementId: string): Element {
    const element = this.state?.getElements().find((candidate) => candidate.id === elementId);

    if (element === undefined) {
      throw new ElementNotInStateError(elementId);
    }

    return element;
  }
}
