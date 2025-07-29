import { exec } from 'child_process';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

// ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config: Choose backend ('ollama', 'python', 'node', 'stub')
const LLM_BACKEND = process.env.LLM_BACKEND || 'ollama';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const PYTHON_LLM_PATH = process.env.PYTHON_LLM_PATH || path.resolve(__dirname, '../../llm_backend/generate.py');
const NODE_LLM_MODULE = process.env.NODE_LLM_MODULE || null; // e.g., 'gpt4all-node'
const CONTEXT_WINDOW = 6; // Number of previous messages to pass as context
const PERSONALITY = process.env.LLM_PERSONALITY || 'You are a helpful, friendly, and knowledgeable agricultural and general assistant.';
const ENABLE_BING_SEARCH = process.env.ENABLE_BING_SEARCH === 'true';
const BING_SEARCH_API_KEY = process.env.BING_SEARCH_API_KEY || '';
const BING_SEARCH_ENDPOINT = process.env.BING_SEARCH_ENDPOINT || 'https://api.bing.microsoft.com/v7.0/search';

export const localLLMService = {
  async generateResponse(query, context = '', opts = {}) {
    // 1. Ollama/llama.cpp backend (default, best for Mistral/Llama2/3)
    if (LLM_BACKEND === 'ollama') {
      try {
        const prompt = this.buildPrompt(query, context, opts);
        const response = await axios.post(
          `${OLLAMA_HOST}/api/generate`,
          { model: OLLAMA_MODEL, prompt, stream: false },
          { timeout: 120000 }
        );
        if (response.data && response.data.response && response.data.response.length > 2) {
          return response.data.response.trim();
        }
      } catch (e) {
        // Fallback to web search if LLM fails
        return await this.webSearchFallback(query);
      }
    }
    // 2. Python subprocess backend
    if (LLM_BACKEND === 'python') {
      try {
        const input = JSON.stringify({ query, context });
        return await new Promise((resolve, reject) => {
          exec(`python "${PYTHON_LLM_PATH}" '${input.replace(/'/g, "''")}'`, { timeout: 60000 }, (err, stdout, stderr) => {
            if (err) return resolve('Sorry, I could not generate a response.');
            const out = stdout.trim();
            if (out.length > 0) return resolve(out);
            return resolve('Sorry, I could not generate a response.');
          });
        });
      } catch (e) {
        return await this.webSearchFallback(query);
      }
    }
    // 3. Node.js LLM binding (if available)
    if (LLM_BACKEND === 'node' && NODE_LLM_MODULE) {
      try {
        const llm = await import(NODE_LLM_MODULE);
        if (llm && llm.generate) {
          const response = await llm.generate({ prompt: context ? context + '\n' + query : query });
          if (response && typeof response === 'string' && response.length > 2) return response;
        }
      } catch (e) {
        return await this.webSearchFallback(query);
      }
    }
    // 4. Fallback stub
    return await this.webSearchFallback(query);
  },

  // Helper to build conversational context from message history
  buildContext(messages) {
    if (!Array.isArray(messages)) return '';
    return messages.slice(-CONTEXT_WINDOW).map(m => `${m.role || 'user'}: ${m.content}`).join('\n');
  },

  // Helper to build prompt with personality and creative templates
  buildPrompt(query, context = '', opts = {}) {
    let prompt = PERSONALITY + '\n';
    if (opts.creative) {
      prompt += `Write a ${opts.creative} for the following request.\n`;
    }
    if (context) {
      prompt += 'Conversation so far:\n' + context + '\n';
    }
    prompt += 'User: ' + query + '\nAssistant:';
    return prompt;
  },

  // Web search fallback using DuckDuckGo Instant Answer API (no key required), then Bing if enabled
  async webSearchFallback(query) {
    // 1. Try DuckDuckGo Instant Answer
    try {
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`;
      const resp = await axios.get(url, { timeout: 10000 });
      if (resp.data && resp.data.AbstractText && resp.data.AbstractText.length > 10) {
        return resp.data.AbstractText;
      }
      if (resp.data && resp.data.Answer && resp.data.Answer.length > 2) {
        return resp.data.Answer;
      }
      if (resp.data && resp.data.RelatedTopics && resp.data.RelatedTopics.length > 0) {
        const first = resp.data.RelatedTopics[0];
        if (first.Text && first.Text.length > 10) return first.Text;
      }
    } catch (e) {}
    // 2. Try Bing Web Search if enabled and API key is set
    if (ENABLE_BING_SEARCH && BING_SEARCH_API_KEY) {
      try {
        const bingResp = await axios.get(BING_SEARCH_ENDPOINT, {
          params: { q: query, mkt: 'en-US', count: 3 },
          headers: { 'Ocp-Apim-Subscription-Key': BING_SEARCH_API_KEY },
          timeout: 10000
        });
        if (bingResp.data && bingResp.data.webPages && bingResp.data.webPages.value && bingResp.data.webPages.value.length > 0) {
          // Summarize the top result(s)
          const top = bingResp.data.webPages.value[0];
          let summary = top.snippet || top.name;
          if (bingResp.data.webPages.value.length > 1) {
            summary += '\n\nOther results:';
            for (const page of bingResp.data.webPages.value.slice(1, 3)) {
              summary += `\n- ${page.name}: ${page.snippet}`;
            }
          }
          return summary;
        }
      } catch (e) {}
    }
    // TODO: Add Google, SerpAPI, or other search APIs as further fallback
    return 'Sorry, I could not find relevant information for your question.';
  },

  // TODO: Add code execution, long-term memory, and admin/dev tools here
}; 