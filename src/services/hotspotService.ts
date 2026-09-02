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
  private demoHotspots: FirestoreHotspot[] = mockHotspots.map(h => ({
    ...h,
    beforePhotoUrl: h.images[0],
    wasteTypes: [h.category],
    isRecurring: true,
    reportedBy: h.reporterId,
    dataSource: 'DEMO DATA' as DataSourceType,
  }));
  private subscribers: Set<(hotspots: FirestoreHotspot[]) => void> = new Set();

  private notifySubscribers() {
    this.subscribers.forEach(cb => cb([...this.demoHotspots]));
  }

  public async getHotspots(): Promise<FirestoreHotspot[]> {
    if (isDemoMode() || !db) {
      return [...this.demoHotspots];
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
      return [...this.demoHotspots];
    }
  }

  public subscribeToHotspots(
    onData: (hotspots: FirestoreHotspot[]) => void, 
    onError?: (err: Error) => void
  ): () => void {
    if (isDemoMode() || !db) {
      onData([...this.demoHotspots]);
      this.subscribers.add(onData);
      return () => {
        this.subscribers.delete(onData);
      };
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
      onData([...this.demoHotspots]);
    });
  }

  public async getHotspotById(id: string): Promise<FirestoreHotspot | null> {
    if (isDemoMode() || !db) {
      const found = this.demoHotspots.find(h => h.id === id);
      return found ? { ...found } : null;
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
      const newHotspot: FirestoreHotspot = {
        id: newId,
        title: data.title || 'Reported Pollution Hotspot',
        description: data.description || '',
        location: data.location || 'Unknown Location',
        coordinates: data.coordinates || { lat: 12.9716, lng: 77.5946 },
        distance: data.distance || '0.8 km',
        estimatedWaste: data.estimatedWaste || 'Approx. 45 kg',
        category: (data.category as WasteCategory) || 'mixed',
        severity: (data.severity as Severity) || 'medium',
        status: 'reported',
        reportedAt: data.reportedAt || new Date().toISOString().split('T')[0],
        reporterId: data.reporterId || 'demo-user-1',
        images: data.images || ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800'],
        beforePhotoUrl: data.beforePhotoUrl || data.images?.[0] || '',
        wasteTypes: data.wasteTypes || [data.category || 'mixed'],
        isRecurring: data.isRecurring ?? false,
        reportedBy: data.reportedBy || 'Citizen Volunteer',
        aiAnalysis: data.aiAnalysis,
        preventionRecommendations: data.preventionRecommendations,
        dataSource: 'DEMO DATA',
      };

      this.demoHotspots.unshift(newHotspot);
      this.notifySubscribers();
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
    const foundIndex = this.demoHotspots.findIndex(h => h.id === id);
    if (foundIndex !== -1) {
      this.demoHotspots[foundIndex] = {
        ...this.demoHotspots[foundIndex],
        status
      };
      this.notifySubscribers();
    }

    if (isDemoMode() || !db) {
      console.info(`[HotspotService] Demo Mode: updated hotspot ${id} status to ${status}`);
      return;
    }

    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('[HotspotService] Error updating hotspot status in Firestore:', err);
    }
  }
}

export const hotspotService = new HotspotService();
