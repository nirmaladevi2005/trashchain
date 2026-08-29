import { db, isDemoMode } from '../lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import type { RecoveryRecord, DataSourceType } from '../types';
import { mockRecoveryRecords } from '../data/mockData';

export interface FirestoreRecoveryRecord extends RecoveryRecord {
  dataSource: DataSourceType;
  createdAt?: string;
}

class RecoveryService {
  private collectionName = 'recoveryRecords';

  public async getRecoveryRecords(referenceId?: string): Promise<FirestoreRecoveryRecord[]> {
    if (isDemoMode() || !db) {
      let records = mockRecoveryRecords.map(r => ({
        ...r,
        dataSource: 'DEMO DATA' as DataSourceType,
      }));
      if (referenceId) {
        records = records.filter(r => r.referenceId === referenceId);
      }
      return records;
    }

    try {
      let q = query(collection(db, this.collectionName), orderBy('verifiedAt', 'desc'));
      if (referenceId) {
        q = query(collection(db, this.collectionName), where('referenceId', '==', referenceId));
      }
      const snap = await getDocs(q);
      return snap.docs.map(d => ({
        ...(d.data() as RecoveryRecord),
        id: d.id,
        dataSource: 'FIELD DATA' as DataSourceType,
      }));
    } catch (err) {
      console.error('[RecoveryService] Error fetching records, falling back to Demo Data:', err);
      return mockRecoveryRecords.map(r => ({ ...r, dataSource: 'DEMO DATA' as DataSourceType }));
    }
  }

  public async getRecordById(id: string): Promise<FirestoreRecoveryRecord | null> {
    if (isDemoMode() || !db) {
      const found = mockRecoveryRecords.find(r => r.id === id);
      return found ? { ...found, dataSource: 'DEMO DATA' as DataSourceType } : null;
    }

    try {
      const docRef = doc(db, this.collectionName, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return {
          ...(snap.data() as RecoveryRecord),
          id: snap.id,
          dataSource: 'FIELD DATA' as DataSourceType,
        };
      }
    } catch (err) {
      console.error('[RecoveryService] Error fetching record by ID:', err);
    }
    return null;
  }

  public async createRecoveryRecord(data: Omit<RecoveryRecord, 'id'>): Promise<string> {
    const newId = `TRC-REC-${Date.now()}`;
    if (isDemoMode() || !db) {
      console.info('[RecoveryService] Demo Mode: created local recovery record:', newId);
      return newId;
    }

    await setDoc(doc(db, this.collectionName, newId), {
      ...data,
      id: newId,
      createdAt: serverTimestamp(),
      dataSource: 'FIELD DATA' as DataSourceType,
    });
    return newId;
  }
}

export const recoveryService = new RecoveryService();
