import { describe, expect, it } from 'vitest';

import * as projectState from '../../../src/domain/project/project-state/index.js';

describe('project-state package', () => {
  it('is importable', () => {
    expect(projectState).toBeDefined();
  });
});
