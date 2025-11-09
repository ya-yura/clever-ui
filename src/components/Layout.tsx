// === 📁 src/components/Layout.tsx ===
// Main layout component with header and navigation

import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';
import OfflineIndicator from './OfflineIndicator';
import { HamburgerMenu } from '@/modules/menu';
import { QRScanner } from './QRScanner';
import { SchemaLoader } from '@/services/schemaLoader';
import { useSync } from '@/hooks/useSync';
import { useReferences } from '@/hooks/useReferences';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  // Sync hook for documents
  const { sync: triggerSync } = useSync({
    module: 'app',
    syncEndpoint: '/api/sync',
    onSyncComplete: () => {
      console.log('✅ Sync completed successfully');
    },
    onSyncError: (error) => {
      console.error('❌ Sync error:', error);
    },
  });

  // References update hook
  const { updateReferences } = useReferences();

  // Install interface handler
  const handleInstallInterface = () => {
    console.log('🎨 Opening QR scanner for interface installation');
    setShowQRScanner(true);
  };

  // QR scan complete handler
  const handleQRScan = (data: string) => {
    console.log('📱 QR scanned, loading interface...');
    
    try {
      const schema = SchemaLoader.loadFromCompressed(data);
      
      if (schema) {
        SchemaLoader.saveToLocalStorage(schema, 'active');
        console.log('✅ Interface installed successfully');
        setShowQRScanner(false);
        
        // Show success message
        alert('✅ Интерфейс успешно установлен!\n\nТеперь вы можете использовать его на главной странице.');
        
        // Navigate to home to see the new interface
        navigate('/');
      } else {
        console.error('❌ Invalid schema from QR');
        alert('❌ Неверный QR-код интерфейса');
      }
    } catch (error: any) {
      console.error('Failed to load interface:', error);
      alert('❌ Ошибка загрузки интерфейса: ' + error.message);
    }
  };

  // Logout handler
  const handleLogout = () => {
    console.log('Logout triggered');
    // Clear session data here
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#343436]">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-20">
        <Outlet />
      </main>
      <OfflineIndicator />
      <HamburgerMenu 
        onSync={triggerSync}
        onUpdateReferences={updateReferences}
        onLogout={handleLogout}
        onInstallInterface={handleInstallInterface}
      />
      
      {/* QR Scanner Modal for Interface Installation */}
      {showQRScanner && (
        <QRScanner 
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
};

export default Layout;

