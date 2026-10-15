import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Bet } from '../db';
import {
  createBet as createBetService,
  settleBet as settleBetService,
  deleteBet as deleteBetService,
  type CreateBetInput,
} from '../services/betService';

export function useBets() {
  const bets = useLiveQuery(async () => {
    const list = await db.bets.toArray();
    // Sort desc by createdAt
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, []);

  const loading = bets === undefined;
  const allBets = bets || [];
  const recentBets = allBets.slice(0, 5);
  const pendingBets = allBets.filter((b) => b.status === 'pending');
  const settledBets = allBets.filter((b) => b.status !== 'pending');

  const createBet = async (input: CreateBetInput): Promise<number> => {
    return await createBetService(input);
  };

  const settleBet = async (betId: number, result: 'win' | 'loss' | 'push'): Promise<void> => {
    await settleBetService(betId, result);
  };

  const deleteBet = async (betId: number): Promise<void> => {
    await deleteBetService(betId);
  };

  return {
    bets: allBets,
    recentBets,
    pendingBets,
    settledBets,
    loading,
    createBet,
    settleBet,
    deleteBet,
  };
}
