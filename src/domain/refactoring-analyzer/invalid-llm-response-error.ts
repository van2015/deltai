export class InvalidLlmResponseError extends Error {
  constructor(reason: string) {
    super(`Invalid LLM response: ${reason}`);
    this.name = 'InvalidLlmResponseError';
  }
}
