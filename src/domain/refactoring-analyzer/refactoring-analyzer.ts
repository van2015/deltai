import { InvalidLlmResponseError } from './invalid-llm-response-error.js';
import { CodeLocation } from './code-location.js';
import type { LlmClient } from './llm-client.js';
import { RefactoringProposal } from './refactoring-proposal.js';
import type { SourceCode } from './source-code.js';

export class RefactoringAnalyzer {
  private static parseProposals(response: string): readonly RefactoringProposal[] {
    let parsed: unknown;

    try {
      parsed = JSON.parse(response);
    } catch {
      throw new InvalidLlmResponseError('response is not valid JSON');
    }

    if (!Array.isArray(parsed)) {
      throw new InvalidLlmResponseError('response is not a JSON array');
    }

    return parsed.map((item) => RefactoringAnalyzer.toProposal(item));
  }

  private static toProposal(value: unknown): RefactoringProposal {
    if (typeof value !== 'object' || value === null) {
      throw new InvalidLlmResponseError('proposal is not an object');
    }

    const proposal = value as Record<string, unknown>;
    const target = proposal.target;

    if (typeof proposal.type !== 'string') {
      throw new InvalidLlmResponseError('proposal is missing "type"');
    }

    if (typeof proposal.description !== 'string') {
      throw new InvalidLlmResponseError('proposal is missing "description"');
    }

    if (typeof proposal.rationale !== 'string') {
      throw new InvalidLlmResponseError('proposal is missing "rationale"');
    }

    if (typeof target !== 'object' || target === null) {
      throw new InvalidLlmResponseError('proposal is missing "target"');
    }

    const targetFields = target as Record<string, unknown>;

    if (typeof targetFields.path !== 'string' || typeof targetFields.method !== 'string') {
      throw new InvalidLlmResponseError('target is missing "path" or "method"');
    }

    return RefactoringProposal.of({
      type: proposal.type,
      description: proposal.description,
      rationale: proposal.rationale,
      target: CodeLocation.of(targetFields.path, targetFields.method),
    });
  }

  constructor(private readonly llm: LlmClient) {}

  private buildPrompt(sourceCode: SourceCode): string {
    return [
      'You are a refactoring analyzer.',
      'Identify refactoring opportunities in the source code below.',
      'Respond ONLY with a JSON array. Each element must be an object with:',
      '- "type": the refactoring type (e.g. "long-method")',
      '- "description": the suggested refactoring (e.g. "extract-method")',
      '- "rationale": why this refactoring is suggested',
      '- "target": an object with "path" and "method" identifying the code',
      'If there are no opportunities, respond with an empty array [].',
      '',
      'Source code:',
      sourceCode.content,
    ].join('\n');
  }

  analyze(sourceCode: SourceCode): readonly RefactoringProposal[] {
    const response = this.llm.complete(this.buildPrompt(sourceCode));

    return RefactoringAnalyzer.parseProposals(response);
  }
}
