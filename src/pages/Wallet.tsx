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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-status-win/15 border border-status-win/35 text-status-win text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-glow-emerald/20">
          <CheckCircle2 className="w-4 h-4 text-status-win shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* STATE 1: INITIAL SETUP IF NOT INITIALIZED */}
      {!isInitialized ? (
        <div className="max-w-xl mx-auto p-7 sm:p-9 rounded-3xl glass-card space-y-6 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-palette-700/60 text-palette-200 border border-palette-400/25 flex items-center justify-center mx-auto shadow-glow-forest">
            <Coins className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-palette-100 tracking-tight">Установка виртуального банка</h2>
            <p className="text-xs text-palette-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
              Задайте стартовый банкролл, от которого будет рассчитываться чистый профит, ROI и ставки в %
            </p>
          </div>

          <form onSubmit={handleInitSubmit} className="space-y-4 pt-2 text-left">
            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-palette-300 mb-1.5">
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
                <label className="block text-xs font-bold uppercase tracking-wider text-palette-300 mb-1.5">Валюта</label>
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
              className="w-full py-4 rounded-2xl bg-palette-600 hover:bg-palette-500 text-palette-100 font-black text-sm tracking-wider uppercase shadow-glow-forest active:scale-[0.98] transition-all border border-palette-400/40"
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
                className="w-full py-3 rounded-2xl bg-palette-900/80 hover:bg-palette-800 text-palette-200 font-bold text-xs border border-palette-400/20 hover:border-palette-400/40 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-palette-200" />
                <span>Загрузить тестовые данные CS2 (7 матчей)</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* STATE 2: ACTIVE BANKROLL DASHBOARD (Responsive: 2-column bento on PC) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 of 12 cols on desktop): Hero balance, Operations, Backup */}
          <div className="lg:col-span-5 space-y-5">
            {/* Main Hero Balance Card */}
            <div className="p-6 sm:p-7 rounded-3xl glass-card text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-palette-600/20 blur-3xl pointer-events-none rounded-full" />

              <div className="text-[11px] font-bold text-palette-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
                <WalletIcon className="w-3.5 h-3.5 text-palette-200" />
                <span>Текущий виртуальный банк</span>
              </div>

              <div className="text-4xl sm:text-5xl font-black font-mono text-palette-100 tracking-tight py-2 tabular-nums">
                {formatCurrency(balance, currency)}
              </div>

              <div className="flex items-center justify-center gap-3 text-xs text-palette-400 pt-3 border-t border-palette-400/10 mt-3 font-mono">
                <span className="tabular-nums">Старт: {formatCurrency(initialBalance, currency)}</span>
                <span className="text-palette-400/40">•</span>
                <span
                  className={`font-bold flex items-center gap-1 tabular-nums ${
                    balance >= initialBalance ? 'text-status-win' : 'text-status-loss'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  {balance >= initialBalance ? '+' : ''}
                  {formatCurrency(balance - initialBalance, currency)}
                </span>
              </div>
            </div>

            {/* Action Buttons: Пополнить / Списать */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setAdjustMode(adjustMode === 'deposit' ? null : 'deposit')
                  }
                  className={`py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 border ${
                    adjustMode === 'deposit'
                      ? 'bg-status-win text-palette-950 border-status-win shadow-glow-emerald/30'
                      : 'bg-status-win/15 hover:bg-status-win/25 border-status-win/35 text-status-win'
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
                      ? 'bg-status-loss text-white border-status-loss shadow-glow-rose/30'
                      : 'bg-status-loss/15 hover:bg-status-loss/25 border-status-loss/35 text-status-loss'
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
                  className="p-4.5 rounded-3xl glass-card space-y-3 animate-in fade-in zoom-in-95 border-palette-400/30 shadow-xl"
                >
                  <div className="text-xs font-bold text-palette-100 uppercase tracking-wider">
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
                      className={`rounded-2xl font-bold text-xs transition-all active:scale-95 text-palette-950 ${
                        adjustMode === 'deposit'
                          ? 'bg-status-win hover:bg-emerald-400'
                          : 'bg-status-loss hover:bg-rose-400 text-white'
                      }`}
                    >
                      Применить
                    </button>
                  </div>

                  <input
                    type="text"
                    value={adjustNote}
                    onChange={(e) => setAdjustNote(e.target.value)}
                    placeholder="Примечание (напр. депозит от 15.10)"
                    className="text-xs py-2.5"
                  />
                </form>
              )}
            </div>

            {/* Backup / Export / Import JSON section */}
            <div className="p-5 rounded-3xl glass-card space-y-3.5 shadow-lg">
              <div className="text-xs font-bold text-palette-200 uppercase tracking-wider">Резервная копия данных</div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleExport}
                  className="py-3 px-3 rounded-2xl bg-palette-900/80 hover:bg-palette-800 text-palette-200 hover:text-palette-100 font-bold text-xs flex items-center justify-center gap-1.5 border border-palette-400/20 active:scale-95 transition-all shadow-inner-light"
                >
                  <Download className="w-3.5 h-3.5 text-palette-200" />
                  <span>Экспорт JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-3 px-3 rounded-2xl bg-palette-900/80 hover:bg-palette-800 text-palette-200 hover:text-palette-100 font-bold text-xs flex items-center justify-center gap-1.5 border border-palette-400/20 active:scale-95 transition-all shadow-inner-light"
                >
                  <Upload className="w-3.5 h-3.5 text-palette-200" />
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
                className="w-full py-2.5 px-3 rounded-2xl bg-palette-900/60 hover:bg-palette-800 text-palette-200 font-bold text-xs border border-palette-400/20 hover:border-palette-400/35 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-palette-200" />
                <span>Загрузить тестовые матчи CS2</span>
              </button>

              <p className="text-[10px] text-palette-400/70 text-center">
                Экспортируйте файл для переноса истории на другой телефон или ПК
              </p>
            </div>

            {/* Reset Button */}
            <div className="pt-1 flex justify-center">
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-status-loss/10 hover:bg-status-loss/20 text-status-loss font-bold text-xs border border-status-loss/25 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Сбросить банк к стартовому значению</span>
              </button>
            </div>
          </div>

          {/* Right Column (7 of 12 cols on desktop): Transaction History */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs text-palette-400 px-1">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-palette-200" />
                <span>История операций</span>
              </span>
              <span className="text-[11px] text-palette-400/70 font-medium">Последние 30 транзакций</span>
            </div>

            <div className="rounded-3xl glass-card divide-y divide-palette-400/10 overflow-hidden shadow-lg">
              {!historyEntries || historyEntries.length === 0 ? (
                <div className="p-8 text-center text-xs text-palette-400">
                  Транзакций пока нет
                </div>
              ) : (
                historyEntries.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex items-center justify-between text-xs hover:bg-white/[0.02] transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-palette-100">
                        {OPERATION_LABELS[item.operation] || item.operation}
                      </div>
                      <div className="text-[10px] text-palette-400 mt-0.5">
                        {formatDateTime(item.createdAt)}
                      </div>
                      {item.description && (
                        <div className="text-[11px] text-palette-300 line-clamp-1 mt-0.5">
                          {item.description}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-mono font-bold tabular-nums text-sm ${
                          item.amount > 0
                            ? 'text-status-win'
                            : item.amount < 0
                            ? 'text-status-loss'
                            : 'text-palette-400'
                        }`}
                      >
                        {item.amount > 0 ? `+${item.amount}` : item.amount} {currency}
                      </div>
                      <div className="text-[10px] font-mono text-palette-400 tabular-nums">
                        Итог: {item.balanceAfter} {currency}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
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
        </div>
      )}
    </div>
  );
};
