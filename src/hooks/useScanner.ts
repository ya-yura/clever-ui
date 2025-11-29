// === 📁 src/hooks/useScanner.ts ===
// Scanner hook for barcode/QR scanning

import { useState, useCallback, useRef, useEffect } from 'react';
// import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { playSound } from '@/utils/sound';
import analytics, { EventType } from '@/lib/analytics';

// Temporary type placeholders
type Html5QrcodeScanner = any;
type Html5Qrcode = any;

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
  
  // Ref to track time between scans for rhythm metrics
  const lastScanTimeRef = useRef<number>(Date.now());

  const trackScanInterval = useCallback((mode: ScanMode) => {
    const now = Date.now();
    const interval = now - lastScanTimeRef.current;
    
    // Ignore realistic first scans (intervals > 5 min are likely new sessions)
    if (interval < 300000) {
      analytics.track('scan_interval', { value: interval, unit: 'ms', mode });
    }
    
    lastScanTimeRef.current = now;
  }, []);

  // Keyboard mode is now handled by ScannerInput component
  // This hook wraps onScan to add sound and tracking
  const handleScan = useCallback((code: string) => {
    setLastScan(code);
    playSound('scan');
    
    // Track successful scan (keyboard mode)
    analytics.track(EventType.SCAN_SUCCESS, { barcode: code, method: 'keyboard' });
    trackScanInterval('keyboard');
    
    onScan(code);
  }, [onScan, trackScanInterval]);

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
          
          // Track successful scan (camera mode)
          analytics.track(EventType.SCAN_SUCCESS, { barcode: decodedText, method: 'camera' });
          trackScanInterval('camera');
          
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
  }, [continuous, onScan, onError, trackScanInterval]);

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
    
    // Track successful scan (manual mode)
    analytics.track(EventType.SCAN_SUCCESS, { barcode: code, method: 'manual' });
    analytics.track('manual_input', { input_type: 'barcode' });
    trackScanInterval('keyboard'); // Manual acts like keyboard input in flow
    
    onScan(code);
  }, [onScan, trackScanInterval]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        stopScanner();
      }
    };
  }, [stopScanner]);

  return {
    isScanning,
    lastScan,
    handleScan, // Use this for keyboard mode with ScannerInput component
    startCameraScanner,
    stopScanner,
    manualScan,
  };
};
