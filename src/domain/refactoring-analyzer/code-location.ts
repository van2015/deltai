export class CodeLocation {
  private constructor(
    private readonly filePath: string,
    private readonly methodName: string,
  ) {
    Object.freeze(this);
  }

  static of(path: string, method: string): CodeLocation {
    return new CodeLocation(path, method);
  }

  get path(): string {
    return this.filePath;
  }

  get method(): string {
    return this.methodName;
  }
}
