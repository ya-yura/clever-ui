// === 📁 src/components/Layout.tsx ===
// Main layout component with header and navigation

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import OfflineIndicator from './OfflineIndicator';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-20">
        <Outlet />
      </main>
      <OfflineIndicator />
    </div>
  );
};

export default Layout;

