import { db, isDemoMode } from '../lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  onSnapshot, query, orderBy 
} from 'firebase/firestore';
import type { Pilot, DataSourceType, Hotspot } from '../types';

export const mockPilots: Pilot[] = [
  {
    pilotId: 'TRC-PILOT-0001',
    siteName: 'Pine Street Vacant Lot Pilot',
    siteDescription: 'First official urban recovery pilot site monitoring plastic accumulation and post-intervention garden transformation.',
    latitude: 40.7150,
    longitude: -74.0100,
    gpsAccuracy: 8,
    baselineStartDate: '2026-07-01',
    baselineEndDate: '2026-07-24',
    interventionDate: '2026-07-25',
    leadUserId: 'user-001',
    leadUserName: 'Alex Rivera',
    status: 'MONITORING',
    interventionType: 'Community Mini Garden & Planters',
    controlSiteId: 'ctrl-001',
    monitoringSchedule: [7, 14, 30, 60, 90],
    dataSource: 'DEMO DATA',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-08-24T18:00:00Z',
    baselineObservation: {
      beforeImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800',
      categories: ['plastic', 'mixed'],
      estimatedWeightKg: 400,
      visibleClusters: 6,
      cleanlinessScore: 18,
      recurrenceStatus: 'significant_recurrence',
      approximateAge: 'Old (> 1 month)',
      siteConditions: 'Dry, heavy plastics along northern perimeter wall',
      measurementMethod: 'visual_estimate',
      notes: 'Initial baseline prior to community cleanup intervention.'
    }
  }
];

class PilotService {
  private collectionName = 'pilots';
  private demoPilots: Pilot[];
  private subscribers: Set<(pilots: Pilot[]) => void> = new Set();

  constructor() {
    try {
      const saved = localStorage.getItem('trashchain_demo_pilots');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.demoPilots = parsed;
        } else {
          this.demoPilots = [...mockPilots];
        }
      } else {
        this.demoPilots = [...mockPilots];
      }
    } catch {
      this.demoPilots = [...mockPilots];
    }
  }

  private saveDemoPilotsToStorage() {
    try {
      localStorage.setItem('trashchain_demo_pilots', JSON.stringify(this.demoPilots));
    } catch (e) {
      console.warn('[PilotService] Failed to save demo pilots to localStorage:', e);
    }
  }

  private notifySubscribers() {
    this.saveDemoPilotsToStorage();
    this.subscribers.forEach(cb => cb([...this.demoPilots]));
  }

  public subscribeToPilots(callback: (pilots: Pilot[]) => void): () => void {
    callback([...this.demoPilots]);
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public async listPilots(): Promise<Pilot[]> {
    if (isDemoMode() || !db) {
      return [...this.demoPilots];
    }

    try {
      const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (snap.empty) return [...this.demoPilots];
      const firestoreList = snap.docs.map(d => ({ ...d.data(), pilotId: d.id } as Pilot));
      const firestoreIds = new Set(firestoreList.map(p => p.pilotId));
      const localOnly = this.demoPilots.filter(p => !firestoreIds.has(p.pilotId));
      return [...localOnly, ...firestoreList];
    } catch (err) {
      console.warn('Firestore pilot fetch error, returning demo fallback:', err);
      return [...this.demoPilots];
    }
  }

  public async getPilot(pilotId: string): Promise<Pilot | null> {
    const foundLocal = this.demoPilots.find(p => p.pilotId === pilotId);
    if (isDemoMode() || !db) {
      return foundLocal || this.demoPilots[0] || null;
    }

    try {
      const ref = doc(db, this.collectionName, pilotId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return { ...snap.data(), pilotId: snap.id } as Pilot;
      }
      return foundLocal || this.demoPilots[0] || null;
    } catch (err) {
      console.warn('Firestore getPilot error:', err);
      return foundLocal || null;
    }
  }

  public async createPilot(
    data: Omit<Pilot, 'pilotId' | 'createdAt' | 'updatedAt'>, 
    isAuthenticated: boolean = false,
    isTest: boolean = false
  ): Promise<string> {
    const timestamp = new Date().toISOString();
    const count = Math.floor(1000 + Math.random() * 9000);
    const customId = `TRC-PILOT-${count}`;

    let classification: DataSourceType = 'DEMO DATA';
    if (isTest) {
      classification = 'TEST DATA';
    } else if (isAuthenticated && !isDemoMode()) {
      classification = 'FIELD DATA';
    }

    const newPilot: Pilot = {
      ...data,
      pilotId: customId,
      dataSource: classification,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.demoPilots.unshift(newPilot);
    this.notifySubscribers();

    if (!isDemoMode() && db) {
      try {
        const ref = doc(db, this.collectionName, customId);
        await setDoc(ref, newPilot);
      } catch (err) {
        console.error('Failed to create pilot in Firestore:', err);
      }
    }

    return customId;
  }

  public async ensurePilotForHotspot(hotspot: Hotspot, missionId?: string): Promise<Pilot> {
    const existing = this.demoPilots.find(p =>
      p.hotspotId === hotspot.id ||
      p.pilotId === `TRC-PILOT-${hotspot.id}` ||
      p.siteName.toLowerCase().includes(hotspot.title.toLowerCase())
    );

    if (existing) {
      return existing;
    }

    const timestamp = new Date().toISOString();
    const todayStr = timestamp.split('T')[0];
    const customId = `TRC-PILOT-${hotspot.id}`;

    const evidenceImage = (hotspot.images && hotspot.images[0]) ||
      hotspot.beforePhotoUrl ||
      hotspot.imageUrl ||
      hotspot.evidencePhoto ||
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800';

    const weightNum = parseInt(hotspot.estimatedWaste || '200') || 200;

    const newPilot: Pilot = {
      pilotId: customId,
      hotspotId: hotspot.id,
      missionId: missionId || '',
      siteName: `${hotspot.title} Pilot`,
      siteDescription: hotspot.description || `Long-term environmental recovery pilot site monitoring post-cleanup recurrence.`,
      latitude: hotspot.coordinates?.lat || 40.7150,
      longitude: hotspot.coordinates?.lng || -74.0100,
      gpsAccuracy: hotspot.locationAccuracy || hotspot.gpsAccuracy || 8,
      baselineStartDate: hotspot.reportedAt ? hotspot.reportedAt.split('T')[0] : todayStr,
      baselineEndDate: todayStr,
      interventionDate: todayStr,
      leadUserId: 'user-001',
      leadUserName: 'Community Lead',
      status: 'RECOVERY',
      interventionType: `${(hotspot.category || 'mixed').toUpperCase()} Cleanup & Place Transformation`,
      controlSiteId: 'ctrl-001',
      monitoringSchedule: [7, 14, 30, 60, 90],
      dataSource: hotspot.dataSource || 'DEMO DATA',
      createdAt: timestamp,
      updatedAt: timestamp,
      baselineObservation: {
        beforeImage: evidenceImage,
        categories: [hotspot.category || 'mixed'],
        estimatedWeightKg: weightNum,
        visibleClusters: 5,
        cleanlinessScore: 20,
        recurrenceStatus: 'clean',
        approximateAge: 'Recent',
        siteConditions: hotspot.description || 'Pre-intervention baseline observation',
        measurementMethod: 'visual_estimate',
        notes: `Baseline observation recorded from reported Hotspot #${hotspot.id}`
      }
    };

    this.demoPilots.unshift(newPilot);
    this.notifySubscribers();

    if (!isDemoMode() && db) {
      try {
        const ref = doc(db, this.collectionName, customId);
        await setDoc(ref, newPilot);
      } catch (err) {
        console.error('[PilotService] Failed to create pilot in Firestore:', err);
      }
    }

    return newPilot;
  }

  public async updatePilot(pilotId: string, updates: Partial<Pilot>): Promise<void> {
    const timestamp = new Date().toISOString();
    const payload = { ...updates, updatedAt: timestamp };

    const idx = this.demoPilots.findIndex(p => p.pilotId === pilotId);
    if (idx !== -1) {
      this.demoPilots[idx] = { ...this.demoPilots[idx], ...payload };
      this.notifySubscribers();
    }

    if (isDemoMode() || !db) return;

    try {
      const ref = doc(db, this.collectionName, pilotId);
      await updateDoc(ref, payload);
    } catch (err) {
      console.error('Failed to update pilot in Firestore:', err);
    }
  }

  public subscribeToPilot(pilotId: string, callback: (pilot: Pilot | null) => void): () => void {
    const p = this.demoPilots.find(item => item.pilotId === pilotId) || this.demoPilots[0] || null;
    callback(p);

    const onListChange = (list: Pilot[]) => {
      const updated = list.find(item => item.pilotId === pilotId) || list[0] || null;
      callback(updated);
    };

    this.subscribers.add(onListChange);

    if (isDemoMode() || !db) {
      return () => {
        this.subscribers.delete(onListChange);
      };
    }

    const ref = doc(db, this.collectionName, pilotId);
    const unsubFirestore = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        callback({ ...snap.data(), pilotId: snap.id } as Pilot);
      } else {
        callback(p);
      }
    }, (err) => {
      console.warn('Pilot subscription error:', err);
      callback(p);
    });

    return () => {
      this.subscribers.delete(onListChange);
      unsubFirestore();
    };
  }
}

export const pilotService = new PilotService();
