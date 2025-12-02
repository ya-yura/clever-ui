import React from 'react';
import { useParams } from 'react-router-dom';
import Receiving from '@/pages/Receiving';
import Placement from '@/pages/Placement';
import Picking from '@/pages/Picking';
import Shipment from '@/pages/Shipment';
import Return from '@/pages/Return';
import Inventory from '@/pages/Inventory';
import DocumentDetails from '@/pages/DocumentDetails';

/**
 * Smart router that chooses between interactive (scanning) and table (read-only) views
 * based on document type
 */

// OData types that have interactive scanning UI
const INTERACTIVE_TYPES = [
  'PrihodNaSklad',        // Receiving
  'RazmeshhenieVYachejki',// Placement
  'PodborZakaza',         // Picking
  'Otgruzka',             // Shipment
  'Vozvrat',              // Return
  'Inventarizaciya',      // Inventory
];

// Map OData types to React components
const INTERACTIVE_COMPONENTS: Record<string, React.ComponentType> = {
  'PrihodNaSklad': Receiving,
  'RazmeshhenieVYachejki': Placement,
  'PodborZakaza': Picking,
  'Otgruzka': Shipment,
  'Vozvrat': Return,
  'Inventarizaciya': Inventory,
};

export const SmartDocumentRouter: React.FC = () => {
  const { docTypeUni, docId } = useParams<{ docTypeUni: string; docId: string }>();

  // If no docId, this is a list view - should not reach here
  if (!docId || !docTypeUni) {
    console.warn('SmartDocumentRouter: missing docId or docTypeUni');
    return null;
  }

  console.log(`🧭 [ROUTER] docType=${docTypeUni}, docId=${docId}`);

  // Check if this type has interactive UI
  if (INTERACTIVE_TYPES.includes(docTypeUni)) {
    const Component = INTERACTIVE_COMPONENTS[docTypeUni];
    if (Component) {
      console.log(`📱 [ROUTER] Using interactive component for ${docTypeUni}`);
      return <Component />;
    }
  }

  // Fallback to table view for all other types
  console.log(`📋 [ROUTER] Using table view for ${docTypeUni}`);
  return <DocumentDetails />;
};

