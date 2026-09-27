import type { AgentGateway } from '@/application/analyze-refactorings/agent-gateway.js';
import type { AgentRequest } from '@/application/analyze-refactorings/agent-request.js';
import type { AgentResponse } from '@/application/analyze-refactorings/agent-response.js';

export class FakeAgentGateway implements AgentGateway {
  lastRequest: AgentRequest | undefined;

  constructor(private readonly response: AgentResponse) {}

  async analyze(request: AgentRequest): Promise<AgentResponse> {
    this.lastRequest = request;

    return this.response;
  }
}
