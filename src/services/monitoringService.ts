import { db, isDemoMode } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import type { MonitoringCheckpoint, RecurrenceObservation, DataSourceType } from '../types';
import { mockMonitoringCheckpoints } from '../data/mockData';

export interface FirestoreCheckpoint extends MonitoringCheckpoint {
  dataSource: DataSourceType;
  createdAt?: string;
}

class MonitoringService {
  private collectionName = 'monitoringCheckpoints';

  public async getCheckpoints(recoveryRecordId: string): Promise<FirestoreCheckpoint[]> {
    if (isDemoMode() || !db) {
      return mockMonitoringCheckpoints
        .filter(c => c.recoveryRecordId === recoveryRecordId)
        .map(c => ({
          ...c,
          dataSource: 'DEMO DATA' as DataSourceType,
        }));
    }

    try {
      const q = query(
        collection(db, this.collectionName), 
        where('recoveryRecordId', '==', recoveryRecordId),
        orderBy('day', 'asc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({
        ...(d.data() as MonitoringCheckpoint),
        id: d.id,
        dataSource: 'FIELD DATA' as DataSourceType,
      }));
    } catch (err) {
      console.error('[MonitoringService] Error fetching checkpoints, falling back to Demo Data:', err);
      return mockMonitoringCheckpoints
        .filter(c => c.recoveryRecordId === recoveryRecordId)
        .map(c => ({ ...c, dataSource: 'DEMO DATA' as DataSourceType }));
    }
  }

  public async saveCheckpoint(checkpoint: MonitoringCheckpoint): Promise<string> {
    const docId = checkpoint.id || `chk-${Date.now()}`;
    if (isDemoMode() || !db) {
      console.info('[MonitoringService] Demo Mode: saved local checkpoint:', docId);
      return docId;
    }

    await setDoc(doc(db, this.collectionName, docId), {
      ...checkpoint,
      id: docId,
      status: 'completed',
      actualDate: new Date().toISOString(),
      createdAt: serverTimestamp(),
      dataSource: 'FIELD DATA' as DataSourceType,
    });
    return docId;
  }

  /**
   * Enforces the Data Sufficiency Rule: calculates recurrence reduction ONLY from completed checkpoints.
   * If fewer than 2 physical field inspections are completed, outputs insufficient data warning rather than fabricating numbers.
   */
  public calculateRecurrenceReduction(
    baselineMonthlyAverageKg: number, 
    checkpoints: MonitoringCheckpoint[]
  ): RecurrenceObservation {
    const completed = checkpoints.filter(c => c.status === 'completed' && c.actualDate);
    
    // Data Sufficiency Rule: require at least 2 completed physical checkpoints
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
    
    // Calculate percentage reduction compared to baseline monthly average
    let reductionPct = Math.round(((baselineMonthlyAverageKg - avgRecurrence) / baselineMonthlyAverageKg) * 100);
    if (reductionPct < -100) reductionPct = -100; // Cap negative spike at -100%
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
