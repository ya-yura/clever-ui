import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const elementId = 'qr-scanner-region';

  useEffect(() => {
    startScanning();

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
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
          console.log('✅ QR Code scanned:', decodedText.substring(0, 50) + '...');
          onScan(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Игнорируем ошибки "не найдено" при сканировании
          // console.log('Scanning...', errorMessage);
        }
      );

      setIsScanning(true);
      setError(null);
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка доступа к камере';
      console.error('Failed to start scanner:', err);
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
  };

  const handleClose = async () => {
    await stopScanning();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#3D4247',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '500px',
        width: '100%',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 700,
            color: '#FFFFFF',
          }}>
            Сканирование QR-кода
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        {error ? (
          <div style={{
            padding: '20px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '8px',
            color: '#fca5a5',
            textAlign: 'center',
          }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '16px' }}>⚠️ {error}</p>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
              Убедитесь, что камера не используется другим приложением
            </p>
          </div>
        ) : (
          <>
            <div id={elementId} style={{
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '16px',
            }} />
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '14px',
              textAlign: 'center',
              margin: 0,
            }}>
              Наведите камеру на QR-код интерфейса
            </p>
          </>
        )}

        <button
          onClick={handleClose}
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '12px',
            background: '#4A4F54',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Отмена
        </button>
      </div>
    </div>
  );
};

