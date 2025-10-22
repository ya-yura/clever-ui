// === 📁 src/components/OfflineIndicator.tsx ===
// Offline status indicator

import React, { useState, useEffect } from 'react';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showMessage) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 p-4 rounded-lg shadow-lg text-white text-center z-50 ${
        isOnline ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      {isOnline ? '🟢 Соединение восстановлено' : '🔴 Нет соединения - работа в оффлайн режиме'}
    </div>
  );
};

export default OfflineIndicator;

