import { db, isDemoMode } from '../lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  onSnapshot, query, orderBy, serverTimestamp, arrayUnion 
} from 'firebase/firestore';
import type { Mission, MissionStatus, DataSourceType } from '../types';
import { missions as mockMissions } from '../data/mockData';

export interface FirestoreMission extends Omit<Mission, 'id'> {
  id: string;
  dataSource: DataSourceType;
  createdAt?: string;
  updatedAt?: string;
}

class MissionService {
  private collectionName = 'missions';

  public async getMissions(): Promise<FirestoreMission[]> {
    if (isDemoMode() || !db) {
      return mockMissions.map(m => ({
        ...m,
        dataSource: 'DEMO DATA' as DataSourceType,
      }));
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
      return mockMissions.map(m => ({ ...m, dataSource: 'DEMO DATA' as DataSourceType }));
    }
  }

  public subscribeToMissions(
    onData: (missions: FirestoreMission[]) => void, 
    onError?: (err: Error) => void
  ): () => void {
    if (isDemoMode() || !db) {
      onData(mockMissions.map(m => ({ ...m, dataSource: 'DEMO DATA' as DataSourceType })));
      return () => {};
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
      onData(mockMissions.map(m => ({ ...m, dataSource: 'DEMO DATA' as DataSourceType })));
    });
  }

  public async getMissionById(id: string): Promise<FirestoreMission | null> {
    if (isDemoMode() || !db) {
      const found = mockMissions.find(m => m.id === id);
      return found ? { ...found, dataSource: 'DEMO DATA' as DataSourceType } : null;
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

  public async createMissionFromHotspot(hotspotId: string, title: string, desc: string, date: string, organizerId: string): Promise<string> {
    const newId = `field-mission-${Date.now()}`;
    if (isDemoMode() || !db) {
      console.info('[MissionService] Demo Mode: created local mission ID:', newId);
      return newId;
    }

    await setDoc(doc(db, this.collectionName, newId), {
      hotspotId,
      title,
      description: desc,
      volunteersNeeded: 15,
      volunteersRegistered: [organizerId],
      points: 200,
      status: 'upcoming',
      date,
      organizerId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      dataSource: 'FIELD DATA',
    });
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
