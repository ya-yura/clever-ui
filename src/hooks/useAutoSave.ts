import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useBlocker } from 'react-router-dom';

interface UseAutoSaveOptions {
  onSave: () => Promise<void> | void;
  interval?: number; // milliseconds, default 30000 (30 seconds)
  saveOnNavigate?: boolean;
  saveOnUnmount?: boolean;
  enabled?: boolean;
}

/**
 * US IX.1: Auto-save hook
 * - Saves every N seconds (default 30)
 * - Saves before navigation
 * - Saves before unmount/close
 */
export const useAutoSave = ({
  onSave,
  interval = 30000,
  saveOnNavigate = true,
  saveOnUnmount = true,
  enabled = true,
}: UseAutoSaveOptions) => {
  const saveInProgressRef = useRef(false);
  const lastSaveTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

  // Safe save wrapper
  const performSave = useCallback(async () => {
    if (saveInProgressRef.current || !enabled) return;

    try {
      saveInProgressRef.current = true;
      await onSave();
      lastSaveTimeRef.current = Date.now();
      console.log('✓ Auto-save completed');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      saveInProgressRef.current = false;
    }
  }, [onSave, enabled]);

  // US IX.1.1: Periodic auto-save (every 30 seconds)
  useEffect(() => {
    if (!enabled) return;

    timerRef.current = setInterval(() => {
      performSave();
    }, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [enabled, interval, performSave]);

  // US IX.1.2: Save before navigation
  useEffect(() => {
    if (!enabled || !saveOnNavigate) return;

    // Save before location changes
    return () => {
      // Synchronous save on navigation
      if (!saveInProgressRef.current) {
        onSave();
      }
    };
  }, [location.pathname, enabled, saveOnNavigate, onSave]);

  // US IX.1.3: Save before unmount/close
  useEffect(() => {
    if (!enabled || !saveOnUnmount) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Attempt synchronous save
      if (!saveInProgressRef.current) {
        onSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Final save on unmount
      if (!saveInProgressRef.current) {
        onSave();
      }
    };
  }, [enabled, saveOnUnmount, onSave]);

  // Manual save trigger
  const saveNow = useCallback(async () => {
    await performSave();
  }, [performSave]);

  // Get time since last save
  const getTimeSinceLastSave = useCallback(() => {
    return Date.now() - lastSaveTimeRef.current;
  }, []);

  return {
    saveNow,
    isSaving: saveInProgressRef.current,
    lastSaveTime: lastSaveTimeRef.current,
    getTimeSinceLastSave,
  };
};



