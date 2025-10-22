// === 📁 src/utils/date.ts ===
// Date formatting utilities

export const formatDate = (timestamp: number, format: 'short' | 'long' | 'time' = 'short'): string => {
  const date = new Date(timestamp);
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString('ru-RU');
    case 'long':
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return date.toLocaleDateString('ru-RU');
  }
};

export const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${formatDate(timestamp, 'short')} ${formatDate(timestamp, 'time')}`;
};

export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  if (days < 7) return `${days} дн. назад`;
  
  return formatDate(timestamp);
};

export const isToday = (timestamp: number): boolean => {
  const date = new Date(timestamp);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isExpired = (timestamp: number): boolean => {
  return timestamp < Date.now();
};
