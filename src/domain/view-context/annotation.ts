import { randomUUID } from 'node:crypto';

import type { AnnotationId } from './annotation-id.js';
import { InvalidAnnotationTextError } from './invalid-annotation-text-error.js';

export class Annotation {
  private static validate(text: string): string {
    if (text.trim().length === 0) {
      throw new InvalidAnnotationTextError();
    }

    return text;
  }

  static forElement(elementId: string, text: string): Annotation {
    return new Annotation(randomUUID(), Annotation.validate(text), elementId, undefined);
  }

  static forRelationship(relationshipId: string, text: string): Annotation {
    return new Annotation(randomUUID(), Annotation.validate(text), undefined, relationshipId);
  }

  static freeText(text: string): Annotation {
    return new Annotation(randomUUID(), Annotation.validate(text), undefined, undefined);
  }

  get elementId(): string | undefined {
    return this.element;
  }

  get id(): AnnotationId {
    return this.annotationId;
  }

  get relationshipId(): string | undefined {
    return this.relationship;
  }

  get text(): string {
    return this.content;
  }

  private constructor(
    private readonly annotationId: AnnotationId,
    private readonly content: string,
    private readonly element: string | undefined,
    private readonly relationship: string | undefined,
  ) {
    Object.freeze(this);
  }
}
