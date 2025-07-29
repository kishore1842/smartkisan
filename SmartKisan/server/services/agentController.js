import { localLLMService } from './localLLMService.js';
import { memoryService } from './memoryService.js';
import { codeExecutionService } from './codeExecutionService.js';
// import other tools as needed (web search, file ops, etc.)

export const agentController = {
  /**
   * Main agent entry point
   * @param {string} query - User's question
   * @param {string} language - User's language
   * @param {string} userId - User's ID
   * @param {Array} conversation - Recent conversation history (optional)
   * @returns {Promise<{response: string, reasoning: string[], tool_used: string}>}
   */
  async answer(query, language = 'english', userId = '', conversation = []) {
    const reasoning = [];
    // 1. Check long-term memory for a direct answer
    const memoryFact = memoryService.getFact(query);
    if (memoryFact) {
      reasoning.push('Answered from long-term memory.');
      return { response: memoryFact, reasoning, tool_used: 'memory' };
    }
    // 2. Check if this is a code execution request
    if (/code for|python code|js code|javascript code|run code|execute code|calculate|program for/i.test(query)) {
      reasoning.push('Detected code execution intent.');
      // Try to extract code language
      let codeLang = 'python';
      if (/js|javascript/i.test(query)) codeLang = 'node';
      // Use LLM to generate code
      const codePrompt = `Write only the code (no explanation) for: ${query}`;
      const code = await localLLMService.generateResponse(codePrompt, localLLMService.buildContext(conversation), { creative: 'code' });
      let result = '';
      if (codeLang === 'python') {
        result = await codeExecutionService.executePython(code);
      } else {
        result = await codeExecutionService.executeNode(code);
      }
      reasoning.push('Used LLM to generate code and executed it.');
      return { response: `Code:\n${code}\n\nResult:\n${result}`, reasoning, tool_used: 'code+llm' };
    }
    // 3. Use LLM for reasoning/planning and tool selection
    const context = localLLMService.buildContext(conversation);
    const planPrompt = `You are an AI agent with access to tools: memory, code execution, web search, and LLM. Given the user query: "${query}", decide which tool(s) to use and in what order. If you need to search, say 'search'. If you need to run code, say 'code'. If you need to recall memory, say 'memory'. If LLM is enough, say 'llm'. If multiple, list them in order. Reply as a JSON array of tool names.`;
    let plan = [];
    try {
      const planRaw = await localLLMService.generateResponse(planPrompt, context);
      plan = JSON.parse(planRaw.match(/\[.*\]/s)?.[0] || '[]');
    } catch (e) {
      plan = ['llm'];
    }
    reasoning.push(`Planned tool sequence: ${plan.join(' -> ')}`);
    let lastResult = '';
    for (const tool of plan) {
      if (tool === 'memory') {
        const fact = memoryService.getFact(query);
        if (fact) {
          reasoning.push('Answered from long-term memory.');
          lastResult = fact;
          break;
        }
      } else if (tool === 'code') {
        // Use LLM to generate code
        const codePrompt = `Write only the code (no explanation) for: ${query}`;
        const code = await localLLMService.generateResponse(codePrompt, context, { creative: 'code' });
        let result = '';
        if (/js|javascript/i.test(query)) {
          result = await codeExecutionService.executeNode(code);
        } else {
          result = await codeExecutionService.executePython(code);
        }
        lastResult = `Code:\n${code}\n\nResult:\n${result}`;
        reasoning.push('Used LLM to generate code and executed it.');
      } else if (tool === 'search') {
        // Use web search fallback
        lastResult = await localLLMService.webSearchFallback(query);
        reasoning.push('Used web search fallback.');
      } else if (tool === 'llm') {
        lastResult = await localLLMService.generateResponse(query, context);
        reasoning.push('Used LLM for direct answer.');
      }
      // Optionally, update context with lastResult for next tool
    }
    if (!lastResult) {
      lastResult = await localLLMService.generateResponse(query, context);
      reasoning.push('Fallback to LLM for answer.');
    }
    return { response: lastResult, reasoning, tool_used: plan.join(' -> ') };
  }
  // TODO: Add plugin system, file operations, user feedback/correction loop, etc.
}; 