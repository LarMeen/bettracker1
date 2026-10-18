import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Target,
  Calculator,
  ArrowUpRight,
} from 'lucide-react';
import type { StatsOverview } from '../services/statsService';
import { formatCurrencyWithSign, formatCurrency, formatPercent, formatOdds } from '../utils/format';

interface MetricsGridProps {
  stats: StatsOverview;
  currency?: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ stats, currency = '₽' }) => {
  const isProfitPositive = stats.profit >= 0;
  const isRoiPositive = stats.roi >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Profit Card (Styled directly after Clasy KPI card) */}
      <div className="p-5 rounded-3xl glass-card-interactive relative overflow-hidden group flex flex-col justify-between">
        {/* Ambient background aura */}
        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-25 ${
          isProfitPositive ? 'bg-status-win' : 'bg-status-loss'
        }`} />

        {/* Card Header: Icon & Top Right Arrow */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${
              isProfitPositive
                ? 'bg-status-win/15 border-status-win/30 text-status-win'
                : 'bg-status-loss/15 border-status-loss/30 text-status-loss'
            }`}>
              {isProfitPositive ? (
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <TrendingDown className="w-4 h-4 stroke-[2.5]" />
              )}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-palette-400">Профит</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/[0.04] text-palette-400 group-hover:text-palette-100 group-hover:bg-palette-600/50 flex items-center justify-center transition-all">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Big Number */}
        <div
          className={`text-2xl sm:text-3xl font-black font-mono tracking-tight tabular-nums my-1 ${
            isProfitPositive ? 'text-status-win' : 'text-status-loss'
          }`}
        >
          {formatCurrencyWithSign(stats.profit, currency)}
        </div>

        {/* Clasy-style Sub-metrics row */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-palette-400/10 mt-2 text-[11px]">
          <div>
            <span className="text-palette-400 block font-medium">Рассчитано</span>
            <span className="font-mono font-bold text-palette-100 tabular-nums">
              {stats.settledBets}
            </span>
          </div>
          <div>
            <span className="text-palette-400 block font-medium">В игре</span>
            <span className="font-mono font-bold text-status-pending tabular-nums">
              {stats.pendingBets}
            </span>
          </div>
        </div>
      </div>

      {/* 2. ROI Card */}
      <div className="p-5 rounded-3xl glass-card-interactive relative overflow-hidden group flex flex-col justify-between">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 bg-palette-600" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-palette-700/60 border border-palette-400/25 flex items-center justify-center text-palette-200">
              <Percent className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-palette-400">ROI</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/[0.04] text-palette-400 group-hover:text-palette-100 group-hover:bg-palette-600/50 flex items-center justify-center transition-all">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          className={`text-2xl sm:text-3xl font-black font-mono tracking-tight tabular-nums my-1 ${
            isRoiPositive ? 'text-palette-100' : 'text-status-loss'
          }`}
        >
          {formatPercent(stats.roi)}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-palette-400/10 mt-2 text-[11px]">
          <div>
            <span className="text-palette-400 block font-medium">Фактор</span>
            <span className="font-mono font-bold text-palette-100 tabular-nums">
              {stats.profitFactor}
            </span>
          </div>
          <div>
            <span className="text-palette-400 block font-medium">Оборот</span>
            <span className="font-mono font-bold text-palette-100 tabular-nums truncate">
              {formatCurrency(stats.turnover, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Winrate Card */}
      <div className="p-5 rounded-3xl glass-card-interactive relative overflow-hidden group flex flex-col justify-between">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 bg-palette-600" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-palette-700/60 border border-palette-400/25 flex items-center justify-center text-palette-200">
              <Target className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-palette-400">Винрейт</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/[0.04] text-palette-400 group-hover:text-palette-100 group-hover:bg-palette-600/50 flex items-center justify-center transition-all">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="text-2xl sm:text-3xl font-black font-mono text-palette-100 tracking-tight tabular-nums my-1">
          {formatPercent(stats.winrate)}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-palette-400/10 mt-2 text-[11px]">
          <div>
            <span className="text-palette-400 block font-medium">Победы</span>
            <span className="font-mono font-bold text-status-win tabular-nums">
              {stats.wins}W
            </span>
          </div>
          <div>
            <span className="text-palette-400 block font-medium">Поражения</span>
            <span className="font-mono font-bold text-status-loss tabular-nums">
              {stats.losses}L
            </span>
          </div>
        </div>
      </div>

      {/* 4. Avg Odds Card */}
      <div className="p-5 rounded-3xl glass-card-interactive relative overflow-hidden group flex flex-col justify-between">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 bg-palette-700" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-palette-700/60 border border-palette-400/25 flex items-center justify-center text-palette-200">
              <Calculator className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-palette-400">Ср. Кэф</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/[0.04] text-palette-400 group-hover:text-palette-100 group-hover:bg-palette-600/50 flex items-center justify-center transition-all">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="text-2xl sm:text-3xl font-black font-mono text-palette-100 tracking-tight tabular-nums my-1">
          {stats.avgOdds > 0 ? formatOdds(stats.avgOdds) : '—'}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-palette-400/10 mt-2 text-[11px]">
          <div>
            <span className="text-palette-400 block font-medium">Всего</span>
            <span className="font-mono font-bold text-palette-100 tabular-nums">
              {stats.totalBets} ставок
            </span>
          </div>
          <div>
            <span className="text-palette-400 block font-medium">Возвраты</span>
            <span className="font-mono font-bold text-palette-400 tabular-nums">
              {stats.pushes}P
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
