export class SourceCode {
  static of(content: string, path?: string): SourceCode {
    return new SourceCode(content, path);
  }

  get content(): string {
    return this.code;
  }

  get path(): string | undefined {
    return this.filePath;
  }

  private constructor(
    private readonly code: string,
    private readonly filePath: string | undefined,
  ) {
    Object.freeze(this);
  }
}
