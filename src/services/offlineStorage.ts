/**
 * RAIN-X Offline Storage & IndexedDB Service
 * Caches district forecast grid data, synoptic maps, and alert preferences.
 */

import { DistrictForecast } from '../types';

const DB_NAME = 'RainX_OfflineDB';
const DB_VERSION = 1;
const STORE_DISTRICTS = 'districtForecastGrid';
const STORE_ALERTS = 'alertSubscriptions';

class OfflineStorageService {
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        return resolve(this.db);
      }

      if (typeof window === 'undefined' || !window.indexedDB) {
        console.warn('[OfflineStorage] IndexedDB not available, fallback to localStorage');
        return reject(new Error('IndexedDB not supported'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_DISTRICTS)) {
          db.createObjectStore(STORE_DISTRICTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_ALERTS)) {
          db.createObjectStore(STORE_ALERTS, { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.isInitialized = true;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.warn('[OfflineStorage] Failed to open IndexedDB:', event);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  /**
   * Caches district forecasts in both IndexedDB and localStorage (for immediate sync)
   */
  async cacheDistrictGrid(districts: DistrictForecast[]): Promise<void> {
    const timestamp = new Date().toISOString();
    try {
      localStorage.setItem('rainx_districts_cache', JSON.stringify(districts));
      localStorage.setItem('rainx_cache_timestamp', timestamp);

      // Post message to Service Worker if active
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_DISTRICT_GRID',
          payload: districts
        });
      }

      const db = await this.initDB();
      const tx = db.transaction(STORE_DISTRICTS, 'readwrite');
      const store = tx.objectStore(STORE_DISTRICTS);

      for (const district of districts) {
        store.put(district);
      }
    } catch (e) {
      console.warn('[OfflineStorage] Cache save fallback:', e);
    }
  }

  /**
   * Retrieves cached district forecast grid
   */
  async getCachedDistrictGrid(): Promise<DistrictForecast[] | null> {
    // Try localStorage first for instant synchronous read
    try {
      const raw = localStorage.getItem('rainx_districts_cache');
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[OfflineStorage] localStorage read failed:', e);
    }

    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_DISTRICTS, 'readonly');
        const store = tx.objectStore(STORE_DISTRICTS);
        const req = store.getAll();

        req.onsuccess = () => {
          if (req.result && req.result.length > 0) {
            resolve(req.result as DistrictForecast[]);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  getCacheTimestamp(): string {
    return localStorage.getItem('rainx_cache_timestamp') || 'Just now (Memory Cache)';
  }

  // Alert Subscriptions
  saveAlertSubscription(sub: any): void {
    const subs = this.getAlertSubscriptions();
    subs.push({ ...sub, id: Date.now(), createdAt: new Date().toISOString() });
    localStorage.setItem('rainx_alert_subscriptions', JSON.stringify(subs));
  }

  getAlertSubscriptions(): any[] {
    try {
      const raw = localStorage.getItem('rainx_alert_subscriptions');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export const offlineStorage = new OfflineStorageService();
