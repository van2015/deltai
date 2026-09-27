import type { AgentRequest } from './agent-request.js';
import type { AgentResponse } from './agent-response.js';

export interface AgentGateway {
  analyze(request: AgentRequest): Promise<AgentResponse>;
}
