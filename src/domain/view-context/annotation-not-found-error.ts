export class AnnotationNotFoundError extends Error {
  constructor(annotationId: string) {
    super(`Annotation "${annotationId}" does not exist in this view context`);
    this.name = 'AnnotationNotFoundError';
  }
}
