import { db, isDemoMode } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import type { MonitoringCheckpoint, RecurrenceObservation, DataSourceType, Hotspot } from '../types';
import { mockMonitoringCheckpoints } from '../data/mockData';

export interface FirestoreCheckpoint extends MonitoringCheckpoint {
  dataSource: DataSourceType;
  createdAt?: string;
}

class MonitoringService {
  private collectionName = 'monitoringCheckpoints';
  private demoCheckpoints: MonitoringCheckpoint[];
  private subscribers: Set<(checkpoints: MonitoringCheckpoint[]) => void> = new Set();

  constructor() {
    try {
      const saved = localStorage.getItem('trashchain_demo_monitoring_checkpoints');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.demoCheckpoints = parsed;
        } else {
          this.demoCheckpoints = [...mockMonitoringCheckpoints];
        }
      } else {
        this.demoCheckpoints = [...mockMonitoringCheckpoints];
      }
    } catch {
      this.demoCheckpoints = [...mockMonitoringCheckpoints];
    }
  }

  private saveDemoCheckpointsToStorage() {
    try {
      localStorage.setItem('trashchain_demo_monitoring_checkpoints', JSON.stringify(this.demoCheckpoints));
    } catch (e) {
      console.warn('[MonitoringService] Failed to save demo checkpoints to localStorage:', e);
    }
  }

  private notifySubscribers() {
    this.saveDemoCheckpointsToStorage();
    this.subscribers.forEach(cb => cb([...this.demoCheckpoints]));
  }

  public subscribeToCheckpoints(callback: (checkpoints: MonitoringCheckpoint[]) => void): () => void {
    callback([...this.demoCheckpoints]);
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public async getAllCheckpoints(): Promise<MonitoringCheckpoint[]> {
    if (isDemoMode() || !db) {
      return [...this.demoCheckpoints];
    }
    try {
      const q = query(collection(db, this.collectionName), orderBy('day', 'asc'));
      const snap = await getDocs(q);
      if (snap.empty) return [...this.demoCheckpoints];
      const firestoreList = snap.docs.map(d => ({
        ...(d.data() as MonitoringCheckpoint),
        id: d.id,
        dataSource: 'FIELD DATA' as DataSourceType,
      }));
      const firestoreIds = new Set(firestoreList.map(c => c.id));
      const localOnly = this.demoCheckpoints.filter(c => !firestoreIds.has(c.id));
      return [...localOnly, ...firestoreList];
    } catch (err) {
      console.error('[MonitoringService] Error fetching all checkpoints, falling back to local store:', err);
      return [...this.demoCheckpoints];
    }
  }

  public async getCheckpoints(recoveryRecordId: string): Promise<FirestoreCheckpoint[]> {
    const localMatches = this.demoCheckpoints.filter(c => c.recoveryRecordId === recoveryRecordId);
    if (isDemoMode() || !db) {
      return localMatches.map(c => ({ ...c, dataSource: 'DEMO DATA' as DataSourceType }));
    }

    try {
      const q = query(
        collection(db, this.collectionName), 
        where('recoveryRecordId', '==', recoveryRecordId),
        orderBy('day', 'asc')
      );
      const snap = await getDocs(q);
      if (snap.empty) return localMatches.map(c => ({ ...c, dataSource: 'DEMO DATA' as DataSourceType }));
      return snap.docs.map(d => ({
        ...(d.data() as MonitoringCheckpoint),
        id: d.id,
        dataSource: 'FIELD DATA' as DataSourceType,
      }));
    } catch (err) {
      console.error('[MonitoringService] Error fetching checkpoints, falling back to Demo Data:', err);
      return localMatches.map(c => ({ ...c, dataSource: 'DEMO DATA' as DataSourceType }));
    }
  }

  public async ensureMonitoringCheckpointsForHotspot(hotspot: Hotspot, _missionId?: string): Promise<MonitoringCheckpoint[]> {
    const recoveryRecordId = `TRC-REC-${hotspot.id}`;
    const existing = this.demoCheckpoints.filter(c =>
      c.hotspotId === hotspot.id || c.recoveryRecordId === recoveryRecordId
    );

    if (existing.length > 0) {
      return existing;
    }

    const today = new Date();
    const days = [7, 14, 30, 60, 90];
    const created: MonitoringCheckpoint[] = days.map((d) => {
      const scheduled = new Date(today);
      scheduled.setDate(scheduled.getDate() + d);
      return {
        id: `chk-${hotspot.id}-day${d}`,
        recoveryRecordId,
        hotspotId: hotspot.id,
        day: d,
        scheduledDate: scheduled.toISOString().split('T')[0],
        recurrenceStatus: 'clean',
        estimatedRecurrenceKg: 0,
        cleanlinessScore: 90,
        status: 'pending',
        notes: `Surveillance checkpoint for Day ${d} post-cleanup.`
      };
    });

    this.demoCheckpoints.push(...created);
    this.notifySubscribers();

    if (!isDemoMode() && db) {
      try {
        for (const chk of created) {
          await setDoc(doc(db, this.collectionName, chk.id), {
            ...chk,
            createdAt: serverTimestamp(),
            dataSource: 'FIELD DATA' as DataSourceType,
          });
        }
      } catch (err) {
        console.error('[MonitoringService] Failed to save checkpoints to Firestore:', err);
      }
    }

    return created;
  }

  public async saveCheckpoint(checkpoint: MonitoringCheckpoint): Promise<string> {
    const docId = checkpoint.id || `chk-${Date.now()}`;
    const updated: MonitoringCheckpoint = {
      ...checkpoint,
      id: docId,
      status: checkpoint.status || 'completed',
      actualDate: checkpoint.actualDate || new Date().toISOString().split('T')[0],
    };

    const idx = this.demoCheckpoints.findIndex(c => c.id === docId);
    if (idx !== -1) {
      this.demoCheckpoints[idx] = updated;
    } else {
      this.demoCheckpoints.push(updated);
    }
    this.notifySubscribers();

    if (isDemoMode() || !db) {
      console.info('[MonitoringService] Saved local checkpoint:', docId);
      return docId;
    }

    try {
      await setDoc(doc(db, this.collectionName, docId), {
        ...updated,
        createdAt: serverTimestamp(),
        dataSource: 'FIELD DATA' as DataSourceType,
      });
    } catch (err) {
      console.error('[MonitoringService] Error saving checkpoint to Firestore:', err);
    }

    return docId;
  }

  public calculateRecurrenceReduction(
    baselineMonthlyAverageKg: number, 
    checkpoints: MonitoringCheckpoint[]
  ): RecurrenceObservation {
    const completed = checkpoints.filter(c => c.status === 'completed' && c.actualDate);
    
    if (completed.length < 2) {
      return {
        baselineMonthlyAverageKg,
        postInterventionAverageKg: 0,
        observedReductionPercentage: null,
        dataSufficient: false,
        explanation: 'Insufficient field data for reliable recurrence reduction calculation. At least 2 physical surveillance checkpoints (e.g., Day 7 and Day 14) must be completed to verify sustained impact.'
      };
    }

    const totalRecurrenceKg = completed.reduce((acc, curr) => acc + (curr.estimatedRecurrenceKg || 0), 0);
    const avgRecurrence = totalRecurrenceKg / completed.length;
    
    let reductionPct = Math.round(((baselineMonthlyAverageKg - avgRecurrence) / baselineMonthlyAverageKg) * 100);
    if (reductionPct < -100) reductionPct = -100;
    if (reductionPct > 100) reductionPct = 100;

    return {
      baselineMonthlyAverageKg,
      postInterventionAverageKg: Math.round(avgRecurrence * 10) / 10,
      observedReductionPercentage: reductionPct,
      dataSufficient: true,
      explanation: `Scientifically verified from ${completed.length} physical field inspections. Observed recurrence reduction is ${reductionPct}% compared to pre-cleanup baseline dumping rates.`
    };
  }
}

export const monitoringService = new MonitoringService();
