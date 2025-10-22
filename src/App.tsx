// === 📁 src/App.tsx ===
// Main application component

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Receiving from './pages/Receiving';
import Placement from './pages/Placement';
import Picking from './pages/Picking';
import Shipment from './pages/Shipment';
import Return from './pages/Return';
import Inventory from './pages/Inventory';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

