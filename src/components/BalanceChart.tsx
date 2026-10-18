import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { ChartPoint } from '../services/statsService';
import { formatCurrency } from '../utils/format';

interface BalanceChartProps {
  data: ChartPoint[];
  currency?: string;
}

export const BalanceChart: React.FC<BalanceChartProps> = ({ data, currency = '₽' }) => {
  const [viewMode, setViewMode] = useState<'balance' | 'profit'>('balance');

  if (data.length <= 1) {
    return (
      <div className="p-6 rounded-2xl glass-card text-center">
        <p className="text-sm text-slate-300 font-semibold">Недостаточно данных для графика</p>
        <p className="text-xs text-slate-400 mt-1">
          График начнет строиться после добавления и расчета ваших первых ставок
        </p>
      </div>
    );
  }

  const isProfit = viewMode === 'profit';
  const dataKey = isProfit ? 'profit' : 'balance';

  return (
    <div className="p-4 rounded-2xl glass-card space-y-3">
      {/* Chart Header + View Switcher */}
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Динамика {isProfit ? 'профита' : 'банка'}</span>
        </h3>
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-white/10 shadow-inner-light">
          <button
            type="button"
            onClick={() => setViewMode('balance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
              !isProfit
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Банк
          </button>
          <button
            type="button"
            onClick={() => setViewMode('profit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
              isProfit
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Профит
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-48 w-full -ml-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" vertical={false} />

            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            />

            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}`}
              domain={['auto', 'auto']}
              width={46}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const point = payload[0].payload as ChartPoint;
                return (
                  <div className="p-3 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-white/15 shadow-2xl text-xs space-y-1.5 z-50">
                    <div className="text-[10px] font-medium text-slate-400">{point.fullDate}</div>
                    <div className="font-mono font-black text-white text-sm">
                      Банк: {formatCurrency(point.balance, currency)}
                    </div>
                    <div
                      className={`font-mono text-xs font-bold ${
                        point.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      Профит: {point.profit >= 0 ? `+${point.profit}` : point.profit} {currency}
                    </div>
                    {point.description && (
                      <div className="text-[10px] text-slate-400 line-clamp-1 border-t border-white/10 pt-1">
                        {point.description}
                      </div>
                    )}
                  </div>
                );
              }}
            />

            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={isProfit ? '#10b981' : '#f59e0b'}
              strokeWidth={2.5}
              fill={isProfit ? 'url(#profitGrad)' : 'url(#balanceGrad)'}
              dot={{ r: 2.5, fill: isProfit ? '#10b981' : '#f59e0b', strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2, fill: isProfit ? '#10b981' : '#f59e0b' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
