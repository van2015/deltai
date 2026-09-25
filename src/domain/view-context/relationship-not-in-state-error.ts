export class RelationshipNotInStateError extends Error {
  constructor(relationshipId: string) {
    super(`Relationship "${relationshipId}" does not exist in the associated project state`);
    this.name = 'RelationshipNotInStateError';
  }
}
