import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { odataAPI } from '@/services/odata-api';
import { demoDataService } from '@/services/demoDataService';

const createMockStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
};

describe('Receiving demo mode', () => {
  beforeAll(() => {
    (globalThis as any).localStorage = createMockStorage();
  });

  beforeEach(() => {
    (globalThis as any).localStorage.clear();
    (globalThis as any).localStorage.setItem('demo_mode', 'true');
  });

  it('loads document types including receiving', async () => {
    const types = await odataAPI.getDocTypes();
    expect(types.length).toBeGreaterThan(0);
    expect(types.some((t) => t.uni === 'PrihodNaSklad')).toBe(true);
  });

  it('provides receiving documents from demo data', async () => {
    const docs = await odataAPI.getDocumentsByType('PrihodNaSklad');
    expect(docs.length).toBeGreaterThan(0);
    expect(docs[0].id).toBeDefined();
    expect(docs[0].documentTypeName).toBeTruthy();
  });

  it('returns receiving document details with generated items', async () => {
    const doc = await odataAPI.getDocument('PrihodNaSklad', 'prihod-001');
    expect(doc).toBeTruthy();
    expect(doc.declaredItems?.length ?? 0).toBeGreaterThan(0);
    expect(doc.currentItems?.length ?? 0).toBeGreaterThan(0);
  });

  it('demo data service can generate item list for receiving doc', () => {
    const withItems = demoDataService.getDocumentWithItems('PrihodNaSklad', 'prihod-001');
    expect(withItems).toBeTruthy();
    expect(withItems?.combinedItems?.length ?? 0).toBeGreaterThan(0);
  });
});



