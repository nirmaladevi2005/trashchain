import { db, isDemoMode } from '../lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  onSnapshot, query, orderBy, serverTimestamp, arrayUnion 
} from 'firebase/firestore';
import type { Mission, MissionStatus, DataSourceType } from '../types';
import { missions as mockMissions } from '../data/mockData';

import { hotspotService } from './hotspotService';

export interface FirestoreMission extends Omit<Mission, 'id'> {
  id: string;
  dataSource: DataSourceType;
  createdAt?: string;
  updatedAt?: string;
}

class MissionService {
  private collectionName = 'missions';
  private demoMissions: FirestoreMission[] = mockMissions.map(m => ({
    ...m,
    dataSource: 'DEMO DATA' as DataSourceType,
  }));
  private subscribers: Set<(missions: FirestoreMission[]) => void> = new Set();

  private notifySubscribers() {
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

    const q = query(collection(db, this.collectionName), orderBy('date', 'asc'));
    return onSnapshot(q, (snap) => {
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
      onData(list);
    }, (err) => {
      console.error('[MissionService] Real-time subscription error:', err);
      if (onError) onError(err);
      onData([...this.demoMissions]);
    });
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

    if (isDemoMode() || isDemoSession || !db) {
      console.info('[MissionService] Demo Mode: created local mission ID:', newId);
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
        dataSource: 'DEMO DATA',
      };

      this.demoMissions.unshift(newMission);
      this.notifySubscribers();
      await hotspotService.updateHotspotStatus(hotspotId, 'mission_active');
      return newId;
    }

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

    await hotspotService.updateHotspotStatus(hotspotId, 'mission_active');
    return newId;
  }

  public async joinMission(missionId: string, userId: string): Promise<void> {
    if (isDemoMode() || !db) {
      console.info(`[MissionService] Demo Mode: user ${userId} joined mission ${missionId}`);
      return;
    }

    const docRef = doc(db, this.collectionName, missionId);
    await updateDoc(docRef, {
      volunteersRegistered: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });
  }

  public async updateMissionStatus(id: string, status: MissionStatus): Promise<void> {
    if (isDemoMode() || !db) {
      console.info(`[MissionService] Demo Mode: updated mission ${id} status to ${status}`);
      return;
    }

    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  }
}

export const missionService = new MissionService();
