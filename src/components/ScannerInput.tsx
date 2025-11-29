import React, { useRef, useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { QRScanner } from './QRScanner';

interface ScannerInputProps {
  onScan: (code: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

const ScannerInput: React.FC<ScannerInputProps> = ({
  onScan,
  placeholder = 'Отсканируйте штрих-код...',
  autoFocus = true,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      
      const value = inputRef.current?.value.trim();
      
      if (value && value.length > 0) {
        // Call onScan handler
        onScan(value);
        
        // Clear input
        if (inputRef.current) {
          inputRef.current.value = '';
        }
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
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full bg-[#343436] border border-[#474747] rounded-lg px-4 py-3 pr-12 text-[#e3e3dd] placeholder-[#a7a7a7] focus:outline-none focus:ring-2 focus:ring-[#86e0cb] focus:border-transparent text-lg transition-all"
        />
        <button
          onClick={() => setIsCameraOpen(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#a7a7a7] hover:text-[#86e0cb] transition-colors rounded-full hover:bg-[#474747]"
          title="Открыть камеру"
        >
          <Camera size={24} />
        </button>
      </div>

      {isCameraOpen && (
        <QRScanner
          onScan={(code) => {
            onScan(code);
            setIsCameraOpen(false);
          }}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </>
  );
};

export default ScannerInput;
