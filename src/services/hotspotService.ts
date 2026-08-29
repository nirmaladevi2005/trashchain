import { db, isDemoMode } from '../lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  onSnapshot, query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import type { Hotspot, HotspotStatus, Severity, WasteCategory, AIAnalysis, PreventionRecommendation, DataSourceType } from '../types';
import { hotspots as mockHotspots } from '../data/mockData';

export interface FirestoreHotspot extends Omit<Hotspot, 'id'> {
  id: string;
  beforePhotoUrl?: string;
  wasteTypes?: WasteCategory[];
  estimatedWasteUnit?: string;
  isRecurring?: boolean;
  reportedBy?: string;
  aiAnalysis?: AIAnalysis;
  preventionRecommendations?: PreventionRecommendation[];
  createdAt?: string;
  updatedAt?: string;
  dataSource: DataSourceType;
}

class HotspotService {
  private collectionName = 'hotspots';

  public async getHotspots(): Promise<FirestoreHotspot[]> {
    if (isDemoMode() || !db) {
      return mockHotspots.map(h => ({
        ...h,
        beforePhotoUrl: h.images[0],
        wasteTypes: [h.category],
        isRecurring: true,
        reportedBy: h.reporterId,
        dataSource: 'DEMO DATA',
      }));
    }

    try {
      const q = query(collection(db, this.collectionName), orderBy('reportedAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || 'Untitled Hotspot',
          description: data.description || '',
          location: data.location || 'Unknown Location',
          coordinates: data.coordinates || { lat: 12.9716, lng: 77.5946 },
          distance: data.distance || '0 km',
          estimatedWaste: data.estimatedWaste || '0 kg',
          category: (data.category as WasteCategory) || 'mixed',
          severity: (data.severity as Severity) || 'medium',
          status: (data.status as HotspotStatus) || 'reported',
          reportedAt: data.reportedAt || new Date().toISOString(),
          reporterId: data.reporterId || 'anonymous',
          images: data.images || [],
          beforePhotoUrl: data.beforePhotoUrl || data.images?.[0] || '',
          wasteTypes: data.wasteTypes || [data.category || 'mixed'],
          isRecurring: data.isRecurring ?? false,
          reportedBy: data.reportedBy || data.reporterId || 'anonymous',
          aiAnalysis: data.aiAnalysis,
          preventionRecommendations: data.preventionRecommendations,
          dataSource: 'FIELD DATA',
        };
      });
    } catch (err) {
      console.error('[HotspotService] Error fetching live hotspots, falling back to Demo Data:', err);
      return mockHotspots.map(h => ({ ...h, dataSource: 'DEMO DATA' }));
    }
  }

  public subscribeToHotspots(
    onData: (hotspots: FirestoreHotspot[]) => void, 
    onError?: (err: Error) => void
  ): () => void {
    if (isDemoMode() || !db) {
      onData(mockHotspots.map(h => ({ ...h, dataSource: 'DEMO DATA' })));
      return () => {};
    }

    const q = query(collection(db, this.collectionName), orderBy('reportedAt', 'desc'));
    return onSnapshot(q, (snap) => {
      const list: FirestoreHotspot[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || 'Untitled Hotspot',
          description: data.description || '',
          location: data.location || 'Unknown Location',
          coordinates: data.coordinates || { lat: 12.9716, lng: 77.5946 },
          distance: data.distance || '0 km',
          estimatedWaste: data.estimatedWaste || '0 kg',
          category: (data.category as WasteCategory) || 'mixed',
          severity: (data.severity as Severity) || 'medium',
          status: (data.status as HotspotStatus) || 'reported',
          reportedAt: data.reportedAt || new Date().toISOString(),
          reporterId: data.reporterId || 'anonymous',
          images: data.images || [],
          beforePhotoUrl: data.beforePhotoUrl || data.images?.[0] || '',
          wasteTypes: data.wasteTypes || [data.category || 'mixed'],
          isRecurring: data.isRecurring ?? false,
          reportedBy: data.reportedBy || data.reporterId || 'anonymous',
          aiAnalysis: data.aiAnalysis,
          preventionRecommendations: data.preventionRecommendations,
          dataSource: 'FIELD DATA',
        };
      });
      onData(list);
    }, (err) => {
      console.error('[HotspotService] Real-time subscription error:', err);
      if (onError) onError(err);
      onData(mockHotspots.map(h => ({ ...h, dataSource: 'DEMO DATA' })));
    });
  }

  public async getHotspotById(id: string): Promise<FirestoreHotspot | null> {
    if (isDemoMode() || !db) {
      const found = mockHotspots.find(h => h.id === id);
      return found ? { ...found, dataSource: 'DEMO DATA' } : null;
    }

    try {
      const docRef = doc(db, this.collectionName, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          id: snap.id,
          title: data.title || 'Untitled Hotspot',
          description: data.description || '',
          location: data.location || 'Unknown Location',
          coordinates: data.coordinates || { lat: 12.9716, lng: 77.5946 },
          distance: data.distance || '0 km',
          estimatedWaste: data.estimatedWaste || '0 kg',
          category: (data.category as WasteCategory) || 'mixed',
          severity: (data.severity as Severity) || 'medium',
          status: (data.status as HotspotStatus) || 'reported',
          reportedAt: data.reportedAt || new Date().toISOString(),
          reporterId: data.reporterId || 'anonymous',
          images: data.images || [],
          beforePhotoUrl: data.beforePhotoUrl || data.images?.[0] || '',
          wasteTypes: data.wasteTypes || [data.category || 'mixed'],
          isRecurring: data.isRecurring ?? false,
          reportedBy: data.reportedBy || data.reporterId || 'anonymous',
          aiAnalysis: data.aiAnalysis,
          preventionRecommendations: data.preventionRecommendations,
          dataSource: 'FIELD DATA',
        };
      }
    } catch (err) {
      console.error('[HotspotService] Error fetching hotspot by ID:', err);
    }
    return null;
  }

  public async createHotspot(data: Omit<FirestoreHotspot, 'id' | 'dataSource'>, isDemoSession: boolean = false): Promise<string> {
    const newId = `field-hotspot-${Date.now()}`;
    if (isDemoMode() || isDemoSession || !db) {
      console.info('[HotspotService] Demo Mode: created local hotspot report ID:', newId);
      return newId;
    }

    // Sanitize payload: remove only properties whose value is undefined
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    );

    await setDoc(doc(db, this.collectionName, newId), {
      ...cleanData,
      reportedAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      dataSource: 'FIELD DATA',
    });
    return newId;
  }

  public async updateHotspotStatus(id: string, status: HotspotStatus): Promise<void> {
    if (isDemoMode() || !db) {
      console.info(`[HotspotService] Demo Mode: updated hotspot ${id} status to ${status}`);
      return;
    }

    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  }
}

export const hotspotService = new HotspotService();
