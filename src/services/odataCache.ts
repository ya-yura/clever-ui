// === 📁 src/services/odataCache.ts ===
// OData caching service for offline support

import { db } from './db';
import { ODataDocumentType, ODataDocument, ODataCollection } from '@/types/odata';
import { api } from './api';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ALL_DOCS_CACHE_KEY = 'docs_all';

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
   * Extract OData documents from API response
   */
  private extractDocsFromResponse(data: any): ODataDocument[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.value)) return data.value;
    if (typeof data === 'object' && data.id) return [data as ODataDocument];
    return [];
  }

  /**
   * Fetch documents from API and persist in IndexedDB
   */
  private async fetchAndCacheAllDocuments(): Promise<ODataDocument[]> {
    console.log('🌐 [API] Fetching ALL documents from /Docs ...');
    const response: any = await api.getAllDocs();

    if (response.success && response.data) {
      const docs = this.extractDocsFromResponse(response.data);

      if (docs.length > 0) {
        await db.odataDocuments.clear();
        await db.odataDocuments.bulkPut(docs);
        await this.updateCacheMetadata(ALL_DOCS_CACHE_KEY);
        console.log(`✅ [API] Stored ${docs.length} documents from /Docs into cache`);
      } else {
        console.warn('⚠️ [API] /Docs returned empty list');
      }

      return docs;
    }

    console.warn('⚠️ [API] No data received from /Docs endpoint');
    return [];
  }

  /**
   * Get all documents (with caching)
   */
  async getAllDocuments(options?: { forceRefresh?: boolean }): Promise<ODataDocument[]> {
    const forceRefresh = options?.forceRefresh === true;

    if (!forceRefresh && await this.isCacheValid(ALL_DOCS_CACHE_KEY)) {
      const cached = await db.odataDocuments.toArray();
      if (cached.length > 0) {
        console.log('✅ [CACHE] Loaded all documents from cache');
        return cached;
      }
    }

    try {
      const docs = await this.fetchAndCacheAllDocuments();
      if (docs.length > 0) {
        return docs;
      }
    } catch (error) {
      console.error('❌ [CACHE] Failed to fetch documents from API:', error);
    }

    const fallback = await db.odataDocuments.toArray();
    if (fallback.length > 0) {
      console.log('⚠️ [CACHE] Using stale documents cache');
      return fallback;
    }

    console.warn('⚠️ [CACHE] No documents available (API failed and cache empty)');
    return [];
  }

  /**
   * Fetch documents for specific type using multiple strategies
   */
  private async fetchDocsByTypeFromApi(
    docTypeUni: string,
    names?: string[]
  ): Promise<ODataDocument[]> {
    const attempts: Array<() => Promise<any>> = [];

    // Approach 1: specialized entity set /Docs/{docTypeUni}
    attempts.push(() => api.get(`/Docs/${docTypeUni}`));

    // Approach 2: /Docs with $filter documentTypeName eq '...'
    const filterCandidates = Array.from(
      new Set(
        [docTypeUni, ...(names || [])]
          .filter(Boolean)
          .map((name) => name.replace(/'/g, "''"))
      )
    );
    if (filterCandidates.length > 0) {
      const filter = filterCandidates
        .map((name) => `documentTypeName eq '${name}'`)
        .join(' or ');
      attempts.push(() => api.get('/Docs', { $filter: filter }));
    }

    // Approach 3: fetch all docs
    attempts.push(() => api.getAllDocs());

    for (const attempt of attempts) {
      try {
        const response: any = await attempt();
        if (response?.success && response.data) {
          const docs = this.extractDocsFromResponse(response.data);
          if (docs.length > 0) {
            console.log(`✅ [API] Loaded ${docs.length} docs for ${docTypeUni}`);
            return docs;
          }
        }
      } catch (error) {
        console.warn(`⚠️ [API] Attempt failed for ${docTypeUni}:`, error);
      }
    }

    console.warn(`⚠️ [API] All attempts failed for ${docTypeUni}`);
    return [];
  }

  /**
   * Get documents by type with caching
   */
  async getDocsByType(
    docTypeUni: string,
    options?: { names?: string[]; forceRefresh?: boolean }
  ): Promise<ODataDocument[]> {
    const cacheKey = `docs_${docTypeUni}`;
    const forceRefresh = options?.forceRefresh === true;

    console.log(`📦 [CACHE] getDocsByType(${docTypeUni})`);

    // Try cache first
    if (!forceRefresh && await this.isCacheValid(cacheKey)) {
      const cached = await db.odataDocuments
        .where('documentTypeName')
        .equals(docTypeUni)
        .toArray();
      if (cached.length > 0) {
        console.log(`✅ [CACHE] Returning ${cached.length} cached docs for ${docTypeUni}`);
        return cached;
      }
    }

    // Fetch from API
    const fetched = await this.fetchDocsByTypeFromApi(docTypeUni, options?.names);

    if (fetched.length > 0) {
      await db.odataDocuments.bulkPut(fetched);
          await this.updateCacheMetadata(cacheKey);
      // Invalidate ALL cache to avoid stale data
      await db.cacheMetadata.delete(ALL_DOCS_CACHE_KEY);
      return fetched;
    }

    // Fallback to stale cache
    const fallback = await db.odataDocuments
      .where('documentTypeName')
      .equals(docTypeUni)
      .toArray();
    if (fallback.length > 0) {
      console.log(`⚠️ [CACHE] Using stale cache for ${docTypeUni}`);
      return fallback;
    }

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

