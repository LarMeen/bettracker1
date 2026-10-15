import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import type { Bet } from '../db';
import { BET_STATUS_LABELS, BET_TYPE_LABELS } from '../utils/constants';
import { formatCurrency, formatCurrencyWithSign, formatOdds, formatDateTime } from '../utils/format';
import { ConfirmDialog } from './ConfirmDialog';

interface BetDetailProps {
  bet: Bet | null;
  isOpen: boolean;
  onClose: () => void;
  onSettle: (betId: number, result: 'win' | 'loss' | 'push') => Promise<void>;
  onDelete: (betId: number) => Promise<void>;
  currency?: string;
}

export const BetDetail: React.FC<BetDetailProps> = ({
  bet,
  isOpen,
  onClose,
  onSettle,
  onDelete,
  currency = '₽',
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !bet) return null;

  const isPending = bet.status === 'pending';

  const handleSettle = async (result: 'win' | 'loss' | 'push') => {
    if (!bet.id) return;
    setIsSubmitting(true);
    try {
      await onSettle(bet.id, result);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!bet.id) return;
    setIsSubmitting(true);
    try {
      await onDelete(bet.id);
      setShowDeleteConfirm(false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Sheet from Bottom */}
      <div className="fixed inset-x-0 bottom-0 z-50 max-w-md mx-auto bg-cs-card border-t border-cs-border rounded-t-3xl shadow-2xl safe-bottom max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Drag handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-slate-700/60" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-cs-border/60 flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20 inline-block mb-1">
              {BET_TYPE_LABELS[bet.betType] || bet.betType}
            </span>
            <h3 className="font-bold text-white text-lg leading-tight">{bet.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cs-surface text-slate-400 hover:text-white flex items-center justify-center shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
          {/* Bet Pick highlight card */}
          <div className="p-4 rounded-2xl bg-cs-surface/60 border border-cs-border">
            <div className="text-xs text-slate-400 mb-1">Ваш выбор (Исход)</div>
            <div className="text-xl font-black text-amber-400 tracking-wide font-mono">
              {bet.betPick}
            </div>
          </div>

          {/* Numbers Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-cs-surface/40 border border-cs-border/80">
              <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Коэффициент</span>
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {formatOdds(bet.odds)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-cs-surface/40 border border-cs-border/80">
              <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>Сумма ставки</span>
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {formatCurrency(bet.stake, currency)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-cs-surface/40 border border-cs-border/80">
              <div className="text-xs text-slate-400 mb-1">Потенциал выплаты</div>
              <div className="text-lg font-bold font-mono text-amber-300">
                {formatCurrency(bet.potentialWin, currency)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-cs-surface/40 border border-cs-border/80">
              <div className="text-xs text-slate-400 mb-1">Статус / Профит</div>
              <div
                className={`text-base font-bold font-mono ${
                  bet.status === 'win'
                    ? 'text-emerald-400'
                    : bet.status === 'loss'
                    ? 'text-rose-400'
                    : bet.status === 'push'
                    ? 'text-slate-300'
                    : 'text-amber-400'
                }`}
              >
                {isPending
                  ? BET_STATUS_LABELS.pending
                  : formatCurrencyWithSign(bet.profit, currency)}
              </div>
            </div>
          </div>

          {/* HLTV Link button */}
          {bet.hltvUrl && (
            <a
              href={bet.hltvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-cs-surface hover:bg-slate-800 border border-cs-border text-cyan-400 text-sm font-semibold transition-all active:scale-[0.98]"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Открыть матч на HLTV</span>
            </a>
          )}

          {/* Notes if any */}
          {bet.notes && (
            <div className="p-3 rounded-xl bg-cs-surface/30 border border-cs-border/60 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Заметка: </span>
              {bet.notes}
            </div>
          )}

          {/* Dates info */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDateTime(bet.createdAt)}
            </span>
            {bet.settledAt && <span>Расчет: {formatDateTime(bet.settledAt)}</span>}
          </div>

          {/* SETTLEMENT ACTIONS (For pending bets) - Win / Loss / Push */}
          {isPending && (
            <div className="pt-2 border-t border-cs-border/80 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
                Быстрый расчет ставки
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSettle('win')}
                  className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 active:scale-95 transition-all font-bold text-xs"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
                  <span>Выигрыш</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSettle('loss')}
                  className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400 active:scale-95 transition-all font-bold text-xs"
                >
                  <XCircle className="w-5 h-5 text-rose-400 stroke-[2.5]" />
                  <span>Проигрыш</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSettle('push')}
                  className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl bg-slate-500/15 hover:bg-slate-500/25 border border-slate-500/40 text-slate-300 active:scale-95 transition-all font-bold text-xs"
                >
                  <RotateCcw className="w-5 h-5 text-slate-400 stroke-[2.5]" />
                  <span>Возврат</span>
                </button>
              </div>
            </div>
          )}

          {/* Delete Action */}
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 text-xs text-rose-400/80 hover:text-rose-400 p-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isPending ? 'Отменить и удалить ставку' : 'Удалить из истории'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Удалить ставку?"
        message={
          isPending
            ? 'Сумма ставки будет полностью возвращена на ваш текущий баланс.'
            : 'Ставка будет удалена из базы данных. Это действие нельзя отменить.'
        }
        confirmLabel="Удалить"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
