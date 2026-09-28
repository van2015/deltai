export type SourceLanguage = 'typescript' | 'javascript' | 'unknown';

export class SourceFile {
  private constructor(
    private readonly filePath: string,
    private readonly fileContent: string,
    private readonly fileLanguage: SourceLanguage,
  ) {
    Object.freeze(this);
  }

  static of(path: string, content: string, language: SourceLanguage): SourceFile {
    return new SourceFile(path, content, language);
  }

  get path(): string {
    return this.filePath;
  }

  get content(): string {
    return this.fileContent;
  }

  get language(): SourceLanguage {
    return this.fileLanguage;
  }
}
