export interface LlmClient {
  complete(prompt: string): string;
}
