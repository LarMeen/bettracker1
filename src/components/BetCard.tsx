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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            {BET_STATUS_LABELS.win}
          </span>
        );
      case 'loss':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            {BET_STATUS_LABELS.loss}
          </span>
        );
      case 'push':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-300 border border-slate-500/30">
            <RotateCcw className="w-3 h-3" />
            {BET_STATUS_LABELS.push}
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
            <Clock className="w-3 h-3" />
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
      className="p-4 rounded-2xl bg-cs-card hover:bg-cs-surface/80 border border-cs-border hover:border-slate-700 transition-all duration-200 cursor-pointer active:scale-[0.99] shadow-sm relative overflow-hidden group"
    >
      {/* Status color indicator bar on left */}
      <div
        className={`absolute top-0 left-0 bottom-0 w-1 ${
          isWin
            ? 'bg-emerald-500'
            : isLoss
            ? 'bg-rose-500'
            : isPush
            ? 'bg-slate-500'
            : 'bg-amber-500'
        }`}
      />

      {/* Top line: Title & Status */}
      <div className="flex items-start justify-between gap-2 mb-2 pl-1">
        <h4 className="font-bold text-white text-base leading-snug line-clamp-1 group-hover:text-amber-300 transition-colors">
          {bet.title}
        </h4>
        <div className="shrink-0">{getStatusBadge()}</div>
      </div>

      {/* Middle line: Pick & Bet Type */}
      <div className="flex items-center gap-2 mb-3 pl-1 text-xs text-slate-400">
        <span className="font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
          {bet.betPick}
        </span>
        <span>•</span>
        <span className="truncate">{BET_TYPE_LABELS[bet.betType] || bet.betType}</span>
        {bet.hltvUrl && (
          <>
            <span>•</span>
            <span className="inline-flex items-center gap-0.5 text-cyan-400">
              <ExternalLink className="w-3 h-3" /> HLTV
            </span>
          </>
        )}
      </div>

      {/* Bottom line: Stake, Odds & Profit/Potential */}
      <div className="flex items-center justify-between pt-2.5 border-t border-cs-border/60 pl-1 text-sm">
        <div className="flex items-baseline gap-1 text-slate-300">
          <span className="font-mono font-bold text-white">{formatOdds(bet.odds)}</span>
          <span className="text-xs text-slate-500">×</span>
          <span className="font-mono text-slate-300 text-xs">{formatCurrency(bet.stake, currency)}</span>
        </div>

        <div className="text-right">
          {isPending && (
            <div className="text-xs text-slate-400">
              Потенциал:{' '}
              <span className="font-mono font-bold text-amber-400">
                {formatCurrency(bet.potentialWin, currency)}
              </span>
            </div>
          )}
          {isWin && (
            <div className="font-mono font-bold text-emerald-400 text-sm">
              {formatCurrencyWithSign(bet.profit, currency)}
            </div>
          )}
          {isLoss && (
            <div className="font-mono font-bold text-rose-400 text-sm">
              {formatCurrencyWithSign(bet.profit, currency)}
            </div>
          )}
          {isPush && (
            <div className="font-mono font-semibold text-slate-400 text-sm">
              0 {currency} (Возврат)
            </div>
          )}
        </div>
      </div>

      {/* Date in top-right or corner */}
      <div className="mt-2 text-[11px] text-slate-500 text-right">
        {formatShortDate(bet.createdAt)}
      </div>
    </div>
  );
};
