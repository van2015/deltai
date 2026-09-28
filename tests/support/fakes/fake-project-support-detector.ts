import type { ProjectSupportDetector } from '@/application/open-project/project-support-detector.js';

export class FakeProjectSupportDetector implements ProjectSupportDetector {
  readonly inspectedPaths: string[] = [];

  constructor(private readonly supported: boolean) {}

  async supports(path: string): Promise<boolean> {
    this.inspectedPaths.push(path);

    return this.supported;
  }
}
