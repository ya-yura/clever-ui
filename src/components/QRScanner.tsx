import React from 'react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded">
        <p>Scanner Placeholder (Library Removed for Debugging)</p>
        <button onClick={onClose} className="mt-4 p-2 bg-blue-500 text-white rounded">Close</button>
        <button onClick={() => onScan('123456')} className="mt-4 ml-2 p-2 bg-green-500 text-white rounded">Simulate Scan</button>
      </div>
    </div>
  );
};
