import { randomUUID } from 'node:crypto';

import type { ProjectState } from '../project/project-state/project-state.js';
import { ElementNotInStateError } from './element-not-in-state-error.js';
import type { ViewContextId } from './view-context-id.js';
import { Selection } from './selection.js';
import { ViewContextSubmittedError } from './view-context-submitted-error.js';

export class ViewContext {
  private selectedElements: Selection = Selection.empty();

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

  get selection(): Selection {
    return this.selectedElements;
  }

  select(elementId: string): void {
    this.ensureNotSubmitted();

    const element = this.state
      ?.getElements()
      .find((candidate) => candidate.id === elementId);

    if (element === undefined) {
      throw new ElementNotInStateError(elementId);
    }

    if (this.selectedElements.contains(elementId)) {
      return;
    }

    this.selectedElements = Selection.of([
      ...this.selectedElements.getElements(),
      element,
    ]);
  }

  deselect(elementId: string): void {
    this.ensureNotSubmitted();

    this.selectedElements = Selection.of(
      this.selectedElements.getElements().filter((element) => element.id !== elementId),
    );
  }

  submit(): void {
    if (this.submitted) {
      return;
    }

    this.submitted = true;
    Object.freeze(this);
  }

  private ensureNotSubmitted(): void {
    if (this.submitted) {
      throw new ViewContextSubmittedError();
    }
  }
}
