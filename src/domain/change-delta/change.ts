import type { Element } from '../project/project-state/element.js';
import type { Relationship } from '../project/project-state/relationship.js';
import type { ChangeType } from './change-type.js';

type ChangeSubject = 'element' | 'relationship';

export class Change {
  private constructor(
    readonly type: ChangeType,
    private readonly subject: Element | Relationship,
    private readonly subjectType: ChangeSubject,
  ) {
    Object.freeze(this.subject);
    Object.freeze(this);
  }

  static forElement(type: ChangeType, element: Element): Change {
    return new Change(type, { ...element }, 'element');
  }

  static forRelationship(type: ChangeType, relationship: Relationship): Change {
    return new Change(type, { ...relationship }, 'relationship');
  }

  get element(): Readonly<Element> | undefined {
    return this.subjectType === 'element'
      ? (this.subject as Element)
      : undefined;
  }

  get relationship(): Readonly<Relationship> | undefined {
    return this.subjectType === 'relationship'
      ? (this.subject as Relationship)
      : undefined;
  }

  isEquivalentTo(otherChange: Change): boolean {
    if (this.type !== otherChange.type || this.subjectType !== otherChange.subjectType) {
      return false;
    }

    return (
      this.subject.id === otherChange.subject.id &&
      this.subject.name === otherChange.subject.name
    );
  }
}
