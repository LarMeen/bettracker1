import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Wallet as WalletIcon,
  Plus,
  Minus,
  RotateCcw,
  Download,
  Upload,
  Coins,
  History,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { db } from '../db';
import { useBalance } from '../hooks/useBalance';
import { exportData, importData } from '../services/exportService';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatCurrency, formatDateTime } from '../utils/format';
import { OPERATION_LABELS } from '../utils/constants';
import { seedSampleBets } from '../utils/seedData';

export const Wallet: React.FC = () => {
  const {
    balance,
    initialBalance,
    currency,
    isInitialized,
    setInitialBalance,
    deposit,
    withdraw,
    reset,
  } = useBalance();

  const [initAmount, setInitAmount] = useState('10000');
  const [initCurrency, setInitCurrency] = useState('₽');

  const [adjustMode, setAdjustMode] = useState<'deposit' | 'withdraw' | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Balance history log
  const historyEntries = useLiveQuery(async () => {
    const list = await db.balanceHistory.toArray();
    return list
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 30);
  }, []);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleInitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(initAmount);
    if (val > 0) {
      await setInitialBalance(val, initCurrency);
      showNotification('Стартовый банк успешно настроен!');
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(adjustAmount);
    if (!val || val <= 0) return;

    if (adjustMode === 'deposit') {
      await deposit(val, adjustNote);
      showNotification(`Успешно пополнено: +${val} ${currency}`);
    } else if (adjustMode === 'withdraw') {
      await withdraw(val, adjustNote);
      showNotification(`Успешно списано: -${val} ${currency}`);
    }

    setAdjustMode(null);
    setAdjustAmount('');
    setAdjustNote('');
  };

  const handleResetConfirm = async () => {
    await reset();
    setShowResetConfirm(false);
    showNotification('Баланс сброшен к начальному значению');
  };

  const handleExport = async () => {
    try {
      await exportData();
      showNotification('Резервная копия сохранена в файл');
    } catch {
      showNotification('Ошибка при экспорте данных');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await importData(file);
      showNotification(`Импортировано ставок: ${res.betsCount}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка импорта';
      alert(`Ошибка: ${msg}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-glow-emerald/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* STATE 1: INITIAL SETUP IF NOT INITIALIZED */}
      {!isInitialized ? (
        <div className="p-7 rounded-3xl glass-card space-y-5 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 text-amber-400 border border-amber-400/30 flex items-center justify-center mx-auto shadow-glow-gold/20">
            <Coins className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Установка стартового банка</h2>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              Задайте виртуальный банкролл, от которого будет рассчитываться чистый профит, ROI и ставки в %
            </p>
          </div>

          <form onSubmit={handleInitSubmit} className="space-y-3.5 pt-2 text-left">
            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Начальная сумма
                </label>
                <input
                  type="number"
                  value={initAmount}
                  onChange={(e) => setInitAmount(e.target.value)}
                  placeholder="10000"
                  required
                  className="font-mono text-base font-bold tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Валюта</label>
                <select
                  value={initCurrency}
                  onChange={(e) => setInitCurrency(e.target.value)}
                  className="text-xs font-bold py-3.5"
                >
                  <option value="₽">₽ (Руб)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="pts">pts</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm tracking-wider uppercase shadow-glow-gold active:scale-[0.98] transition-all border border-amber-300/50"
            >
              СОХРАНИТЬ И НАЧАТЬ
            </button>

            <div className="pt-2">
              <button
                type="button"
                onClick={async () => {
                  await seedSampleBets();
                  showNotification('Демо-данные CS2 загружены!');
                }}
                className="w-full py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-300 font-bold text-xs border border-white/10 hover:border-amber-400/30 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Загрузить тестовые данные CS2 (7 матчей)</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* STATE 2: ACTIVE BANKROLL DASHBOARD */
        <>
          {/* Main Hero Balance Card */}
          <div className="p-6 rounded-3xl glass-card text-center relative overflow-hidden shadow-2xl">
            {/* Ambient gold glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

            {/* Top subtitle */}
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
              <WalletIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Текущий виртуальный банк</span>
            </div>

            {/* Giant Balance Number */}
            <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight py-1 tabular-nums">
              {formatCurrency(balance, currency)}
            </div>

            {/* Sub-info: Initial bank & net total gain */}
            <div className="flex items-center justify-center gap-3 text-xs text-slate-400 pt-3 border-t border-white/[0.08] mt-4 font-mono">
              <span className="tabular-nums">Старт: {formatCurrency(initialBalance, currency)}</span>
              <span className="text-slate-600">•</span>
              <span
                className={`font-bold flex items-center gap-1 tabular-nums ${
                  balance >= initialBalance ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                {balance >= initialBalance ? '+' : ''}
                {formatCurrency(balance - initialBalance, currency)}
              </span>
            </div>
          </div>

          {/* Action Buttons: Добавить / Отнять (Wireframe 4) */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setAdjustMode(adjustMode === 'deposit' ? null : 'deposit')
                }
                className={`py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 border ${
                  adjustMode === 'deposit'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-glow-emerald/30'
                    : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-400'
                }`}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Пополнить</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setAdjustMode(adjustMode === 'withdraw' ? null : 'withdraw')
                }
                className={`py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 border ${
                  adjustMode === 'withdraw'
                    ? 'bg-rose-500 text-white border-rose-400 shadow-glow-rose/30'
                    : 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/30 text-rose-400'
                }`}
              >
                <Minus className="w-4 h-4 stroke-[3]" />
                <span>Списать</span>
              </button>
            </div>

            {/* Inline adjust form */}
            {adjustMode && (
              <form
                onSubmit={handleAdjustSubmit}
                className="p-4 rounded-2xl glass-card space-y-3 animate-in fade-in zoom-in-95 border-amber-500/30 shadow-xl"
              >
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  {adjustMode === 'deposit' ? 'Пополнение баланса' : 'Списание средств'}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      placeholder="Сумма"
                      required
                      autoFocus
                      className="font-mono text-sm font-bold tabular-nums"
                    />
                  </div>
                  <button
                    type="submit"
                    className={`rounded-xl font-bold text-xs transition-all active:scale-95 text-white ${
                      adjustMode === 'deposit'
                        ? 'bg-emerald-600 hover:bg-emerald-500'
                        : 'bg-rose-600 hover:bg-rose-500'
                    }`}
                  >
                    Применить
                  </button>
                </div>

                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="Примечание (напр. депозит от 14.10)"
                  className="text-xs py-2.5"
                />
              </form>
            )}
          </div>

          {/* Balance History Log */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400 px-0.5">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>История операций</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Последние 30 транзакций</span>
            </div>

            <div className="rounded-2xl glass-card divide-y divide-white/[0.06] overflow-hidden shadow-lg">
              {!historyEntries || historyEntries.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Транзакций пока нет
                </div>
              ) : (
                historyEntries.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 flex items-center justify-between text-xs hover:bg-white/[0.03] transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white">
                        {OPERATION_LABELS[item.operation] || item.operation}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {formatDateTime(item.createdAt)}
                      </div>
                      {item.description && (
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {item.description}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-mono font-bold tabular-nums text-sm ${
                          item.amount > 0
                            ? 'text-emerald-400'
                            : item.amount < 0
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {item.amount > 0 ? `+${item.amount}` : item.amount} {currency}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 tabular-nums">
                        Итог: {item.balanceAfter} {currency}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Backup / Export / Import JSON section */}
          <div className="p-4 rounded-2xl glass-card space-y-3 shadow-lg">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Резервная копия данных</div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExport}
                className="py-3 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 active:scale-95 transition-all shadow-inner-light"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Экспорт JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 active:scale-95 transition-all shadow-inner-light"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Импорт JSON</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
            
            <button
              type="button"
              onClick={async () => {
                await seedSampleBets();
                showNotification('Демо-ставки CS2 загружены!');
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-amber-300 font-bold text-xs border border-white/10 hover:border-amber-400/30 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Загрузить тестовые данные CS2 (демо)</span>
            </button>

            <p className="text-[10px] text-slate-500 text-center">
              Экспортируйте файл для переноса истории на другой телефон
            </p>
          </div>

          {/* Reset Button (Wireframe 4: "сброс") */}
          <div className="pt-1 flex justify-center">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-bold text-xs border border-rose-500/25 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Сбросить банк к стартовому значению</span>
            </button>
          </div>

          {/* Confirm Dialog for Reset */}
          <ConfirmDialog
            isOpen={showResetConfirm}
            title="Сбросить баланс?"
            message={`Текущий банк будет возвращен к начальному значению (${formatCurrency(
              initialBalance,
              currency
            )}). Ваши существующие ставки останутся в истории.`}
            confirmLabel="Сбросить"
            confirmVariant="danger"
            onConfirm={handleResetConfirm}
            onCancel={() => setShowResetConfirm(false)}
          />
        </>
      )}
    </div>
  );
};
