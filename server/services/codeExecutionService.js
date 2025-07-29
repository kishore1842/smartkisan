import { exec } from 'child_process';
import vm from 'vm';

const CODE_EXECUTION_ENABLED = process.env.CODE_EXECUTION_ENABLED === 'true';
const PYTHON_TIMEOUT = 5000; // ms
const NODE_TIMEOUT = 2000; // ms

export const codeExecutionService = {
  async executePython(code) {
    if (!CODE_EXECUTION_ENABLED) return 'Code execution is disabled.';
    return await new Promise((resolve) => {
      exec(`python -c "${code.replace(/"/g, '\"')}"`, { timeout: PYTHON_TIMEOUT }, (err, stdout, stderr) => {
        if (err) return resolve(stderr || err.message);
        if (stderr) return resolve(stderr);
        return resolve(stdout.trim());
      });
    });
  },
  async executeNode(code) {
    if (!CODE_EXECUTION_ENABLED) return 'Code execution is disabled.';
    try {
      let result = '';
      const script = new vm.Script(code);
      const context = vm.createContext({ console: { log: (msg) => { result += msg + '\n'; } } });
      await Promise.race([
        script.runInContext(context, { timeout: NODE_TIMEOUT }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), NODE_TIMEOUT))
      ]);
      return result.trim() || 'Code executed.';
    } catch (e) {
      return e.message;
    }
  }
  // TODO: Add file operations, user confirmation, and further security checks
}; 