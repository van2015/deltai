import { describe, expect, it } from 'vitest';

import { ChangeProposal } from '@/domain/change-proposal/index.js';
import { ProjectState } from '@/domain/project/project-state/index.js';

describe('ChangeProposal', () => {
  it('is created in Generated state', () => {
    const sourceState = ProjectState.create({ elements: [], relationships: [] });
    const targetState = ProjectState.create({ elements: [], relationships: [] });

    const proposal = ChangeProposal.create(sourceState, targetState);

    expect(proposal.status).toBe('Generated');
  });
});
