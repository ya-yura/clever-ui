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

    // Try to fetch from API (with or without auth)
    try {
      console.log('🌐 Fetching DocTypes from API...');
      const response = await api.getDocTypes();
      
      if (response.success && response.data) {
        const odataResponse = response.data as ODataCollection<ODataDocumentType>;
        const types = odataResponse.value || [];

        // Save to cache
        if (types.length > 0) {
          await db.odataDocTypes.clear();
          await db.odataDocTypes.bulkAdd(types);
          await this.updateCacheMetadata(cacheKey);
          console.log(`✅ Fetched and cached ${types.length} DocTypes from API`);
        }
        
        return types;
      } else {
        console.warn('⚠️ API returned no data for DocTypes:', response);
      }
    } catch (error) {
      console.error('❌ Failed to fetch DocTypes from API:', error);
    }

    // Fallback to stale cache
    const cached = await db.odataDocTypes.toArray();
    if (cached.length > 0) {
      console.log('⚠️ Using stale cache for DocTypes');
      return cached;
    }

    // Return empty array to signal no data available
    console.warn('⚠️ No DocTypes available (API failed and no cache)');
    throw new Error('No DocTypes available');
  }

  /**
   * Get documents by type with caching
   */
  async getDocsByType(docTypeUni: string, forceRefresh = false): Promise<ODataDocument[]> {
    const cacheKey = `docs_${docTypeUni}`;

    console.log(`📦 [CACHE] getDocsByType(${docTypeUni})`);

    // Try cache first (if not forcing refresh)
    if (!forceRefresh && await this.isCacheValid(cacheKey)) {
      const cached = await db.odataDocuments
        .where('documentTypeName')
        .equals(docTypeUni)
        .toArray();
      
      if (cached.length > 0) {
        console.log(`✅ [CACHE] Loaded ${cached.length} documents from cache for ${docTypeUni}`);
        return cached;
      }
    }

    // Try to fetch from API (with or without auth)
    try {
      console.log(`🌐 [API] Fetching documents from /Docs/${docTypeUni}...`);
      const response = await api.getDocsByType(docTypeUni);
      
      console.log(`📡 [API] Response for ${docTypeUni}:`, response);
      
      if (response.success && response.data) {
        // Handle both OData collection format and plain array
        let docs: ODataDocument[] = [];
        
        if (Array.isArray(response.data)) {
          console.log(`✅ [API] Got plain array with ${response.data.length} documents`);
          docs = response.data;
        } else if (response.data.value && Array.isArray(response.data.value)) {
          console.log(`✅ [API] Got OData collection with ${response.data.value.length} documents`);
          docs = response.data.value;
        } else {
          console.warn(`⚠️ [API] Unexpected response format:`, response.data);
        }

        // Save to cache (replace existing docs of this type)
        await db.odataDocuments
          .where('documentTypeName')
          .equals(docTypeUni)
          .delete();
        
        if (docs.length > 0) {
          await db.odataDocuments.bulkAdd(docs);
          await this.updateCacheMetadata(cacheKey);
        }

        console.log(`✅ [API] Fetched and cached ${docs.length} documents for ${docTypeUni}`);
        return docs;
      } else {
        console.warn(`⚠️ [API] No data returned for ${docTypeUni}:`, response);
      }
    } catch (error: any) {
      console.error(`❌ [API] Failed to fetch documents for ${docTypeUni}:`, error.message || error);
    }

    // Fallback to stale cache
    const cached = await db.odataDocuments
      .where('documentTypeName')
      .equals(docTypeUni)
      .toArray();
    
    if (cached.length > 0) {
      console.log(`⚠️ [CACHE] Using stale cache: ${cached.length} documents for ${docTypeUni}`);
      return cached;
    }

    // Return empty array instead of throwing
    console.log(`ℹ️ [CACHE] No documents available for ${docTypeUni} (API failed and no cache)`);
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

