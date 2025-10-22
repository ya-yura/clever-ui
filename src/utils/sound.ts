// === 📁 src/utils/sound.ts ===
// Sound feedback utilities

export type SoundType = 'success' | 'error' | 'warning' | 'scan';

const sounds: Record<SoundType, { frequency: number; duration: number }> = {
  success: { frequency: 800, duration: 100 },
  error: { frequency: 200, duration: 300 },
  warning: { frequency: 500, duration: 200 },
  scan: { frequency: 1000, duration: 50 },
};

let audioContext: AudioContext | null = null;
let enabled = true;

export const initSound = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
};

export const playSound = (type: SoundType) => {
  if (!enabled) return;
  
  try {
    if (!audioContext) initSound();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = sounds[type].frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + sounds[type].duration / 1000
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sounds[type].duration / 1000);
  } catch (error) {
    console.error('Sound playback error:', error);
  }
};

export const setSoundEnabled = (value: boolean) => {
  enabled = value;
  localStorage.setItem('soundEnabled', String(value));
};

export const isSoundEnabled = () => {
  const stored = localStorage.getItem('soundEnabled');
  return stored === null ? true : stored === 'true';
};

// Initialize
enabled = isSoundEnabled();
