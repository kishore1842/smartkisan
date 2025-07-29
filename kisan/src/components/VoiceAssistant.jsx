import React, { useState, useRef, useEffect } from 'react';
import './VoiceAssistant.css';
import { X, Bot, User as UserIcon, Paperclip, Send, Search, Mic } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const formatTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Enhanced markdown-to-HTML converter for bot responses
function formatBotReply(text) {
  // Convert headings (##, #) with color and spacing
  text = text.replace(/^### (.*)$/gm, '<h3 style="color:#22c55e;margin:1.2em 0 0.5em 0;font-size:1.15rem;font-weight:700;">$1</h3>');
  text = text.replace(/^## (.*)$/gm, '<h2 style="color:#4f8a8b;margin:1.5em 0 0.7em 0;font-size:1.3rem;font-weight:700;">$1</h2>');
  text = text.replace(/^# (.*)$/gm, '<h1 style="color:#4f8a8b;margin:2em 0 1em 0;font-size:1.5rem;font-weight:800;">$1</h1>');
  // Convert bold **text**
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Convert links
  text = text.replace(/\bhttps?:\/\/[^\s]+/g, function(url) {
    return '<a href="' + url + '" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;">' + url + '</a>';
  });
  // Highlight warnings/notes
  text = text.replace(/\b([Ww]arning|[Nn]ote|[Cc]aution):/g, '<span style="background:#fef3c7;color:#b45309;padding:0.1em 0.4em;border-radius:0.4em;font-weight:600;">$1:</span>');
  // Custom bullet icons: checkmark for normal, warning for caution, info for notes
  // Replace * or - with checkmark, ! with warning, i with info
  text = text.replace(/(^|\n)[\*\-] (.*)/g, '$1<li style="list-style:none;position:relative;padding-left:1.7em;"><span style="position:absolute;left:0;top:0.1em;color:#22c55e;font-size:1.1em;">✔️</span> $2</li>');
  text = text.replace(/(^|\n)! (.*)/g, '$1<li style="list-style:none;position:relative;padding-left:1.7em;"><span style="position:absolute;left:0;top:0.1em;color:#f59e42;font-size:1.1em;">⚠️</span> $2</li>');
  text = text.replace(/(^|\n)i (.*)/g, '$1<li style="list-style:none;position:relative;padding-left:1.7em;"><span style="position:absolute;left:0;top:0.1em;color:#2563eb;font-size:1.1em;">ℹ️</span> $2</li>');
  // Group consecutive <li> into <ul>
  text = text.replace(/(<li[\s\S]*?<\/li>\n?)+/g, function(match) {
    return '<ul style="margin:0.7em 0 1.2em 1.2em;padding:0;">' + match.replace(/\n/g, '') + '</ul>';
  });
  // Numbered lists
  text = text.replace(/(^|\n)\d+\. (.*)/g, '$1<li style="list-style:none;position:relative;padding-left:1.7em;"><span style="position:absolute;left:0;top:0.1em;color:#4f8a8b;font-size:1.1em;">#</span> $2</li>');
  text = text.replace(/(<li[\s\S]*?<\/li>\n?)+/g, function(match) {
    return '<ol style="margin:0.7em 0 1.2em 1.2em;padding:0;">' + match.replace(/\n/g, '') + '</ol>';
  });
  // Paragraphs for plain text
  text = text.replace(/([^>\n][^\n]+)(?=\n|$)/g, '<p style="margin:0.7em 0;line-height:1.7;">$1</p>');
  return text;
}

// Enhanced Gemini API configuration with all 7 keys
const GEMINI_API_KEYS = [
  "AIzaSyDjkzsTy6cxG25rsy7RQNdlgq-gvSekCG0",
  "AIzaSyBeMJ9ZH-jZQgvL40HiiySfo24na7zlfKY",
  "AIzaSyC3crJtP38l9oblrEPd6rzKX96DYDuBS3o",
  "AIzaSyD2ak5rmAlu5DKDohgQ_Mz9zfCD6TLiv-U",
  "AIzaSyBKowBO6qabm3hR6awwCp-D5lI-LrXCICQ",
  "AIzaSyCVuzM-5PLXO6Am1d_fqPf8APVFxNkbokY",
  "AIzaSyCMJtQpYtwg5HTB2Ij5rR7UObg2HllldRs",
  "AIzaSyCexUJkufEU7iPmKHNpv67UhMNPY88R_Yc"
];
const GEMINI_MODEL = "gemini-1.5-flash";

// Key rotation tracking
let currentKeyIndex = 0;
const keyUsageStats = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 15; // Conservative limit per key

// Initialize key usage tracking
GEMINI_API_KEYS.forEach((_, index) => {
  keyUsageStats.set(index, {
    requests: 0,
    lastReset: Date.now(),
    errors: 0,
    lastError: null
  });
});

/**
 * Get next available API key with intelligent rotation
 */
function getNextAvailableKey() {
  const now = Date.now();
  
  // Reset counters if window has passed
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const stats = keyUsageStats.get(i);
    if (now - stats.lastReset > RATE_LIMIT_WINDOW) {
      stats.requests = 0;
      stats.lastReset = now;
    }
  }
  
  // Find key with lowest usage and no recent errors
  let bestKeyIndex = 0;
  let bestScore = -1;
  
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const stats = keyUsageStats.get(i);
    const timeSinceLastError = stats.lastError ? now - stats.lastError : Infinity;
    const score = (MAX_REQUESTS_PER_MINUTE - stats.requests) + (timeSinceLastError > 30000 ? 10 : 0);
    
    if (score > bestScore) {
      bestScore = score;
      bestKeyIndex = i;
    }
  }
  
  return bestKeyIndex;
}

/**
 * Update key usage statistics
 */
function updateKeyStats(keyIndex, success, error = null) {
  const stats = keyUsageStats.get(keyIndex);
  if (success) {
    stats.requests++;
  } else {
    stats.errors++;
    stats.lastError = Date.now();
  }
}

/**
 * Enhanced Gemini API call with intelligent fallback
 */
async function callGeminiWithIntelligentFallback(parts, maxRetries = 3) {
  let lastError;
  let attempts = 0;
  
  while (attempts < maxRetries) {
    const keyIndex = getNextAvailableKey();
    const key = GEMINI_API_KEYS[keyIndex];
    
    console.log(`[VoiceAssistant Gemini] Attempt ${attempts + 1}: Using API key #${keyIndex + 1}`);
    
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
    
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts }] })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (text.trim()) {
        updateKeyStats(keyIndex, true);
        console.log(`[VoiceAssistant Gemini] Success with key #${keyIndex + 1}`);
        return { text, usedKey: keyIndex + 1 };
      } else {
        throw new Error('Empty response from Gemini');
      }
      
    } catch (error) {
      lastError = error;
      updateKeyStats(keyIndex, false, error);
      
      console.error(`[VoiceAssistant Gemini] Key #${keyIndex + 1} failed:`, error.message);
      
      // If it's a rate limit error, mark this key as temporarily unavailable
      if (error.message.includes('429')) {
        console.log(`[VoiceAssistant Gemini] Key #${keyIndex + 1} rate limited, will retry with different key`);
        // Don't increment attempts for rate limit errors
        continue;
      }
      
      // For other errors, increment attempts
      attempts++;
      
      // If we've tried all keys, wait a bit before retrying
      if (attempts >= GEMINI_API_KEYS.length) {
        console.log('[VoiceAssistant Gemini] All keys tried, waiting 2 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts = 0; // Reset attempts for next round
      }
    }
  }
  
  throw new Error(`All Gemini API keys failed after ${maxRetries} retries. Last error: ${lastError?.message || 'Unknown error'}`);
}

const BACKEND_ASSISTANT_ENDPOINT = "/api/v1/voice-assistant/voice-assistant";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Hook to get window width
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

const VoiceAssistant = ({ onClose }) => {
  const { user } = useAuth ? useAuth() : { user: null };
  const userKey = user?.email ? `chatHistory_${user.email}` : 'chatHistory_guest';
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState(null);
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(userKey)) || [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef(null);

  // Maintain a separate state for last 3 user searches
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(userKey + '_searches')) || [];
    } catch {
      return [];
    }
  });

  // Update searchHistory in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(userKey + '_searches', JSON.stringify(searchHistory));
  }, [searchHistory, userKey]);

  // Add a user search to searchHistory (max 3)
  const addUserSearch = (text) => {
    const newSearches = [text, ...searchHistory].slice(0, 3);
    setSearchHistory(newSearches);
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  useEffect(() => {
    localStorage.setItem(userKey, JSON.stringify(chatHistory));
  }, [chatHistory, userKey]);

  // In addMessage, if user and type is 'typing', also update searchHistory
  const addMessage = (sender, text, type = "normal") => {
    const newHistory = [...chatHistory, { sender, text, type, time: formatTime() }];
    setChatHistory(newHistory);
    if (sender === 'user' && type === 'typing') {
      addUserSearch(text);
    }
  };

  // Clear both chat and search history
  const clearChat = () => {
    setChatHistory([]);
    setSearchHistory([]);
    localStorage.removeItem(userKey);
    localStorage.removeItem(userKey + '_searches');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userMessage = inputText.trim();
    if (!userMessage && !file) return;

    if (userMessage) addMessage("user", userMessage, "typing");
    if (file) addMessage("user", `📎 Uploaded: ${file.name}`, "file");

    setInputText("");
    setFile(null);

    const parts = [];
    if (userMessage) parts.push({ text: userMessage });

    if (file) {
      const base64 = await fileToBase64(file);
      parts.push({
        inlineData: {
          mimeType: file.type,
          data: base64.split(",")[1]
        }
      });
    }

    // 1. Try Gemini API with intelligent fallback
    let geminiFailed = false;
    try {
      const result = await callGeminiWithIntelligentFallback(parts);
      const botReply = result.text;
      addMessage("kai", botReply, "response");
      return;
    } catch (err) {
      console.error('[VoiceAssistant] Gemini failed:', err.message);
      geminiFailed = true;
    }

    // 2. If Gemini fails, call your backend assistant endpoint
    if (geminiFailed) {
      try {
        let backendResponse, backendData;
        if (file) {
          // Send as FormData if file is present
          const formData = new FormData();
          formData.append('file', file);
          if (userMessage) formData.append('prompt', userMessage);
          backendResponse = await fetch(BACKEND_ASSISTANT_ENDPOINT, {
            method: 'POST',
            body: formData
          });
        } else {
          backendResponse = await fetch(BACKEND_ASSISTANT_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: userMessage })
          });
        }
        backendData = await backendResponse.json();
        if (backendResponse.ok && backendData.success && (backendData.text || backendData.analysis)) {
          let reply = backendData.text || '';
          if (backendData.analysis) {
            reply = `Plant: ${backendData.analysis.plant || 'Unknown'}\nDisease: ${backendData.analysis.disease || 'Unknown'}\nCure: ${backendData.analysis.cure || 'No cure information available.'}\nTip: ${backendData.analysis.pro_tip || 'No pro tip available.'}`;
          }
          let sourceInfo = backendData.source && backendData.source !== 'gemini' ? ` (source: ${backendData.source})` : '';
          addMessage('kai', reply + sourceInfo, 'response');
        } else {
          addMessage('kai', '⚠️ All AI services and fallbacks are currently unavailable. Please try again later.', 'error');
        }
      } catch (err) {
        addMessage('kai', '❌ An error occurred while contacting the backend. Please try again later.', 'error');
      }
    }
  };

  // Pro tips for the assistant
  const proTips = [
    "Try asking about crop diseases, market prices, or government schemes.",
    "You can upload a plant image for disease diagnosis.",
    "Use simple, clear language for best results.",
    "Click the paperclip to attach an image.",
    "Clear chat anytime with the paperclip button above."
  ];

  // Use only the last 2 user searches for compactness
  const lastUserSearches = searchHistory.slice(0, 2);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Setup Speech Recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, []);

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current && recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current && recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const windowWidth = useWindowWidth();

  return (
    <div className="va-fullscreen-overlay">
      <div className="va-header-ui">
        <div className="va-header-left">
          <Bot className="va-bot-icon" />
          <span className="va-title-ui">Voice Assistant</span>
        </div>
        <div className="va-header-actions">
          <button className="va-clear-btn-ui" onClick={clearChat} title="Clear Chat" aria-label="Clear Chat">
            <Paperclip className="va-clear-icon" />
          </button>
          {onClose && (
            <button className="va-close-btn-ui" onClick={onClose} title="Close" aria-label="Close">
              <X className="va-close-icon" />
            </button>
          )}
        </div>
      </div>
      <div className="va-flex-row-layout va-responsive-stack">
        {/* Chat Box Section */}
        <div className="va-chat-center-section va-responsive-card">
          {/* Desktop: Compact history chips above chat messages */}
          {windowWidth > 900 && lastUserSearches.length > 0 && (
            <div className="va-history-desktop-bar">
              <ul className="va-history-list va-history-list-desktop">
                {lastUserSearches.map((msg, idx) => (
                  <li key={idx} className="va-history-chip va-history-chip-desktop">
                    <span className="va-history-search-icon"><Search size={14} /></span>
                    <span className="va-history-chip-text">{msg}</span>
                  </li>
                ))}
              </ul>
              <div className="va-history-divider" />
            </div>
          )}
          {/* Mobile: Compact history above chat input */}
          {windowWidth <= 900 && lastUserSearches.length > 0 && (
            <div className="va-history-mobile-wrapper">
              <ul className="va-history-list va-history-list-mobile">
                {lastUserSearches.map((msg, idx) => (
                  <li key={idx} className="va-history-chip va-history-chip-mobile">
                    <span className="va-history-search-icon"><Search size={14} /></span>
                    <span className="va-history-chip-text">{msg}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="va-chat-box-ui" ref={chatBoxRef} id="chat-box" style={{flex: 1, minHeight: 0}}>
            {chatHistory.length === 0 && (
              <div className="va-welcome-ui">Start chatting with Assistant!</div>
            )}
            {chatHistory.map(({ sender, text, type, time }, idx) => (
              <div key={idx} className={`va-message-ui va-${sender}-ui va-${type}-ui`}>
                <div className="va-bubble-row-ui">
                  <div className={`va-avatar-ui va-avatar-${sender}-ui`}>{sender === 'user' ? <UserIcon /> : <Bot />}</div>
                  <div>
                    <div className="va-bubble-ui" dangerouslySetInnerHTML={{ __html: sender === 'kai' ? formatBotReply(text) : text.split("\n\n").map(para => `<p>${para.replace(/\n/g, "<br>")}</p>`).join("") }} />
                    <div className="va-time-ui">{time}</div>
                  </div>
                </div>
              </div>
            ))}
            {loading && <div className="va-message-ui va-kai-ui va-typing-ui"><div className="va-bubble-row-ui"><div className="va-avatar-ui va-avatar-kai-ui"><Bot /></div><div className="va-bubble-ui">Gemini is typing...</div></div></div>}
          </div>
          <form className="va-input-bar-ui va-responsive-input-bar" id="chat-form" onSubmit={handleSubmit} autoComplete="off">
            <label className="va-file-label-ui" aria-label="Attach Image">
              <Paperclip className="va-file-icon-ui" />
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={e => setFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </label>
            <button
              type="button"
              className={`va-voice-btn-ui${isListening ? ' listening' : ''}`}
              onClick={handleMicClick}
              title={isListening ? 'Stop Listening' : 'Start Voice Input'}
              aria-label={isListening ? 'Stop Listening' : 'Start Voice Input'}
              style={{outline: isListening ? '2px solid #22c55e' : 'none'}}
            >
              <Mic color={isListening ? '#22c55e' : '#4f8a8b'} fill={isListening ? '#d1fae5' : 'none'} />
            </button>
            <input
              id="text-input"
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Type your message..."
              autoComplete="off"
              className="va-text-input-ui va-responsive-text-input"
              aria-label="Type your message"
            />
            <button type="submit" className="va-send-btn-ui" disabled={loading} title="Send" aria-label="Send">
              <Send />
            </button>
          </form>
        </div>
        {/* Pro Tips Section */}
        <div className="va-pro-tips-section va-responsive-card va-pro-tips-hide-mobile">
          <div className="va-section-label">Pro Tips</div>
          <ul className="va-pro-tips-list">
            {proTips.map((tip, idx) => (
              <li key={idx} className="va-pro-tip-chip">{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant; 