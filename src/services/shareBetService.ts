import { db, getSetting, setSetting, type Bet, type BetType, type BetStatus } from '../db';

export interface SingleBetSharePayload {
  version: 1;
  type: 'cs2-bettracker-single';
  exportedAt: string;
  bet: {
    title: string;
    team1: string;
    team2: string;
    betType: BetType;
    betPick: string;
    odds: number;
    stake: number;
    status: BetStatus;
    potentialWin: number;
    profit: number;
    hltvUrl?: string;
    notes?: string;
    createdAt: string;
    settledAt?: string | null;
  };
}

/**
 * Creates a clean exportable object for a single bet
 */
export function generateSingleBetPayload(bet: Bet): SingleBetSharePayload {
  return {
    version: 1,
    type: 'cs2-bettracker-single',
    exportedAt: new Date().toISOString(),
    bet: {
      title: bet.title,
      team1: bet.team1,
      team2: bet.team2,
      betType: bet.betType,
      betPick: bet.betPick,
      odds: bet.odds,
      stake: bet.stake,
      status: bet.status,
      potentialWin: bet.potentialWin,
      profit: bet.profit,
      hltvUrl: bet.hltvUrl,
      notes: bet.notes,
      createdAt: new Date(bet.createdAt).toISOString(),
      settledAt: bet.settledAt ? new Date(bet.settledAt).toISOString() : null,
    },
  };
}

/**
 * Encodes a bet into a URL-safe Base64 token
 */
export function encodeBetToToken(bet: Bet): string {
  const payload = generateSingleBetPayload(bet);
  const json = JSON.stringify(payload);
  // UTF-8 safe base64 encoding
  const base64 = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
  // Convert to URL-safe base64
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Generates a full shareable URL that will open the import screen on another device
 */
export function encodeBetToShareUrl(bet: Bet): string {
  const token = encodeBetToToken(bet);
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}#/import-bet?data=${token}`;
}

/**
 * Decodes a token, share URL, or raw JSON into a SingleBetSharePayload
 */
export function decodeBetFromToken(input: string): SingleBetSharePayload {
  let cleaned = input.trim();

  // If input is a URL containing ?data=...
  if (cleaned.includes('data=')) {
    const match = cleaned.match(/data=([A-Za-z0-9_-]+)/);
    if (match && match[1]) {
      cleaned = match[1];
    }
  }

  // If it's raw JSON
  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    const parsed = JSON.parse(cleaned);
    if (parsed.type === 'cs2-bettracker-single' && parsed.bet) {
      return parsed as SingleBetSharePayload;
    }
    // If it's a bare bet object
    if (parsed.title && parsed.odds && parsed.stake) {
      return {
        version: 1,
        type: 'cs2-bettracker-single',
        exportedAt: new Date().toISOString(),
        bet: parsed,
      };
    }
  }

  // Restore base64 standard characters from URL-safe base64
  let base64 = cleaned.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  const jsonStr = decodeURIComponent(
    Array.prototype.map
      .call(atob(base64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );

  const data = JSON.parse(jsonStr) as SingleBetSharePayload;
  if (!data.bet || !data.bet.title || !data.bet.odds || !data.bet.stake) {
    throw new Error('Некорректная структура данных ставки');
  }

  return data;
}

/**
 * Triggers a download of a single bet as a .json file
 */
export function downloadSingleBetJson(bet: Bet): void {
  const payload = generateSingleBetPayload(bet);
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Safe filename
  const cleanTitle = bet.title.replace(/[^a-zA-Z0-9а-яА-ЯёЁ_-]/g, '_').slice(0, 30);
  const dateStr = new Date(bet.createdAt).toISOString().slice(0, 10);
  const filename = `bet_${cleanTitle}_${dateStr}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Checks if a very similar bet already exists in the local database
 */
export async function checkDuplicateBet(betData: SingleBetSharePayload['bet']): Promise<boolean> {
  const existing = await db.bets.toArray();
  return existing.some((b) => {
    return (
      b.title.toLowerCase() === betData.title.toLowerCase() &&
      b.betPick.toLowerCase() === betData.betPick.toLowerCase() &&
      b.odds === betData.odds &&
      b.stake === betData.stake
    );
  });
}

/**
 * Imports a transferred bet into the local database with optional balance adjustments
 */
export async function importSingleBet(
  betData: SingleBetSharePayload['bet'],
  options: { adjustBalance: boolean }
): Promise<number> {
  return await db.transaction('rw', [db.bets, db.balanceHistory, db.settings], async () => {
    // 1. Insert bet into IndexedDB
    const betId = (await db.bets.add({
      title: betData.title.trim(),
      team1: betData.team1 || '',
      team2: betData.team2 || '',
      betType: betData.betType || 'match_winner',
      betPick: betData.betPick.trim(),
      odds: Math.round(betData.odds * 100) / 100,
      stake: Math.round(betData.stake * 100) / 100,
      potentialWin: Math.round(betData.potentialWin * 100) / 100,
      hltvUrl: betData.hltvUrl || undefined,
      status: betData.status || 'pending',
      profit: Math.round((betData.profit || 0) * 100) / 100,
      notes: betData.notes || undefined,
      createdAt: new Date(betData.createdAt || Date.now()),
      settledAt: betData.settledAt ? new Date(betData.settledAt) : null,
    })) as number;

    // 2. Adjust balance if user requested it
    if (options.adjustBalance) {
      const curBalStr = await getSetting('currentBalance', '0');
      let currentBalance = parseFloat(curBalStr) || 0;

      if (betData.status === 'pending') {
        currentBalance = Math.round((currentBalance - betData.stake) * 100) / 100;
        await setSetting('currentBalance', String(currentBalance));
        await db.balanceHistory.add({
          operation: 'bet_placed',
          amount: -betData.stake,
          balanceAfter: currentBalance,
          betId,
          description: `Импорт ставки: ${betData.title} (${betData.betPick})`,
          createdAt: new Date(),
        });
      } else if (betData.status === 'win') {
        // If it was already a win on previous device, add net profit
        const gain = betData.profit;
        currentBalance = Math.round((currentBalance + gain) * 100) / 100;
        await setSetting('currentBalance', String(currentBalance));
        await db.balanceHistory.add({
          operation: 'bet_win',
          amount: gain,
          balanceAfter: currentBalance,
          betId,
          description: `Импорт выигранной ставки: ${betData.title} (+${gain})`,
          createdAt: new Date(),
        });
      } else if (betData.status === 'loss') {
        // If loss, deduct stake
        currentBalance = Math.round((currentBalance - betData.stake) * 100) / 100;
        await setSetting('currentBalance', String(currentBalance));
        await db.balanceHistory.add({
          operation: 'bet_loss',
          amount: -betData.stake,
          balanceAfter: currentBalance,
          betId,
          description: `Импорт проигранной ставки: ${betData.title} (-${betData.stake})`,
          createdAt: new Date(),
        });
      }
    }

    return betId;
  });
}
