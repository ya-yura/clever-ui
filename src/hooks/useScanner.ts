// === 📁 src/hooks/useScanner.ts ===
// Scanner hook for barcode/QR scanning

import { useState, useEffect, useCallback, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { playSound } from '@/utils/sound';

export type ScanMode = 'camera' | 'keyboard' | 'bluetooth';

interface ScannerConfig {
  mode?: ScanMode;
  continuous?: boolean;
  onScan: (code: string) => void;
  onError?: (error: string) => void;
}

export const useScanner = ({
  mode = 'keyboard',
  continuous = true,
  onScan,
  onError,
}: ScannerConfig) => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string>('');
  const scannerRef = useRef<Html5QrcodeScanner | Html5Qrcode | null>(null);
  const bufferRef = useRef<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard mode: capture keypresses
  useEffect(() => {
    if (mode !== 'keyboard') return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if focused on input
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.key === 'Enter') {
        if (bufferRef.current.length > 0) {
          const code = bufferRef.current;
          bufferRef.current = '';
          setLastScan(code);
          playSound('scan');
          onScan(code);
        }
      } else if (event.key.length === 1) {
        bufferRef.current += event.key;
        
        // Auto-submit after 100ms of no input
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          if (bufferRef.current.length > 3) {
            const code = bufferRef.current;
            bufferRef.current = '';
            setLastScan(code);
            playSound('scan');
            onScan(code);
          }
        }, 100);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mode, onScan]);

  // Camera mode: use Html5Qrcode
  const startCameraScanner = useCallback(async (elementId: string) => {
    try {
      const scanner = new Html5Qrcode(elementId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setLastScan(decodedText);
          playSound('scan');
          onScan(decodedText);
          
          if (!continuous) {
            stopScanner();
          }
        },
        (errorMessage) => {
          // Ignore frequent errors
          if (!errorMessage.includes('NotFoundException')) {
            onError?.(errorMessage);
          }
        }
      );

      setIsScanning(true);
    } catch (error: any) {
      onError?.(error.message);
    }
  }, [continuous, onScan, onError]);

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current && 'stop' in scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
      }
      setIsScanning(false);
    } catch (error: any) {
      console.error('Error stopping scanner:', error);
    }
  }, []);

  // Manual scan trigger
  const manualScan = useCallback((code: string) => {
    setLastScan(code);
    playSound('scan');
    onScan(code);
  }, [onScan]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        stopScanner();
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [stopScanner]);

  return {
    isScanning,
    lastScan,
    startCameraScanner,
    stopScanner,
    manualScan,
  };
};
