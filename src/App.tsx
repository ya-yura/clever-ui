// === 📁 src/App.tsx ===
// Main application component

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Setup from './pages/Setup';
import Login from './pages/Login';
import Home from './pages/Home';
import Documents from './pages/Documents';
import DocumentsByType from './pages/DocumentsByType';
import DocumentDetails from './pages/DocumentDetails';
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
import SoundTest from './pages/SoundTest';
import DesignSystemShowcase from './pages/DesignSystemShowcase';
import { DynamicGridInterface } from './components/DynamicGridInterface';
import { MenuProvider } from './modules/menu';
import { AuthProvider } from './contexts/AuthContext';
import { DocumentHeaderProvider } from './contexts/DocumentHeaderContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  // Initial data loading disabled - using API server data
  // To load mock data for development, uncomment:
  // useEffect(() => {
  //   import('./utils/loadInitialData').then(({ loadInitialData }) => {
  //     loadInitialData();
  //   });
  // }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <MenuProvider>
          <DocumentHeaderProvider>
            <BrowserRouter>
              <Routes>
              {/* Public routes */}
              <Route path="/setup" element={<Setup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/design-system" element={<DesignSystemShowcase />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Home />} />
                <Route path="documents" element={<Documents />} />
                <Route path="docs/:docTypeUni" element={<DocumentsByType />} />
                <Route path="docs/:docTypeUni/:docId" element={<DocumentDetails />} />
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
                <Route path="sound-test" element={<SoundTest />} />
                <Route path="custom-interface" element={<DynamicGridInterface />} />
              </Route>

              {/* Redirect unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </DocumentHeaderProvider>
        </MenuProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

