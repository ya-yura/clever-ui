// === 📁 src/utils/sound.ts ===
// Sound feedback utilities with characteristic audio effects

export type SoundType = 'success' | 'error' | 'warning' | 'scan' | 'notification';

let audioContext: AudioContext | null = null;
let enabled = true;

export const initSound = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
};

/**
 * Успех - короткий позитивный "дзинь" (две ноты вверх)
 */
const playSuccessSound = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  
  // Первая нота (C6)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  
  osc1.frequency.value = 1046.5; // C6
  osc1.type = 'sine';
  gain1.gain.setValueAtTime(0.2, now);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  
  osc1.start(now);
  osc1.stop(now + 0.1);
  
  // Вторая нота (E6) - через 50ms
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  
  osc2.frequency.value = 1318.5; // E6
  osc2.type = 'sine';
  gain2.gain.setValueAtTime(0, now + 0.05);
  gain2.gain.setValueAtTime(0.2, now + 0.05);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
  
  osc2.start(now + 0.05);
  osc2.stop(now + 0.15);
};

/**
 * Ошибка - раздражающий низкий буззер (пульсирующий)
 */
const playErrorSound = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  
  // Низкий пульсирующий звук
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const lfo = ctx.createOscillator(); // Low Frequency Oscillator для пульсации
  const lfoGain = ctx.createGain();
  
  // Настройка пульсации
  lfo.frequency.value = 8; // 8 Hz пульсация
  lfoGain.gain.value = 0.3;
  
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.frequency.value = 180; // Низкая частота
  osc.type = 'square'; // Квадратная волна для жёсткого звука
  
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
  
  lfo.start(now);
  osc.start(now);
  
  lfo.stop(now + 0.4);
  osc.stop(now + 0.4);
};

/**
 * Предупреждение - средний тревожный звук
 */
const playWarningSound = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  
  // Две ноты с небольшим интервалом (тревожный паттерн)
  for (let i = 0; i < 2; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.value = 600;
    osc.type = 'sine';
    
    const startTime = now + (i * 0.15);
    gain.gain.setValueAtTime(0.25, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
    
    osc.start(startTime);
    osc.stop(startTime + 0.1);
  }
};

/**
 * Сканирование - короткий острый "бип" (как реальный сканер)
 */
const playScanSound = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.frequency.value = 2800; // Высокая частота
  osc.type = 'sine';
  
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
  
  osc.start(now);
  osc.stop(now + 0.05);
};

/**
 * Уведомление - нейтральный "пип"
 */
const playNotificationSound = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.frequency.value = 800; // Средняя частота
  osc.type = 'sine';
  
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
  
  osc.start(now);
  osc.stop(now + 0.12);
};

export const playSound = (type: SoundType) => {
  if (!enabled) return;
  
  try {
    if (!audioContext) initSound();
    if (!audioContext) return;

    switch (type) {
      case 'success':
        playSuccessSound(audioContext);
        break;
      case 'error':
        playErrorSound(audioContext);
        break;
      case 'warning':
        playWarningSound(audioContext);
        break;
      case 'scan':
        playScanSound(audioContext);
        break;
      case 'notification':
        playNotificationSound(audioContext);
        break;
    }
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
