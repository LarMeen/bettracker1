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
        className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Responsive Modal Container: Bottom sheet on mobile, Centered dialog on PC */}
      <div className="fixed inset-x-0 bottom-0 lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 z-50 w-full max-w-lg mx-auto bg-palette-900/95 backdrop-blur-2xl border-t lg:border border-palette-400/20 rounded-t-[32px] lg:rounded-3xl shadow-2xl safe-bottom max-h-[92vh] flex flex-col animate-in slide-in-from-bottom lg:zoom-in-95 duration-200">
        {/* Drag handle (Mobile only) */}
        <div className="pt-3 pb-1 flex justify-center lg:hidden">
          <div className="w-12 h-1.5 rounded-full bg-palette-400/30" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-palette-400/10 flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-palette-100 bg-palette-700/60 px-3 py-1 rounded-full border border-palette-400/25 inline-block mb-1.5">
              {BET_TYPE_LABELS[bet.betType] || bet.betType}
            </span>
            <h3 className="font-extrabold text-palette-100 text-lg leading-tight">{bet.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-palette-800/80 border border-palette-400/20 text-palette-400 hover:text-palette-100 flex items-center justify-center shrink-0 transition-colors active:scale-95"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {/* Bet Pick Hero Card */}
          <div className="p-4.5 rounded-2xl bg-palette-800/60 border border-palette-400/25 shadow-glow-forest/15">
            <div className="text-[11px] font-bold uppercase tracking-wider text-palette-400 mb-1">
              Ваш выбор (Исход)
            </div>
            <div className="text-2xl font-black text-palette-100 tracking-wide font-mono">
              {bet.betPick}
            </div>
          </div>

          {/* Numbers Bento Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-palette-950/40 border border-palette-400/15">
              <div className="text-[11px] font-medium text-palette-400 flex items-center gap-1 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-palette-200" />
                <span>Коэффициент</span>
              </div>
              <div className="text-xl font-black font-mono text-palette-100 tabular-nums">
                {formatOdds(bet.odds)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-palette-950/40 border border-palette-400/15">
              <div className="text-[11px] font-medium text-palette-400 flex items-center gap-1 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-palette-200" />
                <span>Сумма ставки</span>
              </div>
              <div className="text-xl font-black font-mono text-palette-100 tabular-nums">
                {formatCurrency(bet.stake, currency)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-palette-950/40 border border-palette-400/15">
              <div className="text-[11px] font-medium text-palette-400 mb-1">Потенциал выплаты</div>
              <div className="text-xl font-black font-mono text-status-pending tabular-nums">
                {formatCurrency(bet.potentialWin, currency)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-palette-950/40 border border-palette-400/15">
              <div className="text-[11px] font-medium text-palette-400 mb-1">Статус / Профит</div>
              <div
                className={`text-lg font-black font-mono tabular-nums ${
                  bet.status === 'win'
                    ? 'text-status-win'
                    : bet.status === 'loss'
                    ? 'text-status-loss'
                    : bet.status === 'push'
                    ? 'text-palette-400'
                    : 'text-status-pending'
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
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-palette-800/80 hover:bg-palette-700/80 border border-palette-400/30 text-palette-100 text-xs font-bold transition-all active:scale-[0.98] shadow-glass"
            >
              <ExternalLink className="w-4 h-4 text-palette-200" />
              <span>Открыть матч на HLTV.org</span>
            </a>
          )}

          {/* Notes if any */}
          {bet.notes && (
            <div className="p-3.5 rounded-2xl bg-palette-950/40 border border-palette-400/15 text-xs text-palette-200 leading-relaxed">
              <span className="font-semibold text-palette-400">Заметка: </span>
              {bet.notes}
            </div>
          )}

          {/* Dates info */}
          <div className="flex items-center justify-between text-[11px] text-palette-400 pt-1 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-palette-400/70" />
              {formatDateTime(bet.createdAt)}
            </span>
            {bet.settledAt && <span>Расчет: {formatDateTime(bet.settledAt)}</span>}
          </div>

          {/* SETTLEMENT ACTIONS (For pending bets) - Win / Loss / Push */}
          {isPending && (
            <div className="pt-2 border-t border-palette-400/10 space-y-2.5">
              <p className="text-[11px] font-bold text-palette-400 uppercase tracking-wider text-center">
                Быстрый расчет результата
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSettle('win')}
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-status-win/15 hover:bg-status-win/25 border border-status-win/35 text-status-win active:scale-95 transition-all font-bold text-xs shadow-glow-emerald/10"
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  <span>Выигрыш</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSettle('loss')}
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-status-loss/15 hover:bg-status-loss/25 border border-status-loss/35 text-status-loss active:scale-95 transition-all font-bold text-xs shadow-glow-rose/10"
                >
                  <XCircle className="w-5 h-5 stroke-[2.5]" />
                  <span>Проигрыш</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSettle('push')}
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-palette-700/40 hover:bg-palette-700/60 border border-palette-400/25 text-palette-200 active:scale-95 transition-all font-bold text-xs"
                >
                  <RotateCcw className="w-5 h-5 stroke-[2.5]" />
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
              className="inline-flex items-center gap-1.5 text-xs text-status-loss/80 hover:text-status-loss py-2 px-3 rounded-lg hover:bg-status-loss/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isPending ? 'Отменить ставку и вернуть средства' : 'Удалить из истории'}</span>
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
            : 'Ставка будет удалена из базы данных без возможности восстановления.'
        }
        confirmLabel="Удалить"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
