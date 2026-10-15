import Dexie, { type Table } from 'dexie';

export type BetType = 'match_winner' | 'map_total' | 'map_handicap' | 'round_total' | 'other';
export type BetStatus = 'pending' | 'win' | 'loss' | 'push';
export type OperationType = 
  | 'bet_placed' 
  | 'bet_win' 
  | 'bet_loss' 
  | 'bet_push' 
  | 'deposit' 
  | 'withdraw' 
  | 'reset';

export interface Bet {
  id?: number;
  title: string;           // "Navi vs FaZe, IEM Cologne"
  team1: string;           // "Navi"
  team2: string;           // "FaZe"
  betType: BetType;        // 'match_winner', etc.
  betPick: string;         // "П1 (Navi)", "ТБ 2.5", "Фора 1 (-1.5)"
  odds: number;            // 1.85
  stake: number;           // 500
  potentialWin: number;    // 925
  hltvUrl?: string;        // "https://www.hltv.org/matches/..."
  status: BetStatus;       // 'pending' | 'win' | 'loss' | 'push'
  profit: number;          // net profit: win => stake*(odds-1), loss => -stake, push => 0
  notes?: string;          // optional comments
  createdAt: Date;
  settledAt?: Date | null;
}

export interface BalanceEntry {
  id?: number;
  operation: OperationType;
  amount: number;          // change: e.g. -500 (stake), +925 (win payout), +500 (push refund)
  balanceAfter: number;    // snapshot of balance right after this operation
  betId?: number | null;
  description?: string;
  createdAt: Date;
}

export interface AppSetting {
  id?: number;
  key: string;
  value: string;
}

export class BetTrackerDB extends Dexie {
  bets!: Table<Bet, number>;
  balanceHistory!: Table<BalanceEntry, number>;
  settings!: Table<AppSetting, number>;

  constructor() {
    super('CS2BetTrackerDB');
    this.version(1).stores({
      bets: '++id, status, betType, createdAt, settledAt',
      balanceHistory: '++id, operation, createdAt, betId',
      settings: '++id, &key',
    });
  }
}

export const db = new BetTrackerDB();

// Helper to get a setting value
export async function getSetting(key: string, defaultValue = ''): Promise<string> {
  const item = await db.settings.where('key').equals(key).first();
  return item ? item.value : defaultValue;
}

// Helper to upsert a setting value
export async function setSetting(key: string, value: string): Promise<void> {
  const existing = await db.settings.where('key').equals(key).first();
  if (existing && existing.id !== undefined) {
    await db.settings.update(existing.id, { value });
  } else {
    await db.settings.add({ key, value });
  }
}
