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
    <div className="grid grid-cols-2 gap-2.5">
      {/* 1. Profit */}
      <div className="p-3.5 rounded-2xl bg-cs-card border border-cs-border relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Чистый профит</span>
          {isProfitPositive ? (
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-rose-400" />
          )}
        </div>
        <div
          className={`text-xl font-black font-mono tracking-tight ${
            isProfitPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {formatCurrencyWithSign(stats.profit, currency)}
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          {stats.settledBets > 0 ? `За ${stats.settledBets} рассч.` : 'Нет ставок'}
        </div>
      </div>

      {/* 2. ROI */}
      <div className="p-3.5 rounded-2xl bg-cs-card border border-cs-border relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">ROI (Окупаемость)</span>
          <Percent className="w-4 h-4 text-amber-400" />
        </div>
        <div
          className={`text-xl font-black font-mono tracking-tight ${
            isRoiPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {formatPercent(stats.roi)}
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          Фактор: <span className="font-mono text-slate-400">{stats.profitFactor}</span>
        </div>
      </div>

      {/* 3. Winrate */}
      <div className="p-3.5 rounded-2xl bg-cs-card border border-cs-border relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Винрейт (%)</span>
          <Target className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-xl font-black font-mono text-cyan-300 tracking-tight">
          {formatPercent(stats.winrate)}
        </div>
        <div className="text-[10px] text-slate-500 mt-1 font-mono">
          <span className="text-emerald-400">{stats.wins}W</span> /{' '}
          <span className="text-rose-400">{stats.losses}L</span> /{' '}
          <span className="text-slate-400">{stats.pushes}P</span>
        </div>
      </div>

      {/* 4. Avg Odds */}
      <div className="p-3.5 rounded-2xl bg-cs-card border border-cs-border relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Средний кэф</span>
          <Calculator className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-xl font-black font-mono text-white tracking-tight">
          {stats.avgOdds > 0 ? formatOdds(stats.avgOdds) : '—'}
        </div>
        <div className="text-[10px] text-slate-500 mt-1">По всем исходам</div>
      </div>

      {/* 5. Turnover */}
      <div className="p-3.5 rounded-2xl bg-cs-card border border-cs-border relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Общий оборот</span>
          <RefreshCw className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-lg font-bold font-mono text-slate-200 tracking-tight">
          {formatCurrency(stats.turnover, currency)}
        </div>
        <div className="text-[10px] text-slate-500 mt-1">Сумма всех ставок</div>
      </div>

      {/* 6. Total Bets */}
      <div className="p-3.5 rounded-2xl bg-cs-card border border-cs-border relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Всего ставок</span>
          <Hash className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-lg font-bold font-mono text-white tracking-tight">
          {stats.totalBets}{' '}
          <span className="text-xs text-amber-400/90 font-normal">
            ({stats.pendingBets} в игре)
          </span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          {stats.pendingBets > 0 ? 'Есть нерассчитанные' : 'Все рассчитаны'}
        </div>
      </div>
    </div>
  );
};
