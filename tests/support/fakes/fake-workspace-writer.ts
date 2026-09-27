import type { ProjectState } from '@/domain/project/project-state/project-state.js';
import type { WorkspaceWriter } from '@/application/apply-change-proposal/workspace-writer.js';

export class FakeWorkspaceWriter implements WorkspaceWriter {
  appliedState: ProjectState | undefined;
  shouldFail = false;

  apply(targetState: ProjectState): void {
    if (this.shouldFail) {
      throw new Error('workspace application failed');
    }

    this.appliedState = targetState;
  }
}
