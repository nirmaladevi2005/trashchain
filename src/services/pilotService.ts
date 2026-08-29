import { db, isDemoMode } from '../lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  onSnapshot, query, orderBy 
} from 'firebase/firestore';
import type { Pilot, DataSourceType } from '../types';

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

  public async listPilots(): Promise<Pilot[]> {
    if (isDemoMode() || !db) {
      return mockPilots;
    }

    try {
      const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (snap.empty) return mockPilots;
      return snap.docs.map(d => ({ ...d.data(), pilotId: d.id } as Pilot));
    } catch (err) {
      console.warn('Firestore pilot fetch error, returning demo fallback:', err);
      return mockPilots;
    }
  }

  public async getPilot(pilotId: string): Promise<Pilot | null> {
    if (isDemoMode() || !db) {
      return mockPilots.find(p => p.pilotId === pilotId) || mockPilots[0];
    }

    try {
      const ref = doc(db, this.collectionName, pilotId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return { ...snap.data(), pilotId: snap.id } as Pilot;
      }
      return mockPilots.find(p => p.pilotId === pilotId) || null;
    } catch (err) {
      console.warn('Firestore getPilot error:', err);
      return mockPilots.find(p => p.pilotId === pilotId) || null;
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

    // Data classification integrity rules
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

    if (isDemoMode() || !db) {
      mockPilots.unshift(newPilot);
      return customId;
    }

    try {
      const ref = doc(db, this.collectionName, customId);
      await setDoc(ref, newPilot);
      return customId;
    } catch (err) {
      console.error('Failed to create pilot in Firestore:', err);
      mockPilots.unshift(newPilot);
      return customId;
    }
  }

  public async updatePilot(pilotId: string, updates: Partial<Pilot>): Promise<void> {
    const timestamp = new Date().toISOString();
    const payload = { ...updates, updatedAt: timestamp };

    if (isDemoMode() || !db) {
      const idx = mockPilots.findIndex(p => p.pilotId === pilotId);
      if (idx !== -1) {
        mockPilots[idx] = { ...mockPilots[idx], ...payload };
      }
      return;
    }

    try {
      const ref = doc(db, this.collectionName, pilotId);
      await updateDoc(ref, payload);
    } catch (err) {
      console.error('Failed to update pilot in Firestore:', err);
    }
  }

  public subscribeToPilot(pilotId: string, callback: (pilot: Pilot | null) => void): () => void {
    if (isDemoMode() || !db) {
      const p = mockPilots.find(item => item.pilotId === pilotId) || mockPilots[0];
      callback(p);
      return () => {};
    }

    const ref = doc(db, this.collectionName, pilotId);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        callback({ ...snap.data(), pilotId: snap.id } as Pilot);
      } else {
        const fallback = mockPilots.find(item => item.pilotId === pilotId) || null;
        callback(fallback);
      }
    }, (err) => {
      console.warn('Pilot subscription error:', err);
      const fallback = mockPilots.find(item => item.pilotId === pilotId) || null;
      callback(fallback);
    });
  }
}

export const pilotService = new PilotService();
