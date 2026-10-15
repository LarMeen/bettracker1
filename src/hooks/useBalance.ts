import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import {
  setInitialBalance as setInitService,
  adjustBalance as adjustService,
  resetBalanceToInitial as resetService,
} from '../services/walletService';

export function useBalance() {
  const settings = useLiveQuery(async () => {
    const all = await db.settings.toArray();
    const map = new Map(all.map((item) => [item.key, item.value]));
    return {
      currentBalance: parseFloat(map.get('currentBalance') || '0') || 0,
      initialBalance: parseFloat(map.get('initialBalance') || '0') || 0,
      currency: map.get('currency') || '₽',
      isInitialized: map.has('initialBalance') && map.get('initialBalance') !== '',
    };
  }, []);

  const loading = settings === undefined;
  const balance = settings?.currentBalance ?? 0;
  const initialBalance = settings?.initialBalance ?? 0;
  const currency = settings?.currency ?? '₽';
  const isInitialized = settings?.isInitialized ?? false;

  const setInitialBalance = async (amount: number, curr = '₽') => {
    await setInitService(amount, curr);
  };

  const deposit = async (amount: number, note?: string) => {
    await adjustService(amount, 'deposit', note);
  };

  const withdraw = async (amount: number, note?: string) => {
    await adjustService(amount, 'withdraw', note);
  };

  const reset = async () => {
    await resetService();
  };

  return {
    balance,
    initialBalance,
    currency,
    isInitialized,
    loading,
    setInitialBalance,
    deposit,
    withdraw,
    reset,
  };
}
