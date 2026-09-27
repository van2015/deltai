import type { Element } from '../project/project-state/element.js';

export class Selection {
  static empty(): Selection {
    return new Selection([]);
  }

  static of(elements: readonly Element[]): Selection {
    const uniqueById = new Map(elements.map((element) => [element.id, element]));

    return new Selection([...uniqueById.values()]);
  }

  private constructor(private readonly selectedElements: readonly Element[]) {
    Object.freeze(this.selectedElements);
  }

  contains(elementId: string): boolean {
    return this.selectedElements.some((element) => element.id === elementId);
  }

  getElements(): readonly Element[] {
    return [...this.selectedElements];
  }

  isEmpty(): boolean {
    return this.selectedElements.length === 0;
  }

  size(): number {
    return this.selectedElements.length;
  }
}
