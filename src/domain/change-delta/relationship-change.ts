import type { Relationship } from '../project/project-state/relationship.js';
import type { ChangeType } from './change-type.js';

export interface RelationshipChange {
  readonly type: ChangeType;
  readonly relationship: Relationship;
}
