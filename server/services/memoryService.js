import fs from 'fs';
import path from 'path';

const MEMORY_PATH = path.resolve(__dirname, '../../memory.json');

function loadMemory() {
  if (!fs.existsSync(MEMORY_PATH)) return { facts: {}, conversations: {} };
  try {
    return JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf-8'));
  } catch {
    return { facts: {}, conversations: {} };
  }
}

function saveMemory(memory) {
  fs.writeFileSync(MEMORY_PATH, JSON.stringify(memory, null, 2), 'utf-8');
}

export const memoryService = {
  saveFact(key, value) {
    const memory = loadMemory();
    memory.facts[key.toLowerCase()] = value;
    saveMemory(memory);
  },
  getFact(key) {
    const memory = loadMemory();
    const k = key.toLowerCase();
    if (memory.facts[k]) return memory.facts[k];
    // Fuzzy match
    for (const factKey of Object.keys(memory.facts)) {
      if (factKey.includes(k) || k.includes(factKey)) return memory.facts[factKey];
    }
    return null;
  },
  searchFacts(query) {
    const memory = loadMemory();
    const q = query.toLowerCase();
    return Object.entries(memory.facts)
      .filter(([k, v]) => k.includes(q) || v.toLowerCase().includes(q))
      .map(([k, v]) => ({ key: k, value: v }));
  },
  saveConversation(userId, message) {
    const memory = loadMemory();
    if (!memory.conversations[userId]) memory.conversations[userId] = [];
    memory.conversations[userId].push(message);
    saveMemory(memory);
  },
  getConversation(userId) {
    const memory = loadMemory();
    return memory.conversations[userId] || [];
  }
  // TODO: Upgrade to SQLite for scalability
}; 