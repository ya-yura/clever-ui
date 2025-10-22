// === 📁 src/utils/voice.ts ===
// Voice feedback utilities using Web Speech API

let enabled = true;
let synth: SpeechSynthesis | null = null;
let voice: SpeechSynthesisVoice | null = null;

export const initVoice = () => {
  if ('speechSynthesis' in window) {
    synth = window.speechSynthesis;
    
    // Try to get Russian voice
    const voices = synth.getVoices();
    voice = voices.find(v => v.lang.startsWith('ru')) || voices[0] || null;
    
    // Load voices if not ready
    if (voices.length === 0) {
      synth.onvoiceschanged = () => {
        const loadedVoices = synth!.getVoices();
        voice = loadedVoices.find(v => v.lang.startsWith('ru')) || loadedVoices[0] || null;
      };
    }
  }
};

export const speak = (text: string, options?: { rate?: number; pitch?: number }) => {
  if (!enabled || !synth) return;
  
  try {
    // Cancel any ongoing speech
    synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.rate = options?.rate || 1.0;
    utterance.pitch = options?.pitch || 1.0;
    utterance.volume = 0.8;
    
    synth.speak(utterance);
  } catch (error) {
    console.error('Voice synthesis error:', error);
  }
};

export const stopSpeaking = () => {
  if (synth) {
    synth.cancel();
  }
};

export const setVoiceEnabled = (value: boolean) => {
  enabled = value;
  localStorage.setItem('voiceEnabled', String(value));
  if (!value) stopSpeaking();
};

export const isVoiceEnabled = () => {
  const stored = localStorage.getItem('voiceEnabled');
  return stored === null ? false : stored === 'true';
};

// Initialize
enabled = isVoiceEnabled();
initVoice();
