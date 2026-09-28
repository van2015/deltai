import { access, constants, stat } from 'node:fs/promises';

import type { ProjectLocation } from '../../domain/project/project-location.js';
import type { ProjectInspection } from '../../application/open-project/project-inspection.js';
import type { ProjectWorkspace } from '../../application/open-project/project-workspace.js';
import type { ProjectSupportDetector } from '../../application/open-project/project-support-detector.js';

export class NodeProjectWorkspace implements ProjectWorkspace {
  constructor(private readonly supportDetector: ProjectSupportDetector) {}

  async inspect(location: ProjectLocation): Promise<ProjectInspection> {
    let information;

    try {
      information = await stat(location.path);
    } catch (error) {
      if (NodeProjectWorkspace.isMissing(error)) {
        return { exists: false, accessible: false, supported: false };
      }

      return { exists: true, accessible: false, supported: false };
    }

    if (!information.isDirectory()) {
      return { exists: true, accessible: true, supported: false };
    }

    try {
      await access(location.path, constants.R_OK | constants.X_OK);
    } catch {
      return { exists: true, accessible: false, supported: false };
    }

    return {
      exists: true,
      accessible: true,
      supported: await this.supportDetector.supports(location.path),
    };
  }

  private static isMissing(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ENOENT'
    );
  }
}
