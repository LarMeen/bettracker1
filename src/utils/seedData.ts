import { db, setSetting } from '../db';

export async function seedSampleBets(): Promise<void> {
  const initialBalance = 10000;
  let currentBalance = initialBalance;

  await db.transaction('rw', [db.bets, db.balanceHistory, db.settings], async () => {
    await db.bets.clear();
    await db.balanceHistory.clear();

    await setSetting('initialBalance', String(initialBalance));
    await setSetting('currency', '₽');

    const history: Array<{
      operation: 'reset' | 'bet_placed' | 'bet_win' | 'bet_loss' | 'bet_push';
      amount: number;
      balanceAfter: number;
      description: string;
      createdAt: Date;
      betId?: number;
    }> = [];

    // 0. Initial deposit
    history.push({
      operation: 'reset',
      amount: initialBalance,
      balanceAfter: initialBalance,
      description: 'Стартовый виртуальный банк',
      createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000),
    });

    const sampleBets = [
      {
        title: 'Natus Vincere vs FaZe Clan',
        team1: 'Natus Vincere',
        team2: 'FaZe Clan',
        betType: 'match_winner' as const,
        betPick: 'П1 (NaVi)',
        odds: 1.85,
        stake: 800,
        status: 'win' as const,
        profit: 680,
        hltvUrl: 'https://www.hltv.org/matches/2376001/natus-vincere-vs-faze',
        daysAgo: 5,
        hoursAgoSettled: 5 * 24 - 3,
      },
      {
        title: 'Team Spirit vs MOUZ',
        team1: 'Team Spirit',
        team2: 'MOUZ',
        betType: 'map_total' as const,
        betPick: 'ТБ 2.5 карт',
        odds: 1.95,
        stake: 1000,
        status: 'loss' as const,
        profit: -1000,
        hltvUrl: 'https://www.hltv.org/matches/2376002/spirit-vs-mouz',
        daysAgo: 4,
        hoursAgoSettled: 4 * 24 - 2,
      },
      {
        title: 'Vitality vs G2 Esports',
        team1: 'Vitality',
        team2: 'G2 Esports',
        betType: 'match_winner' as const,
        betPick: 'П1 (Vitality)',
        odds: 1.72,
        stake: 1200,
        status: 'win' as const,
        profit: 864,
        hltvUrl: 'https://www.hltv.org/matches/2376003/vitality-vs-g2',
        daysAgo: 3,
        hoursAgoSettled: 3 * 24 - 3,
      },
      {
        title: 'Eternal Fire vs Virtus.pro',
        team1: 'Eternal Fire',
        team2: 'Virtus.pro',
        betType: 'map_handicap' as const,
        betPick: 'Фора 1 (+1.5)',
        odds: 1.65,
        stake: 700,
        status: 'push' as const,
        profit: 0,
        hltvUrl: 'https://www.hltv.org/matches/2376004/eternal-fire-vs-virtus-pro',
        daysAgo: 2,
        hoursAgoSettled: 2 * 24 - 2,
      },
      {
        title: 'The MongolZ vs Complexity',
        team1: 'The MongolZ',
        team2: 'Complexity',
        betType: 'match_winner' as const,
        betPick: 'П1 (MongolZ)',
        odds: 2.15,
        stake: 600,
        status: 'win' as const,
        profit: 690,
        hltvUrl: 'https://www.hltv.org/matches/2376005/mongolz-vs-complexity',
        daysAgo: 1,
        hoursAgoSettled: 1 * 24 - 4,
      },
      {
        title: 'Astralis vs Heroic',
        team1: 'Astralis',
        team2: 'Heroic',
        betType: 'round_total' as const,
        betPick: 'ТБ 21.5 рнд',
        odds: 1.88,
        stake: 500,
        status: 'pending' as const,
        profit: 0,
        hltvUrl: 'https://www.hltv.org/matches/2376006/astralis-vs-heroic',
        daysAgo: 0,
        hoursAgoSettled: null,
      },
      {
        title: 'Team Liquid vs FURIA',
        team1: 'Team Liquid',
        team2: 'FURIA',
        betType: 'match_winner' as const,
        betPick: 'П2 (FURIA)',
        odds: 2.30,
        stake: 400,
        status: 'pending' as const,
        profit: 0,
        hltvUrl: 'https://www.hltv.org/matches/2376007/liquid-vs-furia',
        daysAgo: 0,
        hoursAgoSettled: null,
      },
    ];

    for (const item of sampleBets) {
      const placedDate = new Date(Date.now() - item.daysAgo * 24 * 3600 * 1000);
      const settledDate =
        item.hoursAgoSettled !== null
          ? new Date(Date.now() - item.hoursAgoSettled * 3600 * 1000)
          : null;

      // 1. Deduct stake
      currentBalance = Math.round((currentBalance - item.stake) * 100) / 100;

      const betId = await db.bets.add({
        title: item.title,
        team1: item.team1,
        team2: item.team2,
        betType: item.betType,
        betPick: item.betPick,
        odds: item.odds,
        stake: item.stake,
        potentialWin: Math.round(item.stake * item.odds * 100) / 100,
        hltvUrl: item.hltvUrl,
        status: item.status,
        profit: item.profit,
        createdAt: placedDate,
        settledAt: settledDate,
      });

      history.push({
        operation: 'bet_placed',
        amount: -item.stake,
        balanceAfter: currentBalance,
        description: `Ставка: ${item.title} (${item.betPick})`,
        createdAt: placedDate,
        betId: betId as number,
      });

      // 2. If settled, add payout
      if (item.status === 'win') {
        const payout = Math.round(item.stake * item.odds * 100) / 100;
        currentBalance = Math.round((currentBalance + payout) * 100) / 100;
        history.push({
          operation: 'bet_win',
          amount: payout,
          balanceAfter: currentBalance,
          description: `Выигрыш: ${item.title} (+${item.profit})`,
          createdAt: settledDate!,
          betId: betId as number,
        });
      } else if (item.status === 'push') {
        currentBalance = Math.round((currentBalance + item.stake) * 100) / 100;
        history.push({
          operation: 'bet_push',
          amount: item.stake,
          balanceAfter: currentBalance,
          description: `Возврат ставки: ${item.title}`,
          createdAt: settledDate!,
          betId: betId as number,
        });
      }
    }

    await setSetting('currentBalance', String(currentBalance));

    for (const h of history) {
      await db.balanceHistory.add(h);
    }
  });
}
