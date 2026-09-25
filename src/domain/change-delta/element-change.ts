import type { Element } from '../project/project-state/element.js';
import type { ChangeType } from './change-type.js';

export interface ElementChange {
  readonly type: ChangeType;
  readonly element: Element;
}
