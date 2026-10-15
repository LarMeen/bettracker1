import { db, getSetting, setSetting, type Bet, type BetType, type BetStatus } from '../db';

export interface CreateBetInput {
  title: string;
  team1?: string;
  team2?: string;
  betType: BetType;
  betPick: string;
  odds: number;
  stake: number;
  hltvUrl?: string;
  notes?: string;
}

export function parseTeamsFromTitle(title: string): { team1: string; team2: string } {
  const separators = [/\s+vs\.?\s+/i, /\s+-\s+/, /\s+против\s+/i];
  for (const sep of separators) {
    if (sep.test(title)) {
      const parts = title.split(sep);
      return {
        team1: parts[0]?.trim() || '',
        team2: parts[1]?.split(/[,(]/)[0]?.trim() || '',
      };
    }
  }
  return { team1: title.trim(), team2: '' };
}

export async function createBet(input: CreateBetInput): Promise<number> {
  const { title, betType, betPick, odds, stake, hltvUrl, notes } = input;
  const parsed = parseTeamsFromTitle(title);
  const team1 = input.team1 || parsed.team1;
  const team2 = input.team2 || parsed.team2;
  const potentialWin = Math.round(stake * odds * 100) / 100;

  return await db.transaction('rw', [db.bets, db.balanceHistory, db.settings], async () => {
    // 1. Get current balance
    const curBalStr = await getSetting('currentBalance', '0');
    const currentBalance = parseFloat(curBalStr) || 0;
    const newBalance = Math.round((currentBalance - stake) * 100) / 100;

    // 2. Create bet
    const betId = await db.bets.add({
      title: title.trim(),
      team1: team1.trim(),
      team2: team2.trim(),
      betType,
      betPick: betPick.trim(),
      odds: Math.round(odds * 100) / 100,
      stake: Math.round(stake * 100) / 100,
      potentialWin,
      hltvUrl: hltvUrl?.trim() || undefined,
      status: 'pending',
      profit: 0,
      notes: notes?.trim() || undefined,
      createdAt: new Date(),
      settledAt: null,
    });

    // 3. Update balance setting
    await setSetting('currentBalance', String(newBalance));

    // 4. Log history
    await db.balanceHistory.add({
      operation: 'bet_placed',
      amount: -stake,
      balanceAfter: newBalance,
      betId: betId as number,
      description: `Ставка: ${title.trim()} (${betPick.trim()})`,
      createdAt: new Date(),
    });

    return betId as number;
  });
}

export async function settleBet(betId: number, result: 'win' | 'loss' | 'push'): Promise<void> {
  return await db.transaction('rw', [db.bets, db.balanceHistory, db.settings], async () => {
    const bet = await db.bets.get(betId);
    if (!bet) throw new Error('Ставка не найдена');
    if (bet.status !== 'pending') throw new Error('Ставка уже рассчитана');

    let profit = 0;
    let balanceChange = 0;
    let op: 'bet_win' | 'bet_loss' | 'bet_push' = 'bet_loss';
    let opDesc = '';

    if (result === 'win') {
      profit = Math.round(bet.stake * (bet.odds - 1) * 100) / 100;
      balanceChange = Math.round(bet.stake * bet.odds * 100) / 100; // return stake + net profit
      op = 'bet_win';
      opDesc = `Выигрыш: ${bet.title} (+${profit})`;
    } else if (result === 'loss') {
      profit = -bet.stake;
      balanceChange = 0; // stake already deducted on creation
      op = 'bet_loss';
      opDesc = `Проигрыш: ${bet.title} (-${bet.stake})`;
    } else if (result === 'push') {
      profit = 0;
      balanceChange = bet.stake; // full refund of stake
      op = 'bet_push';
      opDesc = `Возврат ставки: ${bet.title}`;
    }

    // Update bet record
    await db.bets.update(betId, {
      status: result,
      profit,
      settledAt: new Date(),
    });

    // Update current balance
    const curBalStr = await getSetting('currentBalance', '0');
    const currentBalance = parseFloat(curBalStr) || 0;
    const newBalance = Math.round((currentBalance + balanceChange) * 100) / 100;
    await setSetting('currentBalance', String(newBalance));

    // Add history entry
    await db.balanceHistory.add({
      operation: op,
      amount: balanceChange,
      balanceAfter: newBalance,
      betId,
      description: opDesc,
      createdAt: new Date(),
    });
  });
}

export async function deleteBet(betId: number): Promise<void> {
  return await db.transaction('rw', [db.bets, db.balanceHistory, db.settings], async () => {
    const bet = await db.bets.get(betId);
    if (!bet) return;

    const curBalStr = await getSetting('currentBalance', '0');
    let currentBalance = parseFloat(curBalStr) || 0;

    // If pending, refund the stake back to user
    if (bet.status === 'pending') {
      currentBalance = Math.round((currentBalance + bet.stake) * 100) / 100;
      await setSetting('currentBalance', String(currentBalance));
      await db.balanceHistory.add({
        operation: 'bet_push',
        amount: bet.stake,
        balanceAfter: currentBalance,
        description: `Отмена ставки: ${bet.title}`,
        createdAt: new Date(),
      });
    }

    await db.bets.delete(betId);
  });
}
