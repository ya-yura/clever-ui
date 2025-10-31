// === 📁 src/App.tsx ===
// Main application component

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Documents from './pages/Documents';
import PartnerManagement from './pages/PartnerManagement';
import Receiving from './pages/Receiving';
import Placement from './pages/Placement';
import Picking from './pages/Picking';
import Shipment from './pages/Shipment';
import Return from './pages/Return';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import Statistics from './pages/Statistics';
import Diagnostics from './pages/Diagnostics';
import About from './pages/About';
import Feedback from './pages/Feedback';
import { loadInitialData } from './utils/loadInitialData';
import { MenuProvider } from './modules/menu';

function App() {
  // Load initial data on app start
  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <MenuProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="documents" element={<Documents />} />
            <Route path="partner" element={<PartnerManagement />} />
            <Route path="receiving" element={<Receiving />} />
            <Route path="receiving/:id" element={<Receiving />} />
            <Route path="placement" element={<Placement />} />
            <Route path="placement/:id" element={<Placement />} />
            <Route path="picking" element={<Picking />} />
            <Route path="picking/:id" element={<Picking />} />
            <Route path="shipment" element={<Shipment />} />
            <Route path="shipment/:id" element={<Shipment />} />
            <Route path="return" element={<Return />} />
            <Route path="return/:id" element={<Return />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory/:id" element={<Inventory />} />
            <Route path="settings" element={<Settings />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="diagnostics" element={<Diagnostics />} />
            <Route path="about" element={<About />} />
            <Route path="feedback" element={<Feedback />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MenuProvider>
  );
}

export default App;

