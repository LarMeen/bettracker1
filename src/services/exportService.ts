import { db, type Bet, type BalanceEntry, type AppSetting } from '../db';

export interface BackupData {
  version: number;
  exportedAt: string;
  bets: Bet[];
  balanceHistory: BalanceEntry[];
  settings: AppSetting[];
}

export async function exportData(): Promise<void> {
  const bets = await db.bets.toArray();
  const balanceHistory = await db.balanceHistory.toArray();
  const settings = await db.settings.toArray();

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    bets,
    balanceHistory,
    settings,
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cs2-bettracker-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importData(file: File): Promise<{ betsCount: number; historyCount: number }> {
  const text = await file.text();
  const data: BackupData = JSON.parse(text);

  if (!data.bets || !Array.isArray(data.bets) || !data.balanceHistory || !Array.isArray(data.balanceHistory)) {
    throw new Error('Некорректный формат файла резервной копии');
  }

  await db.transaction('rw', [db.bets, db.balanceHistory, db.settings], async () => {
    await db.bets.clear();
    await db.balanceHistory.clear();
    await db.settings.clear();

    // Rehydrate Dates
    const bets = data.bets.map((b) => ({
      ...b,
      createdAt: new Date(b.createdAt),
      settledAt: b.settledAt ? new Date(b.settledAt) : null,
    }));

    const balanceHistory = data.balanceHistory.map((h) => ({
      ...h,
      createdAt: new Date(h.createdAt),
    }));

    await db.bets.bulkAdd(bets);
    await db.balanceHistory.bulkAdd(balanceHistory);

    if (data.settings && Array.isArray(data.settings)) {
      await db.settings.bulkAdd(data.settings);
    }
  });

  return {
    betsCount: data.bets.length,
    historyCount: data.balanceHistory.length,
  };
}
