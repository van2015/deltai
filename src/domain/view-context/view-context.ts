import { randomUUID } from 'node:crypto';

import type { ProjectState } from '../project/project-state/project-state.js';
import type { ViewContextId } from './view-context-id.js';

export class ViewContext {
  private constructor(
    private readonly contextId: ViewContextId,
    private readonly state: ProjectState | undefined,
    private submitted = false,
  ) {}

  static create(projectState?: ProjectState): ViewContext {
    return new ViewContext(randomUUID(), projectState);
  }

  get id(): ViewContextId {
    return this.contextId;
  }

  get projectState(): ProjectState | undefined {
    return this.state;
  }

  get isSubmitted(): boolean {
    return this.submitted;
  }

  submit(): void {
    if (this.submitted) {
      return;
    }

    this.submitted = true;
    Object.freeze(this);
  }
}
