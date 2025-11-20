// === 📁 src/components/Layout.tsx ===
// Main layout component with header and navigation

import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';
import OfflineIndicator from './OfflineIndicator';
import { HamburgerMenu } from '@/modules/menu';
import { InterfaceInstaller } from './InterfaceInstaller';
import { useSync } from '@/hooks/useSync';
import { useReferences } from '@/hooks/useReferences';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [showInterfaceInstaller, setShowInterfaceInstaller] = useState(false);
  
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
    console.log('🎨 Opening interface installer');
    setShowInterfaceInstaller(true);
  };

  // Interface installation success handler
  const handleInterfaceSuccess = (schema: any) => {
    console.log('✅ Interface installed successfully:', schema);
    setShowInterfaceInstaller(false);
    
    // Navigate to home to see the new interface
    navigate('/');
    
    // Reload page to apply new interface
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Logout handler
  const handleLogout = () => {
    console.log('Logout triggered');
    // Clear session data here
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
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
      
      {/* Interface Installer Modal */}
      {showInterfaceInstaller && (
        <InterfaceInstaller 
          onClose={() => setShowInterfaceInstaller(false)}
          onSuccess={handleInterfaceSuccess}
        />
      )}
    </div>
  );
};

export default Layout;

