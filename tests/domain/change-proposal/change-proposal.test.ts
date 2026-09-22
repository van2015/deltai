import { describe, expect, it } from 'vitest';

import {
  ChangeProposal,
  InvalidProposalTransitionError,
  ProposalStatus,
} from '@/domain/change-proposal/index.js';
import { ProjectState } from '@/domain/project/project-state/index.js';

const createProposal = (): ChangeProposal =>
  ChangeProposal.create(
    ProjectState.create({ elements: [], relationships: [] }),
    ProjectState.create({ elements: [], relationships: [] }),
  );

describe('ChangeProposal', () => {
  it('is created in Generated state', () => {
    const proposal = createProposal();

    expect(proposal.status).toBe(ProposalStatus.Generated);
  });
});

describe('ChangeProposal lifecycle', () => {
  it('can be moved from Generated to UnderReview', () => {
    const proposal = createProposal();

    proposal.review();

    expect(proposal.status).toBe(ProposalStatus.UnderReview);
  });

  it('can be accepted while under review', () => {
    const proposal = createProposal();
    proposal.review();

    proposal.accept();

    expect(proposal.status).toBe(ProposalStatus.Accepted);
  });

  it('can be rejected while under review', () => {
    const proposal = createProposal();
    proposal.review();

    proposal.reject();

    expect(proposal.status).toBe(ProposalStatus.Rejected);
  });

  it('can be superseded while under review', () => {
    const proposal = createProposal();
    proposal.review();

    proposal.supersede();

    expect(proposal.status).toBe(ProposalStatus.Superseded);
  });

  it('can be applied once accepted', () => {
    const proposal = createProposal();
    proposal.review();
    proposal.accept();

    proposal.apply();

    expect(proposal.status).toBe(ProposalStatus.Applying);
  });

  it('can be marked as applied once applying succeeds', () => {
    const proposal = createProposal();
    proposal.review();
    proposal.accept();
    proposal.apply();

    proposal.succeed();

    expect(proposal.status).toBe(ProposalStatus.Applied);
  });

  it('can be marked as failed once applying fails', () => {
    const proposal = createProposal();
    proposal.review();
    proposal.accept();
    proposal.apply();

    proposal.fail();

    expect(proposal.status).toBe(ProposalStatus.ApplicationFailed);
  });

  it('can be retried after an application failure', () => {
    const proposal = createProposal();
    proposal.review();
    proposal.accept();
    proposal.apply();
    proposal.fail();

    proposal.retry();

    expect(proposal.status).toBe(ProposalStatus.Applying);
  });

  it('cannot be accepted while generated', () => {
    const proposal = createProposal();

    expect(() => proposal.accept()).toThrow(InvalidProposalTransitionError);
    expect(proposal.status).toBe(ProposalStatus.Generated);
  });

  it('cannot be rejected while generated', () => {
    const proposal = createProposal();

    expect(() => proposal.reject()).toThrow(InvalidProposalTransitionError);
    expect(proposal.status).toBe(ProposalStatus.Generated);
  });

  it('cannot be accepted after being rejected', () => {
    const proposal = createProposal();
    proposal.review();
    proposal.reject();

    expect(() => proposal.accept()).toThrow(InvalidProposalTransitionError);
    expect(proposal.status).toBe(ProposalStatus.Rejected);
  });

  it('cannot be applied before being accepted', () => {
    const proposal = createProposal();

    expect(() => proposal.apply()).toThrow(InvalidProposalTransitionError);
    expect(proposal.status).toBe(ProposalStatus.Generated);
  });

  it('cannot be applied after being rejected', () => {
    const proposal = createProposal();
    proposal.review();
    proposal.reject();

    expect(() => proposal.apply()).toThrow(InvalidProposalTransitionError);
    expect(proposal.status).toBe(ProposalStatus.Rejected);
  });

  it('cannot be applied after being superseded', () => {
    const proposal = createProposal();
    proposal.review();
    proposal.supersede();

    expect(() => proposal.apply()).toThrow(InvalidProposalTransitionError);
    expect(proposal.status).toBe(ProposalStatus.Superseded);
  });

  it('cannot be applied after being applied', () => {
    const proposal = createProposal();
    proposal.review();
    proposal.accept();
    proposal.apply();
    proposal.succeed();

    expect(() => proposal.apply()).toThrow(InvalidProposalTransitionError);
    expect(proposal.status).toBe(ProposalStatus.Applied);
  });
});
