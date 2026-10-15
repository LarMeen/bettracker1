import { db, getSetting, setSetting } from '../db';

export interface WalletInfo {
  currentBalance: number;
  initialBalance: number;
  currency: string;
  isInitialized: boolean;
}

export async function getWalletInfo(): Promise<WalletInfo> {
  const initialStr = await getSetting('initialBalance', '');
  const currentStr = await getSetting('currentBalance', '');
  const currency = await getSetting('currency', '₽');

  const isInitialized = initialStr !== '';
  const initialBalance = parseFloat(initialStr) || 0;
  const currentBalance = parseFloat(currentStr) || 0;

  return {
    currentBalance,
    initialBalance,
    currency,
    isInitialized,
  };
}

export async function setInitialBalance(amount: number, currency = '₽'): Promise<void> {
  const rounded = Math.round(amount * 100) / 100;

  await db.transaction('rw', [db.balanceHistory, db.settings], async () => {
    await setSetting('initialBalance', String(rounded));
    await setSetting('currentBalance', String(rounded));
    await setSetting('currency', currency);

    await db.balanceHistory.add({
      operation: 'reset',
      amount: rounded,
      balanceAfter: rounded,
      description: `Установка стартового банка: ${rounded} ${currency}`,
      createdAt: new Date(),
    });
  });
}

export async function adjustBalance(
  amount: number,
  type: 'deposit' | 'withdraw',
  note = ''
): Promise<void> {
  if (amount <= 0) return;
  const absAmount = Math.round(amount * 100) / 100;

  await db.transaction('rw', [db.balanceHistory, db.settings], async () => {
    const curStr = await getSetting('currentBalance', '0');
    const currency = await getSetting('currency', '₽');
    const cur = parseFloat(curStr) || 0;

    const delta = type === 'deposit' ? absAmount : -absAmount;
    const newBalance = Math.round((cur + delta) * 100) / 100;

    await setSetting('currentBalance', String(newBalance));

    await db.balanceHistory.add({
      operation: type,
      amount: delta,
      balanceAfter: newBalance,
      description: note.trim() || (type === 'deposit' ? `Пополнение банка: +${absAmount} ${currency}` : `Списание из банка: -${absAmount} ${currency}`),
      createdAt: new Date(),
    });
  });
}

export async function resetBalanceToInitial(): Promise<void> {
  await db.transaction('rw', [db.balanceHistory, db.settings], async () => {
    const initStr = await getSetting('initialBalance', '0');
    const currency = await getSetting('currency', '₽');
    const initial = parseFloat(initStr) || 0;

    await setSetting('currentBalance', String(initial));

    await db.balanceHistory.add({
      operation: 'reset',
      amount: 0,
      balanceAfter: initial,
      description: `Сброс банка к стартовому значению (${initial} ${currency})`,
      createdAt: new Date(),
    });
  });
}
