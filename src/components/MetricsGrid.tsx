import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Target,
  Calculator,
  RefreshCw,
  Hash,
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
    <div className="grid grid-cols-2 gap-3">
      {/* 1. Profit Card */}
      <div className={`p-4 rounded-2xl glass-card relative overflow-hidden group transition-all duration-200 ${
        isProfitPositive ? 'hover:border-emerald-500/40 shadow-glow-emerald/5' : 'hover:border-rose-500/40 shadow-glow-rose/5'
      }`}>
        {/* Ambient background glow */}
        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 ${
          isProfitPositive ? 'bg-emerald-500' : 'bg-rose-500'
        }`} />

        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Чистый профит</span>
          <div className={`p-1.5 rounded-lg border ${
            isProfitPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {isProfitPositive ? (
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <TrendingDown className="w-4 h-4 stroke-[2.5]" />
            )}
          </div>
        </div>
        <div
          className={`text-2xl font-black font-mono tracking-tight tabular-nums ${
            isProfitPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {formatCurrencyWithSign(stats.profit, currency)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          <span>{stats.settledBets > 0 ? `${stats.settledBets} рассч. ставок` : 'Нет рассчитанных'}</span>
        </div>
      </div>

      {/* 2. ROI Card */}
      <div className="p-4 rounded-2xl glass-card relative overflow-hidden group hover:border-amber-500/40 transition-all duration-200">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-15 bg-amber-500" />

        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ROI (Окупаемость)</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Percent className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div
          className={`text-2xl font-black font-mono tracking-tight tabular-nums ${
            isRoiPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {formatPercent(stats.roi)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
          <span>Фактор:</span>
          <span className="font-mono font-bold text-amber-300">{stats.profitFactor}</span>
        </div>
      </div>

      {/* 3. Winrate Card */}
      <div className="p-4 rounded-2xl glass-card relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-200">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-15 bg-cyan-500" />

        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Винрейт</span>
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Target className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="text-2xl font-black font-mono text-cyan-300 tracking-tight tabular-nums">
          {formatPercent(stats.winrate)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1.5 font-mono font-semibold flex items-center gap-1.5">
          <span className="text-emerald-400">{stats.wins}W</span>
          <span className="text-slate-600">•</span>
          <span className="text-rose-400">{stats.losses}L</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300">{stats.pushes}P</span>
        </div>
      </div>

      {/* 4. Avg Odds Card */}
      <div className="p-4 rounded-2xl glass-card relative overflow-hidden group hover:border-purple-500/40 transition-all duration-200">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-15 bg-purple-500" />

        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Средний кэф</span>
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Calculator className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="text-2xl font-black font-mono text-white tracking-tight tabular-nums">
          {stats.avgOdds > 0 ? formatOdds(stats.avgOdds) : '—'}
        </div>
        <div className="text-[11px] text-slate-400 mt-1.5 font-medium">По всем исходам</div>
      </div>

      {/* 5. Turnover Card */}
      <div className="p-4 rounded-2xl glass-card relative overflow-hidden group hover:border-slate-600/40 transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Общий оборот</span>
          <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-white/10">
            <RefreshCw className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
        <div className="text-xl font-black font-mono text-slate-100 tracking-tight tabular-nums">
          {formatCurrency(stats.turnover, currency)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1.5 font-medium">Сумма всех ставок</div>
      </div>

      {/* 6. Total Bets Card */}
      <div className="p-4 rounded-2xl glass-card relative overflow-hidden group hover:border-amber-500/40 transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Всего ставок</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Hash className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="text-xl font-black font-mono text-white tracking-tight tabular-nums flex items-baseline gap-1.5">
          <span>{stats.totalBets}</span>
          {stats.pendingBets > 0 && (
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              {stats.pendingBets} в игре
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-400 mt-1.5 font-medium">
          {stats.pendingBets > 0 ? 'Требуют расчета' : 'Все рассчитаны'}
        </div>
      </div>
    </div>
  );
};
