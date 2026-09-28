import type { ProjectLocation } from '@/domain/project/project-location.js';
import type { ProjectInspection } from '@/application/open-project/project-inspection.js';
import type { ProjectWorkspace } from '@/application/open-project/project-workspace.js';

export class FakeProjectWorkspace implements ProjectWorkspace {
  inspectedLocations: ProjectLocation[] = [];

  constructor(private readonly inspection: ProjectInspection) {}

  async inspect(location: ProjectLocation): Promise<ProjectInspection> {
    this.inspectedLocations.push(location);

    return this.inspection;
  }
}
