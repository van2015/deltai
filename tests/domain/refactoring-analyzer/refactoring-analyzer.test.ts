import { describe, expect, it } from 'vitest';

import { InvalidLlmResponseError } from '@/domain/refactoring-analyzer/invalid-llm-response-error.js';
import { RefactoringAnalyzer } from '@/domain/refactoring-analyzer/refactoring-analyzer.js';
import { SourceCode } from '@/domain/refactoring-analyzer/source-code.js';

import { MockLlm } from '../../support/fakes/mock-llm.js';

describe('RefactoringAnalyzer', () => {
  it('should_return_no_proposals_for_simple_code', () => {
    const llm = new MockLlm('[]');
    const analyzer = new RefactoringAnalyzer(llm);
    const sourceCode = SourceCode.of('class Order {\n  id: string;\n}');

    const proposals = analyzer.analyze(sourceCode);

    expect(proposals).toEqual([]);
  });

  it('should_detect_long_method', () => {
    const llm = new MockLlm(
      JSON.stringify([
        {
          type: 'long-method',
          description: 'extract-method',
          rationale: 'processOrder exceeds 50 lines',
          target: { path: 'src/order.ts', method: 'processOrder' },
        },
      ]),
    );
    const analyzer = new RefactoringAnalyzer(llm);
    const sourceCode = SourceCode.of(
      'function processOrder() {\n  // many lines\n}',
    );

    const proposals = analyzer.analyze(sourceCode);

    expect(proposals).toHaveLength(1);
    expect(proposals[0]?.type).toBe('long-method');
  });

  it('should_suggest_extract_method_for_long_method', () => {
    const llm = new MockLlm(
      JSON.stringify([
        {
          type: 'long-method',
          description: 'extract-method',
          rationale: 'processOrder exceeds 50 lines',
          target: { path: 'src/order.ts', method: 'processOrder' },
        },
      ]),
    );
    const analyzer = new RefactoringAnalyzer(llm);
    const sourceCode = SourceCode.of('function processOrder() {\n  // many lines\n}');

    const proposals = analyzer.analyze(sourceCode);

    expect(proposals[0]?.type).toBe('long-method');
    expect(proposals[0]?.description).toBe('extract-method');
  });

  it('should_include_reason_for_each_proposal', () => {
    const llm = new MockLlm(
      JSON.stringify([
        {
          type: 'long-method',
          description: 'extract-method',
          rationale: 'processOrder exceeds 50 lines',
          target: { path: 'src/order.ts', method: 'processOrder' },
        },
        {
          type: 'long-method',
          description: 'extract-method',
          rationale: 'validateInput exceeds 50 lines',
          target: { path: 'src/input.ts', method: 'validateInput' },
        },
      ]),
    );
    const analyzer = new RefactoringAnalyzer(llm);
    const sourceCode = SourceCode.of(
      'function processOrder() {}\nfunction validateInput() {}',
    );

    const proposals = analyzer.analyze(sourceCode);

    expect(proposals).toHaveLength(2);
    for (const proposal of proposals) {
      expect(proposal.rationale).not.toBe('');
    }
  });

  it('should_identify_target_of_refactoring', () => {
    const llm = new MockLlm(
      JSON.stringify([
        {
          type: 'long-method',
          description: 'extract-method',
          rationale: 'processOrder exceeds 50 lines',
          target: { path: 'src/order.ts', method: 'processOrder' },
        },
      ]),
    );
    const analyzer = new RefactoringAnalyzer(llm);
    const sourceCode = SourceCode.of('function processOrder() {\n  // many lines\n}');

    const proposals = analyzer.analyze(sourceCode);

    expect(proposals[0]?.target.path).toBe('src/order.ts');
    expect(proposals[0]?.target.method).toBe('processOrder');
  });

  it('should_return_structured_refactoring_proposals', () => {
    const llm = new MockLlm(
      JSON.stringify([
        {
          type: 'long-method',
          description: 'extract-method',
          rationale: 'processOrder exceeds 50 lines',
          target: { path: 'src/order.ts', method: 'processOrder' },
        },
      ]),
    );
    const analyzer = new RefactoringAnalyzer(llm);
    const sourceCode = SourceCode.of('function processOrder() {\n  // many lines\n}');

    const proposals = analyzer.analyze(sourceCode);
    const proposal = proposals[0];

    expect(proposal).toBeDefined();
    expect(proposal?.id).toEqual(expect.any(String));
    expect(proposal?.id).not.toBe('');
    expect(Object.isFrozen(proposal)).toBe(true);
    expect(Object.isFrozen(proposal?.target)).toBe(true);
    expect(() => {
      (proposal as unknown as { id: string }).id = 'replaced';
    }).toThrow();
    expect(proposal?.type).toBe('long-method');
    expect(proposal?.description).toBe('extract-method');
    expect(proposal?.rationale).not.toBe('');
    expect(proposal?.target.method).toBe('processOrder');
  });

  it('fails when the LLM response is not valid JSON', () => {
    const llm = new MockLlm('this is not JSON');
    const analyzer = new RefactoringAnalyzer(llm);
    const sourceCode = SourceCode.of('function processOrder() {}');

    expect(() => analyzer.analyze(sourceCode)).toThrow(InvalidLlmResponseError);
  });

  it('fails when a proposal is missing required fields', () => {
    const llm = new MockLlm(JSON.stringify([{ type: 'long-method' }]));
    const analyzer = new RefactoringAnalyzer(llm);
    const sourceCode = SourceCode.of('function processOrder() {}');

    expect(() => analyzer.analyze(sourceCode)).toThrow(InvalidLlmResponseError);
  });

  it('sends the source code to the LLM', () => {
    const llm = new MockLlm('[]');
    const analyzer = new RefactoringAnalyzer(llm);
    const sourceCode = SourceCode.of('class Order {\n  id: string;\n}');

    analyzer.analyze(sourceCode);

    expect(llm.prompts).toHaveLength(1);
    expect(llm.prompts[0]).toContain('class Order');
  });
});
