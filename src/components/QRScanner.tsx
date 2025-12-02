import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, Zap } from 'lucide-react';
import { Button } from '@/design/components';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  onClose: () => void;
  fps?: number;
  qrbox?: { width: number; height: number };
}

/**
 * US VIII.3-5: QR/Barcode Scanner Component
 * - Camera access and scanning
 * - Configurable FPS and scan area
 * - Multiple formats support (QR, EAN-13, Code128, etc.)
 * - Error handling
 */
export const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onError,
  onClose,
  fps = 10,
  qrbox = { width: 250, height: 250 },
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = 'qr-scanner-' + Math.random().toString(36).substring(7);

  useEffect(() => {
    startScanning();

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      // US VIII.3: Request camera permission
      const scanner = new Html5Qrcode(scannerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ],
        verbose: false,
      });

      scannerRef.current = scanner;

      // US VIII.4: Configure camera (fps, qrbox)
      await scanner.start(
        { facingMode: 'environment' }, // Use back camera on mobile
        {
          fps, // Configurable FPS
          qrbox, // Configurable scan area
          aspectRatio: 1.0,
        },
        // US VIII.5: Success callback
        (decodedText: string) => {
          onScan(decodedText);
          stopScanning();
        },
        // Error callback (ignore frequent scan errors)
        (errorMessage: string) => {
          // Only log non-scanning errors
          if (!errorMessage.includes('NotFoundException') && !errorMessage.includes('No MultiFormat Readers')) {
            console.warn('Scan error:', errorMessage);
          }
        }
      );

      setIsScanning(true);
      setError(null);
    } catch (err: any) {
      console.error('Camera start error:', err);
      setError(err.message || 'Не удалось запустить камеру');
      onError?.(err.message);
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current) {
        const isCurrentlyScanning = scannerRef.current.isScanning;
        if (isCurrentlyScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current = null;
      }
      setIsScanning(false);
    } catch (err: any) {
      console.error('Stop scanner error:', err);
    }
  };

  const handleClose = async () => {
    await stopScanning();
    onClose();
  };

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="bg-surface-primary rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-separator flex items-center justify-between bg-surface-secondary">
          <div className="flex items-center gap-2">
            <Camera size={24} className="text-brand-primary" />
            <h2 className="text-lg font-bold">Сканирование</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-surface-tertiary rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="relative bg-black">
          {error ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-error font-medium mb-2">Ошибка камеры</p>
              <p className="text-sm text-content-secondary mb-4">{error}</p>
              <p className="text-xs text-content-tertiary">
                Проверьте разрешения камеры в браузере
              </p>
            </div>
          ) : (
            <>
              {/* Scanner container */}
              <div id={scannerId} className="w-full" />

              {/* Status overlay */}
              {isScanning && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <div className="bg-brand-primary/90 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm">
                    <Zap size={16} className="animate-pulse" />
                    <span className="text-sm font-medium">Наведите на код...</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-secondary">
          <div className="text-xs text-content-tertiary text-center space-y-1">
            <p>Поддерживаются форматы:</p>
            <p className="font-mono">QR, EAN-13, Code128, UPC</p>
            <p className="mt-2">FPS: {fps} | Область: {qrbox.width}x{qrbox.height}px</p>
          </div>
        </div>
      </div>
    </div>
  );
};
