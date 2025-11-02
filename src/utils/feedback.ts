// === 📁 src/utils/feedback.ts ===
// Combined feedback utility

import { playSound, SoundType } from './sound';
import { vibrate, VibrationType } from './vibration';
import { speak } from './voice';

export type FeedbackType = 'success' | 'error' | 'warning' | 'scan' | 'notification';

const messages: Record<FeedbackType, string> = {
  success: 'Успешно',
  error: 'Ошибка',
  warning: 'Внимание',
  scan: 'Отсканировано',
  notification: 'Уведомление',
};

export const provideFeedback = (
  type: FeedbackType,
  customMessage?: string,
  options?: {
    sound?: boolean;
    vibration?: boolean;
    voice?: boolean;
  }
) => {
  const opts = {
    sound: true,
    vibration: true,
    voice: false,
    ...options,
  };

  // Sound feedback
  if (opts.sound) {
    playSound(type as SoundType);
  }

  // Vibration feedback
  if (opts.vibration) {
    vibrate(type as VibrationType);
  }

  // Voice feedback
  if (opts.voice && customMessage) {
    speak(customMessage);
  }
};

export const scanFeedback = (success: boolean, message?: string) => {
  if (success) {
    provideFeedback('scan', message || 'Товар добавлен', { voice: !!message });
  } else {
    provideFeedback('error', message || 'Товар не найден', { voice: true });
  }
};

// Feedback object with shorthand methods
export const feedback = {
  success: (message?: string) => provideFeedback('success', message, { voice: true }),
  error: (message?: string) => provideFeedback('error', message, { voice: true }),
  warning: (message?: string) => provideFeedback('warning', message, { voice: true }),
  scan: (message?: string) => provideFeedback('scan', message, { voice: false }),
  notification: (message?: string) => provideFeedback('notification', message, { voice: false }),
};