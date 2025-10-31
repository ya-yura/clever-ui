// === 📁 src/services/odataCache.ts ===
// OData caching service for offline support

import { db } from './db';
import { ODataDocumentType, ODataDocument, ODataCollection } from '@/types/odata';
import { api } from './api';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class ODataCacheService {
  /**
   * Check if cache is still valid
   */
  private async isCacheValid(key: string): Promise<boolean> {
    const metadata = await db.cacheMetadata.get(key);
    if (!metadata) return false;
    
    return Date.now() < metadata.expiresAt;
  }

  /**
   * Update cache metadata
   */
  private async updateCacheMetadata(key: string): Promise<void> {
    await db.cacheMetadata.put({
      key,
      lastUpdated: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION,
    });
  }

  /**
   * Get document types with caching
   */
  async getDocTypes(forceRefresh = false): Promise<ODataDocumentType[]> {
    const cacheKey = 'docTypes';

    // Try cache first (if not forcing refresh)
    if (!forceRefresh && await this.isCacheValid(cacheKey)) {
      const cached = await db.odataDocTypes.toArray();
      if (cached.length > 0) {
        console.log('✅ Loaded DocTypes from cache');
        return cached;
      }
    }

    // Fetch from API
    try {
      const response = await api.getDocTypes();
      if (response.success && response.data) {
        const odataResponse = response.data as ODataCollection<ODataDocumentType>;
        const types = odataResponse.value || [];

        // Save to cache
        await db.odataDocTypes.clear();
        await db.odataDocTypes.bulkAdd(types);
        await this.updateCacheMetadata(cacheKey);

        console.log(`✅ Fetched and cached ${types.length} DocTypes from API`);
        return types;
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch DocTypes from API, trying cache:', error);
    }

    // Fallback to stale cache
    const cached = await db.odataDocTypes.toArray();
    if (cached.length > 0) {
      console.log('⚠️ Using stale cache for DocTypes');
      return cached;
    }

    throw new Error('No DocTypes available (offline and no cache)');
  }

  /**
   * Get documents by type with caching
   */
  async getDocsByType(docTypeUni: string, forceRefresh = false): Promise<ODataDocument[]> {
    const cacheKey = `docs_${docTypeUni}`;

    // Try cache first (if not forcing refresh)
    if (!forceRefresh && await this.isCacheValid(cacheKey)) {
      const cached = await db.odataDocuments
        .where('documentTypeName')
        .equals(docTypeUni)
        .toArray();
      
      if (cached.length > 0) {
        console.log(`✅ Loaded ${cached.length} documents from cache for ${docTypeUni}`);
        return cached;
      }
    }

    // Fetch from API
    try {
      const response = await api.getDocsByType(docTypeUni);
      if (response.success && response.data) {
        const odataResponse = response.data as ODataCollection<ODataDocument>;
        const docs = odataResponse.value || [];

        // Save to cache (replace existing docs of this type)
        await db.odataDocuments
          .where('documentTypeName')
          .equals(docTypeUni)
          .delete();
        
        if (docs.length > 0) {
          await db.odataDocuments.bulkAdd(docs);
        }
        
        await this.updateCacheMetadata(cacheKey);

        console.log(`✅ Fetched and cached ${docs.length} documents from API for ${docTypeUni}`);
        return docs;
      }
    } catch (error) {
      console.warn(`⚠️ Failed to fetch documents from API for ${docTypeUni}, trying cache:`, error);
    }

    // Fallback to stale cache
    const cached = await db.odataDocuments
      .where('documentTypeName')
      .equals(docTypeUni)
      .toArray();
    
    if (cached.length > 0) {
      console.log(`⚠️ Using stale cache for documents of ${docTypeUni}`);
      return cached;
    }

    // Return empty array instead of throwing
    console.warn(`⚠️ No documents available for ${docTypeUni} (offline and no cache)`);
    return [];
  }

  /**
   * Get single document by ID with caching
   */
  async getDocById(docId: string, forceRefresh = false): Promise<ODataDocument | null> {
    const cacheKey = `doc_${docId}`;

    // Try cache first (if not forcing refresh)
    if (!forceRefresh && await this.isCacheValid(cacheKey)) {
      const cached = await db.odataDocuments.get(docId);
      if (cached) {
        console.log(`✅ Loaded document ${docId} from cache`);
        return cached;
      }
    }

    // Fetch from API
    try {
      const response = await api.getDocById(docId);
      if (response.success && response.data) {
        const doc = response.data as ODataDocument;

        // Save to cache
        await db.odataDocuments.put(doc);
        await this.updateCacheMetadata(cacheKey);

        console.log(`✅ Fetched and cached document ${docId} from API`);
        return doc;
      }
    } catch (error) {
      console.warn(`⚠️ Failed to fetch document ${docId} from API, trying cache:`, error);
    }

    // Fallback to stale cache
    const cached = await db.odataDocuments.get(docId);
    if (cached) {
      console.log(`⚠️ Using stale cache for document ${docId}`);
      return cached;
    }

    return null;
  }

  /**
   * Clear all cache
   */
  async clearCache(): Promise<void> {
    await db.odataDocTypes.clear();
    await db.odataDocuments.clear();
    await db.cacheMetadata.clear();
    console.log('✅ OData cache cleared');
  }

  /**
   * Clear cache for specific document type
   */
  async clearCacheForType(docTypeUni: string): Promise<void> {
    await db.odataDocuments
      .where('documentTypeName')
      .equals(docTypeUni)
      .delete();
    await db.cacheMetadata.delete(`docs_${docTypeUni}`);
    console.log(`✅ Cache cleared for ${docTypeUni}`);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    const docTypesCount = await db.odataDocTypes.count();
    const documentsCount = await db.odataDocuments.count();
    const metadataCount = await db.cacheMetadata.count();

    return {
      docTypes: docTypesCount,
      documents: documentsCount,
      metadata: metadataCount,
    };
  }
}

export const odataCache = new ODataCacheService();

