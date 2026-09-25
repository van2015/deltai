export class InvalidAnnotationTextError extends Error {
  constructor() {
    super('Annotation text cannot be empty');
    this.name = 'InvalidAnnotationTextError';
  }
}
