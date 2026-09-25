import type { Element } from './element.js';
import type { Relationship } from './relationship.js';

export interface ProjectModel {
  readonly elements: readonly Element[];
  readonly relationships: readonly Relationship[];
}
