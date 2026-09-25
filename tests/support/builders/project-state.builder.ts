import { ProjectState } from '@/domain/project/project-state/index.js';
import type {
  Element,
  ProjectId,
  ProjectModel,
  Relationship,
} from '@/domain/project/project-state/index.js';

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
