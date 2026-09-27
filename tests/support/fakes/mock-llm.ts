import type { LlmClient } from '@/domain/refactoring-analyzer/llm-client.js';

export class MockLlm implements LlmClient {
  readonly prompts: string[] = [];

  constructor(private readonly response: string) {}

  complete(prompt: string): string {
    this.prompts.push(prompt);

    return this.response;
  }
}
