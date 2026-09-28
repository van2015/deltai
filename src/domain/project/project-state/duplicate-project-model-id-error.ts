export class DuplicateProjectModelIdError extends Error {
  constructor(kind: 'element' | 'relationship', id: string) {
    super(`Project model contains duplicate ${kind} id "${id}"`);
    this.name = 'DuplicateProjectModelIdError';
  }
}
