// === 📁 src/utils/vibration.ts ===
// Vibration feedback utilities

export type VibrationType = 'success' | 'error' | 'warning' | 'light';

const patterns: Record<VibrationType, number | number[]> = {
  success: 50,
  error: [100, 50, 100],
  warning: [50, 30, 50],
  light: 20,
};

let enabled = true;

export const vibrate = (type: VibrationType) => {
  if (!enabled || !navigator.vibrate) return;
  
  try {
    navigator.vibrate(patterns[type]);
  } catch (error) {
    console.error('Vibration error:', error);
  }
};

export const setVibrationEnabled = (value: boolean) => {
  enabled = value;
  localStorage.setItem('vibrationEnabled', String(value));
};

export const isVibrationEnabled = () => {
  const stored = localStorage.getItem('vibrationEnabled');
  return stored === null ? true : stored === 'true';
};

// Initialize
enabled = isVibrationEnabled();
