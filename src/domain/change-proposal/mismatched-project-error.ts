export class MismatchedProjectError extends Error {
  constructor(sourceProjectId: string, targetProjectId: string) {
    super(
      `Proposal source and target states belong to different projects ` +
        `(${sourceProjectId} != ${targetProjectId})`,
    );
    this.name = 'MismatchedProjectError';
  }
}
