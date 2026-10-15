import type { Bet, BalanceEntry } from '../db';
import { formatShortDate, formatDateTime } from '../utils/format';

export interface StatsOverview {
  totalBets: number;
  settledBets: number;
  pendingBets: number;
  wins: number;
  losses: number;
  pushes: number;
  profit: number;
  turnover: number;
  roi: number;
  winrate: number;
  avgOdds: number;
  profitFactor: number;
}

export interface ChartPoint {
  index: number;
  date: string;
  fullDate: string;
  balance: number;
  profit: number;
  description: string;
}

export function calculateStats(bets: Bet[]): StatsOverview {
  const totalBets = bets.length;
  const pendingBets = bets.filter((b) => b.status === 'pending').length;
  const settled = bets.filter((b) => b.status !== 'pending');
  const settledBets = settled.length;

  const wins = settled.filter((b) => b.status === 'win').length;
  const losses = settled.filter((b) => b.status === 'loss').length;
  const pushes = settled.filter((b) => b.status === 'push').length;

  let profit = 0;
  let turnover = 0;
  let totalOdds = 0;
  let totalGrossWins = 0;
  let totalGrossLosses = 0;

  for (const b of settled) {
    profit += b.profit;
    turnover += b.stake;
    totalOdds += b.odds;
    if (b.status === 'win') {
      totalGrossWins += b.profit;
    } else if (b.status === 'loss') {
      totalGrossLosses += b.stake;
    }
  }

  profit = Math.round(profit * 100) / 100;
  turnover = Math.round(turnover * 100) / 100;

  const roi = turnover > 0 ? (profit / turnover) * 100 : 0;
  // Winrate standard: wins / (wins + losses) if any, or wins / settled
  const decisiveBets = wins + losses;
  const winrate = decisiveBets > 0 ? (wins / decisiveBets) * 100 : 0;
  const avgOdds = settledBets > 0 ? totalOdds / settledBets : 0;
  const profitFactor = totalGrossLosses > 0 ? totalGrossWins / totalGrossLosses : totalGrossWins > 0 ? 99.9 : 0;

  return {
    totalBets,
    settledBets,
    pendingBets,
    wins,
    losses,
    pushes,
    profit,
    turnover,
    roi: Math.round(roi * 10) / 10,
    winrate: Math.round(winrate * 10) / 10,
    avgOdds: Math.round(avgOdds * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
  };
}

export function calculateChartData(history: BalanceEntry[], initialBalance: number): ChartPoint[] {
  if (history.length === 0) {
    return [
      {
        index: 0,
        date: 'Старт',
        fullDate: 'Старт',
        balance: initialBalance,
        profit: 0,
        description: 'Стартовый баланс',
      },
    ];
  }

  // Sort chronologically
  const sorted = [...history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return sorted.map((entry, idx) => {
    const profit = Math.round((entry.balanceAfter - initialBalance) * 100) / 100;
    return {
      index: idx + 1,
      date: formatShortDate(entry.createdAt),
      fullDate: formatDateTime(entry.createdAt),
      balance: entry.balanceAfter,
      profit,
      description: entry.description || entry.operation,
    };
  });
}
