import { ProjectState } from '@/domain/project/project-state/project-state.js';
import type { Element } from '@/domain/project/project-state/element.js';
import type { ProjectId } from '@/domain/project/project-state/project-id.js';
import type { ProjectModel } from '@/domain/project/project-state/project-model.js';
import type { Relationship } from '@/domain/project/project-state/relationship.js';

const DEFAULT_PROJECT_ID = 'project-1';

export class ProjectStateBuilder {
  private projectId: ProjectId = DEFAULT_PROJECT_ID;
  private model: ProjectModel = { elements: [], relationships: [] };

  static aState(): ProjectStateBuilder {
    return new ProjectStateBuilder();
  }

  withProjectId(projectId: ProjectId): this {
    this.projectId = projectId;
    return this;
  }

  withModel(model: ProjectModel): this {
    this.model = model;
    return this;
  }

  withElement(element: Element): this {
    this.model = { ...this.model, elements: [...this.model.elements, element] };
    return this;
  }

  withRelationship(relationship: Relationship): this {
    this.model = {
      ...this.model,
      relationships: [...this.model.relationships, relationship],
    };
    return this;
  }

  build(): ProjectState {
    return ProjectState.create(this.projectId, this.model);
  }
}
