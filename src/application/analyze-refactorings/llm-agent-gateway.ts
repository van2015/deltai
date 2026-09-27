import { RefactoringAnalyzer } from '../../domain/refactoring-analyzer/refactoring-analyzer.js';
import type { AgentGateway } from './agent-gateway.js';
import type { AgentRequest } from './agent-request.js';
import type { AgentResponse } from './agent-response.js';

export class LlmAgentGateway implements AgentGateway {
  constructor(private readonly analyzer: RefactoringAnalyzer) {}

  async analyze(request: AgentRequest): Promise<AgentResponse> {
    const proposals = this.analyzer.analyze(request.sourceCode, {
      projectState: request.projectState,
      ...(request.userIntent === undefined ? {} : { userIntent: request.userIntent }),
    });

    return { proposals };
  }
}
