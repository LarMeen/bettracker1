import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { calculateStats, calculateChartData, type StatsOverview, type ChartPoint } from '../services/statsService';

export function useStats() {
  const result = useLiveQuery(async () => {
    const bets = await db.bets.toArray();
    const history = await db.balanceHistory.toArray();
    const initSetting = await db.settings.where('key').equals('initialBalance').first();
    const initialBalance = parseFloat(initSetting?.value || '0') || 0;

    const stats = calculateStats(bets);
    const chartData = calculateChartData(history, initialBalance);

    return {
      stats,
      chartData,
      totalBetsCount: bets.length,
    };
  }, []);

  const loading = result === undefined;
  const stats: StatsOverview = result?.stats ?? {
    totalBets: 0,
    settledBets: 0,
    pendingBets: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    profit: 0,
    turnover: 0,
    roi: 0,
    winrate: 0,
    avgOdds: 0,
    profitFactor: 0,
  };
  const chartData: ChartPoint[] = result?.chartData ?? [];

  return {
    stats,
    chartData,
    loading,
  };
}
