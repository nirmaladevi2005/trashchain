import { db, isDemoMode } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { hotspots as mockHotspots, missions as mockMissions, mockRecoveryRecords } from '../data/mockData';
import type { DataSourceType } from '../types';

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  message: string;
}

class MigrationService {
  /**
   * Safely imports existing mock prototype data into Firestore, explicitly tagging every document
   * with dataSource: 'DEMO DATA' so that synthetic prototype numbers are never mistaken for real field recordings.
   */
  public async migrateDemoDataToFirestore(): Promise<MigrationResult> {
    if (isDemoMode() || !db) {
      return {
        success: false,
        migratedCount: 0,
        message: 'Cannot migrate data while running in Demo Mode (Firebase is unconfigured or offline). Please configure .env credentials first.'
      };
    }

    let count = 0;
    try {
      // Migrate hotspots as DEMO DATA
      for (const h of mockHotspots) {
        await setDoc(doc(db, 'hotspots', h.id), {
          ...h,
          beforePhotoUrl: h.images[0] || '',
          wasteTypes: [h.category],
          isRecurring: true,
          reportedBy: h.reporterId,
          dataSource: 'DEMO DATA' as DataSourceType,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        count++;
      }

      // Migrate missions as DEMO DATA
      for (const m of mockMissions) {
        await setDoc(doc(db, 'missions', m.id), {
          ...m,
          dataSource: 'DEMO DATA' as DataSourceType,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        count++;
      }

      // Migrate recovery records as DEMO DATA
      for (const r of mockRecoveryRecords) {
        await setDoc(doc(db, 'recoveryRecords', r.id), {
          ...r,
          dataSource: 'DEMO DATA' as DataSourceType,
          createdAt: serverTimestamp(),
        });
        count++;
      }

      console.info(`[MigrationService] Successfully migrated ${count} prototype records marked as DEMO DATA.`);
      return {
        success: true,
        migratedCount: count,
        message: `Successfully imported ${count} prototype records into Firestore. All imported records are strictly labeled as DEMO DATA.`
      };
    } catch (err: any) {
      console.error('[MigrationService] Migration failed:', err);
      return {
        success: false,
        migratedCount: count,
        message: 'Migration encountered an error: ' + (err?.message || 'Unknown error')
      };
    }
  }
}

export const migrationService = new MigrationService();
