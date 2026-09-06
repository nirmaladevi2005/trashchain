import { db, isDemoMode } from '../lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  onSnapshot, query, orderBy, serverTimestamp, arrayUnion 
} from 'firebase/firestore';
import type { Mission, MissionStatus, DataSourceType } from '../types';
import { missions as mockMissions } from '../data/mockData';

import { hotspotService } from './hotspotService';
import { pilotService } from './pilotService';
import { monitoringService } from './monitoringService';

export interface FirestoreMission extends Omit<Mission, 'id'> {
  id: string;
  dataSource: DataSourceType;
  createdAt?: string;
  updatedAt?: string;
}

class MissionService {
  private collectionName = 'missions';
  private demoMissions: FirestoreMission[];
  private subscribers: Set<(missions: FirestoreMission[]) => void> = new Set();

  constructor() {
    const defaultMissions: FirestoreMission[] = mockMissions.map(m => ({
      ...m,
      dataSource: 'DEMO DATA' as DataSourceType,
    }));

    try {
      const saved = localStorage.getItem('trashchain_demo_missions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.demoMissions = parsed;
        } else {
          this.demoMissions = defaultMissions;
        }
      } else {
        this.demoMissions = defaultMissions;
      }
    } catch {
      this.demoMissions = defaultMissions;
    }
  }

  private saveDemoMissionsToStorage() {
    try {
      localStorage.setItem('trashchain_demo_missions', JSON.stringify(this.demoMissions));
    } catch (e) {
      console.warn('[MissionService] Failed to save demo missions to localStorage:', e);
    }
  }

  private notifySubscribers() {
    this.saveDemoMissionsToStorage();
    this.subscribers.forEach(cb => cb([...this.demoMissions]));
  }

  public async getMissions(): Promise<FirestoreMission[]> {
    if (isDemoMode() || !db) {
      return [...this.demoMissions];
    }

    try {
      const q = query(collection(db, this.collectionName), orderBy('date', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          hotspotId: data.hotspotId || '',
          title: data.title || 'Untitled Mission',
          description: data.description || '',
          volunteersNeeded: data.volunteersNeeded || 10,
          volunteersRegistered: data.volunteersRegistered || [],
          points: data.points || 100,
          status: (data.status as MissionStatus) || 'upcoming',
          date: data.date || new Date().toISOString(),
          organizerId: data.organizerId || 'anonymous',
          dataSource: 'FIELD DATA' as DataSourceType,
        };
      });
    } catch (err) {
      console.error('[MissionService] Error fetching live missions, falling back to Demo Data:', err);
      return [...this.demoMissions];
    }
  }

  public subscribeToMissions(
    onData: (missions: FirestoreMission[]) => void, 
    onError?: (err: Error) => void
  ): () => void {
    if (isDemoMode() || !db) {
      onData([...this.demoMissions]);
      this.subscribers.add(onData);
      return () => {
        this.subscribers.delete(onData);
      };
    }

    this.subscribers.add(onData);
    const q = query(collection(db, this.collectionName), orderBy('date', 'asc'));
    const unsubFirestore = onSnapshot(q, (snap) => {
      const list: FirestoreMission[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          hotspotId: data.hotspotId || '',
          title: data.title || 'Untitled Mission',
          description: data.description || '',
          volunteersNeeded: data.volunteersNeeded || 10,
          volunteersRegistered: data.volunteersRegistered || [],
          points: data.points || 100,
          status: (data.status as MissionStatus) || 'upcoming',
          date: data.date || new Date().toISOString(),
          organizerId: data.organizerId || 'anonymous',
          dataSource: 'FIELD DATA' as DataSourceType,
        };
      });
      const firestoreIds = new Set(list.map(m => m.id));
      const localOnly = this.demoMissions.filter(m => !firestoreIds.has(m.id));
      onData([...localOnly, ...list]);
    }, (err) => {
      console.error('[MissionService] Real-time subscription error:', err);
      if (onError) onError(err);
      onData([...this.demoMissions]);
    });

    return () => {
      this.subscribers.delete(onData);
      unsubFirestore();
    };
  }

  public async getMissionById(id: string): Promise<FirestoreMission | null> {
    if (isDemoMode() || !db) {
      const found = this.demoMissions.find(m => m.id === id);
      return found ? { ...found } : null;
    }

    try {
      const docRef = doc(db, this.collectionName, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          id: snap.id,
          hotspotId: data.hotspotId || '',
          title: data.title || 'Untitled Mission',
          description: data.description || '',
          volunteersNeeded: data.volunteersNeeded || 10,
          volunteersRegistered: data.volunteersRegistered || [],
          points: data.points || 100,
          status: (data.status as MissionStatus) || 'upcoming',
          date: data.date || new Date().toISOString(),
          organizerId: data.organizerId || 'anonymous',
          dataSource: 'FIELD DATA' as DataSourceType,
        };
      }
    } catch (err) {
      console.error('[MissionService] Error fetching mission by ID:', err);
    }
    return null;
  }

  public async createMissionFromHotspot(
    hotspotId: string,
    title: string,
    desc: string,
    date: string,
    organizerId: string,
    isDemoSession: boolean = false
  ): Promise<string> {
    const newId = `field-mission-${Date.now()}`;
    const newMission: FirestoreMission = {
      id: newId,
      hotspotId,
      title: title || 'Community Cleanup Mission',
      description: desc || 'Community recovery mission for reported pollution site.',
      volunteersNeeded: 15,
      volunteersRegistered: [organizerId || 'demo-user-1'],
      points: 150,
      status: 'upcoming',
      date: date || new Date(Date.now() + 86400000 * 3).toISOString(),
      organizerId: organizerId || 'demo-user-1',
      dataSource: isDemoMode() || isDemoSession || !db ? 'DEMO DATA' : 'FIELD DATA',
    };

    // Always update local cache & notify subscribers immediately!
    this.demoMissions.unshift(newMission);
    this.notifySubscribers();

    // Propagate status change to linked hotspot immediately
    await hotspotService.updateHotspotStatus(hotspotId, 'mission_active');

    if (!isDemoMode() && !isDemoSession && db) {
      try {
        await setDoc(doc(db, this.collectionName, newId), {
          hotspotId,
          title,
          description: desc,
          volunteersNeeded: 15,
          volunteersRegistered: [organizerId],
          points: 150,
          status: 'upcoming',
          date,
          organizerId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          dataSource: 'FIELD DATA',
        });
      } catch (err) {
        console.warn('[MissionService] Firestore write fallback to local store:', err);
      }
    }

    return newId;
  }

  public async joinMission(missionId: string, userId: string): Promise<void> {
    const foundIndex = this.demoMissions.findIndex(m => m.id === missionId);
    if (foundIndex !== -1) {
      const existing = this.demoMissions[foundIndex].volunteersRegistered || [];
      if (!existing.includes(userId)) {
        this.demoMissions[foundIndex] = {
          ...this.demoMissions[foundIndex],
          volunteersRegistered: [...existing, userId],
        };
        this.notifySubscribers();
      }
    }

    if (isDemoMode() || !db) {
      console.info(`[MissionService] Demo Mode: user ${userId} joined mission ${missionId}`);
      return;
    }

    try {
      const docRef = doc(db, this.collectionName, missionId);
      await updateDoc(docRef, {
        volunteersRegistered: arrayUnion(userId),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('[MissionService] Error joining mission in Firestore:', err);
    }
  }

  public async updateMissionStatus(id: string, status: MissionStatus): Promise<void> {
    const foundIndex = this.demoMissions.findIndex(m => m.id === id);
    let linkedHotspotId = '';

    if (foundIndex !== -1) {
      linkedHotspotId = this.demoMissions[foundIndex].hotspotId;
      this.demoMissions[foundIndex] = {
        ...this.demoMissions[foundIndex],
        status,
      };
      this.notifySubscribers();
    } else if (isDemoMode() || !db) {
      const foundMock = mockMissions.find(m => m.id === id);
      if (foundMock) linkedHotspotId = foundMock.hotspotId;
    }

    // Determine corresponding HotspotStatus
    let targetHotspotStatus: import('../types').HotspotStatus = 'mission_assigned';
    if (status === 'in_progress') {
      targetHotspotStatus = 'in_progress';
    } else if (status === 'proof_submitted' || status === 'verifying' || status === 'completed') {
      targetHotspotStatus = 'cleared';
    } else if (status === 'verified') {
      targetHotspotStatus = 'recovered';
    } else if (status === 'upcoming' || status === 'accepted' || status === 'active') {
      targetHotspotStatus = 'mission_assigned';
    }

    if (linkedHotspotId) {
      await hotspotService.updateHotspotStatus(linkedHotspotId, targetHotspotStatus);
      const hotspot = await hotspotService.getHotspotById(linkedHotspotId);
      if (hotspot && (targetHotspotStatus === 'cleared' || targetHotspotStatus === 'recovered')) {
        await pilotService.ensurePilotForHotspot(hotspot, id);
        await monitoringService.ensureMonitoringCheckpointsForHotspot(hotspot, id);
      }
    }

    if (isDemoMode() || !db) {
      console.info(`[MissionService] Demo Mode: updated mission ${id} status to ${status} (linked hotspot ${linkedHotspotId} -> ${targetHotspotStatus})`);
      return;
    }

    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('[MissionService] Error updating mission status in Firestore:', err);
    }
  }
}

export const missionService = new MissionService();
