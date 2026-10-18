import React from 'react';
import { ExternalLink, Clock, CheckCircle2, XCircle, RotateCcw, ChevronRight } from 'lucide-react';
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-status-win/15 text-status-win border border-status-win/30 shadow-[0_0_12px_rgba(52,211,153,0.15)]">
            <CheckCircle2 className="w-3 h-3" />
            {BET_STATUS_LABELS.win}
          </span>
        );
      case 'loss':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-status-loss/15 text-status-loss border border-status-loss/30 shadow-[0_0_12px_rgba(251,113,133,0.15)]">
            <XCircle className="w-3 h-3" />
            {BET_STATUS_LABELS.loss}
          </span>
        );
      case 'push':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-palette-400/20 text-palette-200 border border-palette-400/30">
            <RotateCcw className="w-3 h-3" />
            {BET_STATUS_LABELS.push}
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-status-pending/15 text-status-pending border border-status-pending/30 shadow-[0_0_12px_rgba(253,230,138,0.15)] animate-pulse">
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
      className="p-4 sm:p-4.5 rounded-2xl glass-card-interactive relative overflow-hidden group cursor-pointer shadow-md"
    >
      {/* Accent indicator bar on left */}
      <div
        className={`absolute top-0 left-0 bottom-0 w-1.5 transition-all ${
          isWin
            ? 'bg-status-win shadow-[0_0_10px_rgba(52,211,153,0.6)]'
            : isLoss
            ? 'bg-status-loss shadow-[0_0_10px_rgba(251,113,133,0.6)]'
            : isPush
            ? 'bg-palette-400'
            : 'bg-status-pending shadow-[0_0_10px_rgba(253,230,138,0.6)]'
        }`}
      />

      {/* Top line: Match Title & Status Badge */}
      <div className="flex items-start justify-between gap-2 mb-2 pl-2">
        <h4 className="font-bold text-palette-100 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-palette-200 transition-colors">
          {bet.title}
        </h4>
        <div className="shrink-0">{getStatusBadge()}</div>
      </div>

      {/* Middle line: Pick & Details */}
      <div className="flex items-center gap-2 mb-3 pl-2 text-xs text-palette-400 flex-wrap">
        <span className="font-mono font-bold text-palette-100 bg-palette-700/60 px-2 py-0.5 rounded-md border border-palette-400/25">
          {bet.betPick}
        </span>
        <span className="text-palette-400/40">•</span>
        <span className="truncate font-medium">{BET_TYPE_LABELS[bet.betType] || bet.betType}</span>
        {bet.hltvUrl && (
          <>
            <span className="text-palette-400/40">•</span>
            <span className="inline-flex items-center gap-1 text-palette-200 font-semibold bg-palette-700/40 px-1.5 py-0.5 rounded border border-palette-400/20 text-[10px]">
              <ExternalLink className="w-2.5 h-2.5" /> HLTV
            </span>
          </>
        )}
      </div>

      {/* Bottom line: Math Breakdown & Outcome */}
      <div className="flex items-center justify-between pt-2.5 border-t border-palette-400/10 pl-2 text-xs sm:text-sm">
        <div className="flex items-baseline gap-1.5 text-palette-300">
          <span className="font-mono font-black text-palette-100 text-sm sm:text-base tabular-nums">
            {formatOdds(bet.odds)}
          </span>
          <span className="text-[11px] text-palette-400/70 font-bold">×</span>
          <span className="font-mono text-palette-200 text-xs tabular-nums">
            {formatCurrency(bet.stake, currency)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            {isPending && (
              <div className="text-xs text-palette-400">
                Потенциал:{' '}
                <span className="font-mono font-black text-status-pending tabular-nums">
                  {formatCurrency(bet.potentialWin, currency)}
                </span>
              </div>
            )}
            {isWin && (
              <div className="font-mono font-black text-status-win text-sm tabular-nums">
                {formatCurrencyWithSign(bet.profit, currency)}
              </div>
            )}
            {isLoss && (
              <div className="font-mono font-black text-status-loss text-sm tabular-nums">
                {formatCurrencyWithSign(bet.profit, currency)}
              </div>
            )}
            {isPush && (
              <div className="font-mono font-bold text-palette-400 text-sm tabular-nums">
                0 {currency}
              </div>
            )}
          </div>
          <div className="w-6 h-6 rounded-full bg-white/[0.04] text-palette-400 group-hover:text-palette-100 group-hover:bg-palette-600/40 flex items-center justify-center transition-all">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="mt-1.5 text-[10px] font-medium text-palette-400/70 text-right tabular-nums pr-1">
        {formatShortDate(bet.createdAt)}
      </div>
    </div>
  );
};
