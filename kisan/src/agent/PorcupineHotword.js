// FakeHotword.js
// Keyless hotword detection using the Web Speech API (not accurate, for demo only)
// Usage: Import and call startFakeHotwordDetection(onWakeWord)

let recognition = null;
let isListening = false;
let commandRecognition = null;
let lastOnAction = null;
let lastOnStatus = null;
let handleVisibilityChange = null;
let userInteractionGranted = false; // Track if user has granted speech synthesis permission

/**
 * Initialize speech synthesis to ensure it works after page reloads
 */
function initializeSpeechSynthesis() {
  if (!window.speechSynthesis) {
    console.error('[Agent] Speech synthesis not supported');
    return false;
  }

  try {
    // Reset speech synthesis state
    window.speechSynthesis.cancel();
    
    // Check if speech synthesis is paused (common after page reload)
    if (window.speechSynthesis.paused) {
      console.log('[Agent] Speech synthesis was paused, resuming...');
      window.speechSynthesis.resume();
    }
    
    // Only test speech synthesis if user interaction has been granted
    if (userInteractionGranted) {
      // Test speech synthesis with a silent utterance
      const testUtterance = new window.SpeechSynthesisUtterance('');
      testUtterance.volume = 0;
      testUtterance.onend = () => {
        console.log('[Agent] Speech synthesis initialized successfully');
      };
      testUtterance.onerror = (event) => {
        console.error('[Agent] Speech synthesis initialization failed:', event.error);
        // If it's a user interaction error, we'll handle it later
        if (event.error === 'not-allowed') {
          console.log('[Agent] User interaction required for speech synthesis');
          userInteractionGranted = false;
        }
      };
      
      window.speechSynthesis.speak(testUtterance);
    } else {
      console.log('[Agent] Waiting for user interaction before testing speech synthesis');
    }
    
    return true;
  } catch (error) {
    console.error('[Agent] Speech synthesis initialization error:', error);
    return false;
  }
}

/**
 * Grant speech synthesis permission - call this after user interaction
 */
export function grantSpeechSynthesisPermission() {
  if (!window.speechSynthesis) {
    console.error('[Agent] Speech synthesis not supported');
    return false;
  }

  console.log('[Agent] Granting speech synthesis permission...');
  userInteractionGranted = true;
  
  // Test speech synthesis immediately
  const testUtterance = new window.SpeechSynthesisUtterance('');
  testUtterance.volume = 0;
  testUtterance.onend = () => {
    console.log('[Agent] Speech synthesis permission granted successfully');
  };
  testUtterance.onerror = (event) => {
    console.error('[Agent] Failed to grant speech synthesis permission:', event.error);
    userInteractionGranted = false;
  };
  
  window.speechSynthesis.speak(testUtterance);
  return true;
}

/**
 * Check if speech synthesis permission has been granted
 */
export function isSpeechSynthesisPermissionGranted() {
  return userInteractionGranted;
}

/**
 * Handle user interaction requirement for speech synthesis
 * This is needed because browsers require user interaction before allowing speech synthesis
 */
function ensureUserInteraction() {
  return new Promise((resolve) => {
    if (window.speechSynthesis && !window.speechSynthesis.paused) {
      resolve();
      return;
    }
    
    // Try to resume speech synthesis
    try {
      window.speechSynthesis.resume();
      resolve();
    } catch (e) {
      console.log('[Agent] User interaction may be required for speech synthesis');
      resolve();
    }
  });
}

/**
 * Start fake hotword detection (no key required)
 * After hotword, listen for a command and respond with TTS.
 * @param {Function} onAction - Optional callback to trigger in-app actions (e.g., navigation)
 * Usage: startFakeHotwordDetection((action) => { if (action === 'dashboard') navigate('/dashboard'); });
 */
export function startFakeHotwordDetection(onAction, onStatus) {
  lastOnAction = onAction;
  lastOnStatus = onStatus;
  if (isListening) return;
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    alert('Speech recognition not supported in this browser.');
    return;
  }
  
  // Initialize speech synthesis first
  initializeSpeechSynthesis();
  
  // Add page visibility change handler
  handleVisibilityChange = () => {
    if (!document.hidden && window.speechSynthesis) {
      console.log('[Agent] Page became visible, reinitializing speech synthesis...');
      initializeSpeechSynthesis();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  if (onStatus) onStatus('idle');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    console.log('[Agent] Heard:', transcript);
    if (transcript.includes('stop')) {
      stopAll();
      if (onStatus) onStatus('idle');
      return;
    }
    if (transcript.includes('hey agent') || transcript.includes('ok agent') || transcript.includes('hello agent')) {
      console.log('[Agent] Hotword detected!');
      stopFakeHotwordDetection();
      listenForCommand(onAction, onStatus);
    }
  };
  recognition.onerror = (e) => {
    console.error('[Agent] Hotword recognition error:', e.error);
    stopFakeHotwordDetection();
    if (onStatus) onStatus('idle');
  };
  recognition.onend = () => {
    isListening = false;
    console.log('[Agent] Hotword recognition ended.');
    if (onStatus) onStatus('idle');
  };
  recognition.start();
  isListening = true;
  console.log('[Agent] Hotword detection started. Say "hey agent".');
  if (onStatus) onStatus('listening');
}

/**
 * Stop fake hotword detection
 */
export function stopFakeHotwordDetection() {
  if (recognition) {
    recognition.stop();
    recognition = null;
    isListening = false;
    console.log('[Agent] Hotword detection stopped.');
  }
  
  // Remove visibility change listener if it exists
  if (handleVisibilityChange) {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    handleVisibilityChange = null;
  }
}

function stopAll() {
  // Stop any ongoing speech
  if (window.speechSynthesis && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    console.log('[Agent] Speech synthesis stopped.');
  }
  // Stop recognition
  if (recognition) {
    recognition.stop();
    recognition = null;
    isListening = false;
    console.log('[Agent] Hotword detection stopped (via stopAll).');
  }
  if (commandRecognition) {
    commandRecognition.stop();
    commandRecognition = null;
    console.log('[Agent] Command recognition stopped (via stopAll).');
  }
  // Restart hotword detection after a short delay
  setTimeout(() => {
    if (lastOnAction || lastOnStatus) {
      startFakeHotwordDetection(lastOnAction, lastOnStatus);
    }
  }, 1200);
}

function listenForCommand(onAction, onStatus) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (onStatus) onStatus('thinking');
  speakResponse("Listening...");
  setTimeout(() => {
    commandRecognition = new SpeechRecognition();
    commandRecognition.lang = 'en-US';
    commandRecognition.continuous = false;
    commandRecognition.interimResults = false;
    commandRecognition.maxAlternatives = 1;

    commandRecognition.onstart = () => {
      console.log('[Agent] Listening for command...');
      if (onStatus) onStatus('listening');
    };
    commandRecognition.onresult = (event) => {
      const command = event.results[0][0].transcript.trim().toLowerCase();
      console.log('[Agent] Command heard:', command);
      if (command.includes('stop')) {
        stopAll();
        if (onStatus) onStatus('idle');
        return;
      }
      processCommand(command, onAction, onStatus);
    };
    commandRecognition.onerror = (e) => {
      console.error('[Agent] Command recognition error:', e.error);
      speakResponse("Sorry, I couldn't hear you. Please try again.");
      setTimeout(() => startFakeHotwordDetection(onAction, onStatus), 1500);
      if (onStatus) onStatus('idle');
    };
    commandRecognition.onend = () => {
      commandRecognition = null;
      console.log('[Agent] Command recognition ended. Restarting hotword detection.');
      setTimeout(() => startFakeHotwordDetection(onAction, onStatus), 1000);
      if (onStatus) onStatus('idle');
    };
    commandRecognition.start();
  }, 700);
}

// Gemini API keys and logic (copied from VoiceAssistant.jsx)
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
let currentKeyIndex = 0;
const keyUsageStats = new Map();
const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS_PER_MINUTE = 15;
GEMINI_API_KEYS.forEach((_, index) => {
  keyUsageStats.set(index, {
    requests: 0,
    lastReset: Date.now(),
    errors: 0,
    lastError: null
  });
});
function getNextAvailableKey() {
  const now = Date.now();
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const stats = keyUsageStats.get(i);
    if (now - stats.lastReset > RATE_LIMIT_WINDOW) {
      stats.requests = 0;
      stats.lastReset = now;
    }
  }
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
function updateKeyStats(keyIndex, success, error = null) {
  const stats = keyUsageStats.get(keyIndex);
  if (success) {
    stats.requests++;
  } else {
    stats.errors++;
    stats.lastError = Date.now();
  }
}
async function callGeminiWithIntelligentFallback(parts, maxRetries = 3) {
  let lastError;
  let attempts = 0;
  while (attempts < maxRetries) {
    const keyIndex = getNextAvailableKey();
    const key = GEMINI_API_KEYS[keyIndex];
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
        return { text, usedKey: keyIndex + 1 };
      } else {
        throw new Error('Empty response from Gemini');
      }
    } catch (error) {
      lastError = error;
      updateKeyStats(keyIndex, false, error);
      if (error.message.includes('429')) {
        continue;
      }
      attempts++;
      if (attempts >= GEMINI_API_KEYS.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts = 0;
      }
    }
  }
  throw new Error(`All Gemini API keys failed after ${maxRetries} retries. Last error: ${lastError?.message || 'Unknown error'}`);
}

function processCommand(command, onAction, onStatus) {
  // Navigation/action rules
  if (command.includes('open dashboard') || command.includes('go to dashboard')) {
    speakResponse('Opening dashboard.');
    if (onAction) onAction('dashboard');
    if (onStatus) onStatus('speaking');
    return;
  }
  if (command.includes('open profile') || command.includes('go to profile')) {
    speakResponse('Opening profile.');
    if (onAction) onAction('profile');
    if (onStatus) onStatus('speaking');
    return;
  }
  if (command.includes('open home') || command.includes('go to home')) {
    speakResponse('Going home.');
    if (onAction) onAction('home');
    if (onStatus) onStatus('speaking');
    return;
  }
  if (command.includes('open market') || command.includes('show market prices')) {
    speakResponse('Showing market prices.');
    if (onAction) onAction('market');
    if (onStatus) onStatus('speaking');
    return;
  }
  if (command.includes('open schemes') || command.includes('go to schemes')) {
    speakResponse('Opening schemes.');
    if (onAction) onAction('schemes');
    if (onStatus) onStatus('speaking');
    return;
  }
  if (command.includes('open documents') || command.includes('go to documents')) {
    speakResponse('Opening documents.');
    if (onAction) onAction('documents');
    if (onStatus) onStatus('speaking');
    return;
  }
  if (command.includes('open crop disease') || command.includes('go to crop disease')) {
    speakResponse('Opening crop disease diagnosis.');
    if (onAction) onAction('crop-disease');
    if (onStatus) onStatus('speaking');
    return;
  }
  if (command.includes('open assistant') || command.includes('go to assistant')) {
    speakResponse('Opening assistant.');
    if (onAction) onAction('voice-assistant');
    if (onStatus) onStatus('speaking');
    return;
  }
  // Search commands
  const searchMatch = command.match(/(?:search for|find|show me) (.+)/);
  if (searchMatch && searchMatch[1]) {
    const query = searchMatch[1].trim();
    speakResponse(`Searching for ${query}.`);
    if (onAction) onAction('search', query);
    if (onStatus) onStatus('speaking');
    return;
  }
  // Simple rule-based responses
  let response = null;
  if (command.includes('hello') || command.includes('hi')) {
    response = "Hello! How can I help you today?";
  } else if (command.includes('time')) {
    response = `The current time is ${new Date().toLocaleTimeString()}`;
  } else if (command.includes('date')) {
    response = `Today's date is ${new Date().toLocaleDateString()}`;
  } else if (command.includes('weather')) {
    response = "I can't check the weather right now, but you can ask me other things!";
  } else if (command.includes('your name')) {
    response = "I'm your smart agent!";
  }
  if (response) {
    speakResponse(response);
    if (onStatus) onStatus('speaking');
  } else {
    // Fallback to Gemini LLM for smart response
    speakResponse("Let me think about that...");
    if (onStatus) onStatus('thinking');
    callGeminiWithIntelligentFallback([{ text: command }])
      .then(result => {
        speakResponse(result.text);
        if (onStatus) onStatus('speaking');
      })
      .catch(() => {
        speakResponse("Sorry, I couldn't find an answer to that.");
        if (onStatus) onStatus('speaking');
      });
  }
}

function speakResponse(text) {
  console.log('[Agent] Attempting to speak:', text);
  
  // Ensure speech synthesis is available
  if (!window.speechSynthesis) {
    console.error('[Agent] Speech synthesis not supported');
    return;
  }

  // Check if user interaction has been granted
  if (!userInteractionGranted) {
    console.log('[Agent] User interaction not granted, skipping speech');
    return;
  }

  console.log('[Agent] Speech synthesis state:', {
    speaking: window.speechSynthesis.speaking,
    paused: window.speechSynthesis.paused,
    pending: window.speechSynthesis.pending
  });

  // Handle user interaction requirement
  ensureUserInteraction().then(() => {
    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      console.log('[Agent] Cancelled ongoing speech');
    }

    // Reset speech synthesis state - this is crucial for page reload issues
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        console.log('[Agent] Resumed paused speech synthesis');
      }
    } catch (e) {
      console.log('[Agent] Speech synthesis reset failed:', e);
    }

    // Create new utterance with proper error handling
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Add event listeners for better debugging
    utterance.onstart = () => {
      console.log('[Agent] Started speaking:', text);
    };

    utterance.onend = () => {
      console.log('[Agent] Finished speaking:', text);
    };

    utterance.onerror = (event) => {
      console.error('[Agent] Speech synthesis error:', event.error);
      // If it's a not-allowed error, revoke permission
      if (event.error === 'not-allowed') {
        console.log('[Agent] Revoking speech synthesis permission due to not-allowed error');
        userInteractionGranted = false;
        return;
      }
      
      // Try to recover by resetting speech synthesis for other errors
      if (event.error === 'network') {
        console.log('[Agent] Attempting to recover speech synthesis...');
        setTimeout(() => {
          try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
          } catch (e) {
            console.error('[Agent] Recovery failed:', e);
          }
        }, 1000);
      }
    };

    // Add a small delay to ensure the queue is clear and state is reset
    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
        console.log('[Agent] Speech queued successfully');
      } catch (error) {
        console.error('[Agent] Failed to speak:', error);
        // Final fallback: try to reset and speak again
        setTimeout(() => {
          try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
          } catch (e) {
            console.error('[Agent] Final fallback failed:', e);
          }
        }, 500);
      }
    }, 150);
  });
} 