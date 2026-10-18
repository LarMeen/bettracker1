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
      {/* Backdrop with smooth blur */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Sheet from Bottom */}
      <div className="fixed inset-x-0 bottom-0 z-50 max-w-md mx-auto bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 rounded-t-[28px] shadow-2xl safe-bottom max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-250">
        {/* Drag handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-white/[0.08] flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30 inline-block mb-1">
              {BET_TYPE_LABELS[bet.betType] || bet.betType}
            </span>
            <h3 className="font-bold text-white text-lg leading-tight">{bet.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-900 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center shrink-0 transition-colors active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
          {/* Bet Pick Hero Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 shadow-glow-gold/10">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ваш выбор (Исход)</div>
            <div className="text-2xl font-black text-amber-300 tracking-wide font-mono">
              {bet.betPick}
            </div>
          </div>

          {/* Numbers Bento Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.08] shadow-inner-light">
              <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Коэффициент</span>
              </div>
              <div className="text-xl font-black font-mono text-white tabular-nums">
                {formatOdds(bet.odds)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.08] shadow-inner-light">
              <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>Сумма ставки</span>
              </div>
              <div className="text-xl font-black font-mono text-white tabular-nums">
                {formatCurrency(bet.stake, currency)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.08] shadow-inner-light">
              <div className="text-[11px] font-medium text-slate-400 mb-1">Потенциал выплаты</div>
              <div className="text-xl font-black font-mono text-amber-300 tabular-nums">
                {formatCurrency(bet.potentialWin, currency)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.08] shadow-inner-light">
              <div className="text-[11px] font-medium text-slate-400 mb-1">Статус / Профит</div>
              <div
                className={`text-lg font-black font-mono tabular-nums ${
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
              className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-cyan-500/30 text-cyan-400 text-xs font-bold transition-all active:scale-[0.98] shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)]"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Открыть матч на HLTV.org</span>
            </a>
          )}

          {/* Notes if any */}
          {bet.notes && (
            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-white/[0.08] text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-slate-400">Заметка: </span>
              {bet.notes}
            </div>
          )}

          {/* Dates info */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {formatDateTime(bet.createdAt)}
            </span>
            {bet.settledAt && <span>Расчет: {formatDateTime(bet.settledAt)}</span>}
          </div>

          {/* SETTLEMENT ACTIONS (For pending bets) - Win / Loss / Push */}
          {isPending && (
            <div className="pt-2 border-t border-white/[0.08] space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Быстрый расчет ставки
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSettle('win')}
                  className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 rounded-2xl bg-gradient-to-b from-emerald-500/20 to-emerald-500/10 hover:from-emerald-500/30 hover:to-emerald-500/15 border border-emerald-500/40 text-emerald-300 active:scale-95 transition-all font-bold text-xs shadow-glow-emerald/10"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
                  <span>Выигрыш</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSettle('loss')}
                  className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 rounded-2xl bg-gradient-to-b from-rose-500/20 to-rose-500/10 hover:from-rose-500/30 hover:to-rose-500/15 border border-rose-500/40 text-rose-300 active:scale-95 transition-all font-bold text-xs shadow-glow-rose/10"
                >
                  <XCircle className="w-5 h-5 text-rose-400 stroke-[2.5]" />
                  <span>Проигрыш</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSettle('push')}
                  className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 rounded-2xl bg-gradient-to-b from-slate-700/25 to-slate-800/25 hover:from-slate-700/35 border border-white/15 text-slate-300 active:scale-95 transition-all font-bold text-xs"
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
              className="inline-flex items-center gap-1.5 text-xs text-rose-400/80 hover:text-rose-400 py-2 px-3 rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isPending ? 'Отменить и вернуть сумму' : 'Удалить из истории'}</span>
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
