import React from 'react';
import { ExternalLink, Clock, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import type { Bet } from '../db';
import { BET_STATUS_LABELS, BET_TYPE_LABELS } from '../utils/constants';
import { formatCurrency, formatCurrencyWithSign, formatOdds, formatShortDate } from '../utils/format';

interface BetCardProps {
  bet: Bet;
  onClick: (bet: Bet) => void;
  currency?: string;
}

export const BetCard: React.FC<BetCardProps> = ({ bet, onClick, currency = '₽' }) => {
  const getStatusBadge = () => {
    switch (bet.status) {
      case 'win':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {BET_STATUS_LABELS.win}
          </span>
        );
      case 'loss':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]">
            <XCircle className="w-3.5 h-3.5" />
            {BET_STATUS_LABELS.loss}
          </span>
        );
      case 'push':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">
            <RotateCcw className="w-3.5 h-3.5" />
            {BET_STATUS_LABELS.push}
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <Clock className="w-3.5 h-3.5" />
            {BET_STATUS_LABELS.pending}
          </span>
        );
    }
  };

  const isWin = bet.status === 'win';
  const isLoss = bet.status === 'loss';
  const isPush = bet.status === 'push';
  const isPending = bet.status === 'pending';

  return (
    <div
      onClick={() => onClick(bet)}
      className="p-4 rounded-2xl glass-card-interactive relative overflow-hidden group cursor-pointer shadow-md"
    >
      {/* Status indicator bar on left with soft glow */}
      <div
        className={`absolute top-0 left-0 bottom-0 w-1.5 transition-all ${
          isWin
            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
            : isLoss
            ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
            : isPush
            ? 'bg-slate-400'
            : 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
        }`}
      />

      {/* Top line: Title & Status */}
      <div className="flex items-start justify-between gap-2 mb-2 pl-1.5">
        <h4 className="font-bold text-white text-[15px] leading-snug line-clamp-1 group-hover:text-amber-300 transition-colors">
          {bet.title}
        </h4>
        <div className="shrink-0">{getStatusBadge()}</div>
      </div>

      {/* Middle line: Pick & Bet Type */}
      <div className="flex items-center gap-2 mb-3 pl-1.5 text-xs text-slate-400 flex-wrap">
        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25">
          {bet.betPick}
        </span>
        <span className="text-slate-600">•</span>
        <span className="truncate font-medium">{BET_TYPE_LABELS[bet.betType] || bet.betType}</span>
        {bet.hltvUrl && (
          <>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1 text-cyan-400 font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 text-[11px]">
              <ExternalLink className="w-3 h-3" /> HLTV
            </span>
          </>
        )}
      </div>

      {/* Bottom line: Stake, Odds & Profit/Potential */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.08] pl-1.5 text-sm">
        <div className="flex items-baseline gap-1.5 text-slate-300">
          <span className="font-mono font-black text-white text-base tabular-nums">{formatOdds(bet.odds)}</span>
          <span className="text-xs text-slate-500 font-bold">×</span>
          <span className="font-mono text-slate-300 text-xs tabular-nums">{formatCurrency(bet.stake, currency)}</span>
        </div>

        <div className="text-right">
          {isPending && (
            <div className="text-xs text-slate-400">
              Потенциал:{' '}
              <span className="font-mono font-black text-amber-300 text-sm tabular-nums">
                {formatCurrency(bet.potentialWin, currency)}
              </span>
            </div>
          )}
          {isWin && (
            <div className="font-mono font-black text-emerald-400 text-sm tabular-nums flex items-center justify-end gap-1">
              {formatCurrencyWithSign(bet.profit, currency)}
            </div>
          )}
          {isLoss && (
            <div className="font-mono font-black text-rose-400 text-sm tabular-nums flex items-center justify-end gap-1">
              {formatCurrencyWithSign(bet.profit, currency)}
            </div>
          )}
          {isPush && (
            <div className="font-mono font-bold text-slate-400 text-sm tabular-nums">
              0 {currency} (Возврат)
            </div>
          )}
        </div>
      </div>

      {/* Date in top-right or corner */}
      <div className="mt-1.5 text-[11px] font-medium text-slate-500 text-right tabular-nums">
        {formatShortDate(bet.createdAt)}
      </div>
    </div>
  );
};
