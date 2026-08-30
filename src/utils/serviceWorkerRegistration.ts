// Service Worker Registration & Offline Document Cache Manager
// Syrian Engineering Syndicate - Hasakah Branch

export interface OfflineCacheStats {
  cachedDocumentsCount: number;
  engineersCached: number;
  isServiceWorkerActive: boolean;
  lastCachedAt: string;
}

export function registerServiceWorker(onUpdateFound?: () => void) {
  if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered with scope:', registration.scope);

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('[PWA] New content is available; please refresh.');
                  onUpdateFound?.();
                } else {
                  console.log('[PWA] Content is cached for offline use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.warn('[PWA] Error during Service Worker registration:', error);
        });
    });
  }
}

/**
 * Cache an invoice or pay order document to CacheStorage for offline viewing
 */
export async function cacheDocumentForOffline(
  docId: string,
  docType: 'INV' | 'EPO' | 'SFD',
  payload: any
): Promise<boolean> {
  try {
    // 1. Cache in LocalStorage as instant synchronous fallback
    const offlineDocsKey = 'syn_offline_documents_v1';
    const existing = JSON.parse(localStorage.getItem(offlineDocsKey) || '{}');
    existing[docId] = {
      docId,
      docType,
      payload,
      cachedAt: new Date().toISOString()
    };
    localStorage.setItem(offlineDocsKey, JSON.stringify(existing));

    // 2. Cache via Service Worker Cache API if supported
    if ('caches' in window) {
      const cache = await caches.open('syn-accounting-docs-v2');
      const docResponse = new Response(JSON.stringify({ docId, docType, payload }), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put(`/offline-doc/${docId}`, docResponse);
    }

    // 3. Post message to active SW
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_DOCUMENT',
        docId,
        docData: { docId, docType, payload }
      });
    }

    return true;
  } catch (err) {
    console.warn('[PWA] Failed to cache document offline:', err);
    return false;
  }
}

/**
 * Retrieve cached document payload when offline
 */
export async function getCachedDocument(docId: string): Promise<any | null> {
  try {
    // Check CacheStorage first
    if ('caches' in window) {
      const cache = await caches.open('syn-accounting-docs-v2');
      const response = await cache.match(`/offline-doc/${docId}`);
      if (response) {
        const data = await response.json();
        return data.payload;
      }
    }

    // Fallback to localStorage
    const offlineDocsKey = 'syn_offline_documents_v1';
    const existing = JSON.parse(localStorage.getItem(offlineDocsKey) || '{}');
    if (existing[docId]) {
      return existing[docId].payload;
    }
  } catch (err) {
    console.warn('[PWA] Could not fetch cached document:', err);
  }
  return null;
}

/**
 * Cache all current master lists (Engineers, Invoices, Pay Orders) for offline browsing
 */
export function cacheMasterDataOffline(data: {
  engineers: any[];
  invoices: any[];
  payOrders: any[];
  deposits: any[];
  categories?: any[];
}) {
  try {
    localStorage.setItem('syn_engineers_v1', JSON.stringify(data.engineers));
    localStorage.setItem('syn_invoices_v1', JSON.stringify(data.invoices));
    localStorage.setItem('syn_payorders_v1', JSON.stringify(data.payOrders));
    localStorage.setItem('syn_deposits_v1', JSON.stringify(data.deposits));
    if (data.categories) {
      localStorage.setItem('syn_categories_v1', JSON.stringify(data.categories));
    }
    localStorage.setItem('syn_last_offline_sync', new Date().toISOString());

    // Pre-cache individual documents
    data.invoices.forEach(inv => {
      cacheDocumentForOffline(inv.invoiceNumber, 'INV', inv);
    });
    data.payOrders.forEach(epo => {
      cacheDocumentForOffline(epo.payOrderNumber, 'EPO', epo);
    });
    data.deposits.forEach(sfd => {
      cacheDocumentForOffline(sfd.depositNumber, 'SFD', sfd);
    });
  } catch (e) {
    console.warn('[PWA] Master data offline cache error:', e);
  }
}
