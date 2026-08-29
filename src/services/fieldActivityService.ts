import { db, isDemoMode } from '../lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import type { FieldActivity, WasteRecord, DataSourceType } from '../types';
import { mockFieldActivities } from '../data/mockData';

export type SyncLifecycleState = 'DRAFT' | 'LOCAL_SAVED' | 'SYNCING' | 'SYNCED' | 'COMPLETED' | 'FAILED';

export interface GPSResult {
  lat: number;
  lng: number;
  accuracy: number; // in meters
  timestamp: string;
  isManualFallback: boolean;
}

export interface SegregatedWasteSummary {
  weighedOnScaleKg: number;
  visualEstimateKg: number;
  countBasedItemsOrBags: number;
}

class FieldActivityService {
  private collectionName = 'fieldActivities';
  private localQueueKey = 'trashchain_offline_sync_queue';

  /**
   * Captures high-accuracy GPS with accuracy in meters and automatic fallback to MANUAL if denied or > 100m.
   */
  public async captureGPS(): Promise<GPSResult> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          lat: 40.7150,
          lng: -74.0100,
          accuracy: 500,
          timestamp: new Date().toISOString(),
          isManualFallback: true,
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const accuracy = pos.coords.accuracy;
          const isManual = accuracy > 100; // Flag as manual/unverified if accuracy > 100m
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(accuracy),
            timestamp: new Date(pos.timestamp).toISOString(),
            isManualFallback: isManual,
          });
        },
        (err) => {
          console.warn('[FieldActivityService] GPS permission denied or failed, using manual fallback:', err);
          resolve({
            lat: 40.7150,
            lng: -74.0100,
            accuracy: 999,
            timestamp: new Date().toISOString(),
            isManualFallback: true,
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  /**
   * Calculates segregated waste totals without merging estimated and weighed data into a single scientifically misleading number.
   */
  public getSegregatedSummary(records: WasteRecord[]): SegregatedWasteSummary {
    let weighedOnScaleKg = 0;
    let visualEstimateKg = 0;
    let countBasedItemsOrBags = 0;

    records.forEach(r => {
      if (r.method === 'weighed_on_scale') {
        if (r.unit === 'kg') weighedOnScaleKg += r.quantity;
      } else if (r.method === 'visual_estimate') {
        if (r.unit === 'kg') visualEstimateKg += r.quantity;
      } else if (r.method === 'count_based_estimate') {
        countBasedItemsOrBags += r.quantity;
      }
    });

    return { weighedOnScaleKg, visualEstimateKg, countBasedItemsOrBags };
  }

  /**
   * Saves activity locally and attempts cloud sync if online and in Live Pilot Mode.
   */
  public async saveActivity(activity: FieldActivity, onSyncStateChange?: (state: SyncLifecycleState) => void): Promise<string> {
    if (onSyncStateChange) onSyncStateChange('LOCAL_SAVED');

    // Save to local queue
    try {
      const existing = JSON.parse(localStorage.getItem(this.localQueueKey) || '[]');
      const updated = existing.filter((a: FieldActivity) => a.id !== activity.id);
      updated.push({ ...activity, isOfflineSaved: true });
      localStorage.setItem(this.localQueueKey, JSON.stringify(updated));
    } catch (err) {
      console.error('[FieldActivityService] Error saving to localStorage:', err);
    }

    if (isDemoMode() || !db || !navigator.onLine) {
      console.info('[FieldActivityService] Demo Mode / Offline: activity preserved in localStorage');
      return activity.id;
    }

    if (onSyncStateChange) onSyncStateChange('SYNCING');

    try {
      await setDoc(doc(db, this.collectionName, activity.id), {
        ...activity,
        isOfflineSaved: false,
        dataSource: 'FIELD DATA' as DataSourceType,
      });
      if (onSyncStateChange) onSyncStateChange('SYNCED');
      
      // Remove from local queue upon successful sync
      const existing = JSON.parse(localStorage.getItem(this.localQueueKey) || '[]');
      const updated = existing.filter((a: FieldActivity) => a.id !== activity.id);
      localStorage.setItem(this.localQueueKey, JSON.stringify(updated));
      
      return activity.id;
    } catch (err) {
      console.error('[FieldActivityService] Sync failed, keeping in local queue:', err);
      if (onSyncStateChange) onSyncStateChange('FAILED');
      return activity.id;
    }
  }

  public async getActivities(): Promise<FieldActivity[]> {
    if (isDemoMode() || !db) {
      return mockFieldActivities;
    }

    try {
      const snap = await getDocs(collection(db, this.collectionName));
      return snap.docs.map(d => d.data() as FieldActivity);
    } catch (err) {
      console.error('[FieldActivityService] Error fetching activities, falling back to mock:', err);
      return mockFieldActivities;
    }
  }

  public async getActivityById(id: string): Promise<FieldActivity | null> {
    if (isDemoMode() || !db) {
      return mockFieldActivities.find(a => a.id === id) || null;
    }

    try {
      const docRef = doc(db, this.collectionName, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) return snap.data() as FieldActivity;
    } catch (err) {
      console.error('[FieldActivityService] Error fetching activity by id:', err);
    }
    return null;
  }
}

export const fieldActivityService = new FieldActivityService();
