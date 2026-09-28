import { resolve } from 'node:path';

export class ProjectLocation {
  private constructor(private readonly canonicalPath: string) {
    Object.freeze(this);
  }

  static of(path: string): ProjectLocation {
    return new ProjectLocation(resolve(path));
  }

  get path(): string {
    return this.canonicalPath;
  }
}
