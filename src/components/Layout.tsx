// === 📁 src/components/Layout.tsx ===
// Main layout component with header and navigation

import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';
import OfflineIndicator from './OfflineIndicator';
import { HamburgerMenu } from '@/modules/menu';
import { useSync } from '@/hooks/useSync';
import { useReferences } from '@/hooks/useReferences';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  
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
      />
    </div>
  );
};

export default Layout;

