// === 📁 src/main.tsx ===
// Application entry point

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { getAnalytics } from './lib/analytics';
import './index.css';

// Initialize Analytics
try {
  const analytics = getAnalytics();
  analytics.init();
  console.log('Analytics initialized successfully');
} catch (error) {
  console.error('Failed to initialize analytics:', error);
}

// Register Service Worker for PWA
// Only in production to avoid conflicts with Vite HMR in development
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('SW registered: ', registration);
        },
        (error) => {
          console.log('SW registration failed: ', error);
        }
      );
    });
  } else {
    // In development, unregister any existing service workers to fix HMR/caching issues
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister();
        console.log('SW unregistered in DEV mode');
      }
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

