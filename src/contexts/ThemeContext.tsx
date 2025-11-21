// === 📁 src/contexts/ThemeContext.tsx ===
// Provides light/dark theme switching with persistence

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

type ThemeMode = 'dark' | 'light';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme_mode';

const getPreferredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }

  return 'dark';
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(getPreferredTheme);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    setTheme,
    toggleTheme: () => setTheme((mode) => (mode === 'dark' ? 'light' : 'dark')),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
















