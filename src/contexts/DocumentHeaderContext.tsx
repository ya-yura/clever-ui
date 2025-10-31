// === 📁 src/contexts/DocumentHeaderContext.tsx ===
// Context for passing document info to Header

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DocumentHeaderInfo {
  documentId: string;
  completed: number;
  total: number;
}

interface DocumentListInfo {
  title: string;
  count: number;
}

interface DocumentHeaderContextType {
  documentInfo: DocumentHeaderInfo | null;
  setDocumentInfo: (info: DocumentHeaderInfo | null) => void;
  listInfo: DocumentListInfo | null;
  setListInfo: (info: DocumentListInfo | null) => void;
}

const DocumentHeaderContext = createContext<DocumentHeaderContextType | undefined>(undefined);

export const DocumentHeaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [documentInfo, setDocumentInfo] = useState<DocumentHeaderInfo | null>(null);
  const [listInfo, setListInfo] = useState<DocumentListInfo | null>(null);

  return (
    <DocumentHeaderContext.Provider value={{ documentInfo, setDocumentInfo, listInfo, setListInfo }}>
      {children}
    </DocumentHeaderContext.Provider>
  );
};

export const useDocumentHeader = () => {
  const context = useContext(DocumentHeaderContext);
  if (context === undefined) {
    throw new Error('useDocumentHeader must be used within a DocumentHeaderProvider');
  }
  return context;
};

