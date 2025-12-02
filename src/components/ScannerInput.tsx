import React, { useRef, useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { QRScanner } from './QRScanner';
import { feedback } from '@/utils/feedback';

interface ScannerInputProps {
  onScan: (code: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  validateCode?: (code: string) => { valid: boolean; error?: string };
}

/**
 * US VIII: Scanner Input with auto-detection and feedback
 * - Auto-detects fast keyboard input (scanner mode)
 * - Clears field after scan
 * - Camera scanning support
 * - Error handling and validation
 * - Sound/vibration/voice feedback
 */
const ScannerInput: React.FC<ScannerInputProps> = ({
  onScan,
  placeholder = 'Отсканируйте штрих-код...',
  autoFocus = true,
  className = '',
  validateCode,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  // US VIII.1: Auto-detect fast input (scanner device)
  const lastKeypressTimeRef = useRef<number>(0);
  const keypressCountRef = useRef<number>(0);
  const scanBufferRef = useRef<string>('');

  // Auto-focus on mount and when component updates
  useEffect(() => {
    if (autoFocus && inputRef.current && !isCameraOpen) {
      inputRef.current.focus();
    }
  }, [autoFocus, isCameraOpen]);

  // Re-focus if lost
  useEffect(() => {
    if (!autoFocus || isCameraOpen) return;

    const handleFocusLoss = () => {
      setTimeout(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    };

    window.addEventListener('click', handleFocusLoss);
    return () => window.removeEventListener('click', handleFocusLoss);
  }, [autoFocus, isCameraOpen]);

  // US VIII.1: Auto-detect fast keyboard input (scanner)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const now = Date.now();
    const timeSinceLastKeypress = now - lastKeypressTimeRef.current;
    
    // Fast typing detection (<50ms between keys = likely a scanner)
    if (timeSinceLastKeypress < 50) {
      keypressCountRef.current++;
    } else {
      keypressCountRef.current = 1;
      scanBufferRef.current = '';
    }
    
    lastKeypressTimeRef.current = now;
  };

  // US VIII.6-9: Error handling and validation
  const handleScanAttempt = (code: string) => {
    // US VIII.6: Empty code
    if (!code || code.trim().length === 0) {
      feedback.error('Пустой код');
      return;
    }

    // US VIII.7: Unsupported format (basic check)
    if (code.length < 3 || code.length > 128) {
      feedback.error('Неподдерживаемый формат кода');
      return;
    }

    // Custom validation (if provided)
    if (validateCode) {
      const validation = validateCode(code);
      if (!validation.valid) {
        feedback.error(validation.error || 'Ошибка валидации кода');
        return;
      }
    }

    // US VIII.10-12: Success feedback (sound + vibration + voice)
    feedback.scan(); // Combined feedback
    
    // Call handler
    onScan(code);
    
    // US VIII.2: Clear field after scan
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      
      const value = inputRef.current?.value.trim();
      
      if (value && value.length > 0) {
        handleScanAttempt(value);
      }
      
      // Return focus to input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleBlur = () => {
    // Auto-refocus after a short delay
    if (autoFocus && !isCameraOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <>
      <div className={`scanner-input-wrapper relative ${className}`}>
        <input
          ref={inputRef}
          id="scanner-input"
          type="text"
          placeholder={placeholder}
          onKeyPress={handleKeyPress} // Track fast typing
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full bg-surface-secondary border border-border-default rounded-lg px-4 py-3 pr-12 text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-lg transition-all"
        />
        {/* US VIII.3: Camera button */}
        <button
          onClick={() => setIsCameraOpen(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-content-tertiary hover:text-brand-primary transition-colors rounded-full hover:bg-surface-tertiary"
          title="Открыть камеру"
        >
          <Camera size={24} />
        </button>
      </div>

      {/* US VIII.3-5: Camera scanner */}
      {isCameraOpen && (
        <QRScanner
          onScan={(code) => {
            handleScanAttempt(code);
            setIsCameraOpen(false);
          }}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </>
  );
};

export default ScannerInput;
