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
      <div className="p-6 rounded-2xl bg-cs-card border border-cs-border text-center">
        <p className="text-sm text-slate-400 font-medium">Недостаточно данных для графика</p>
        <p className="text-xs text-slate-600 mt-1">
          График начнет строиться после добавления и расчета ваших первых ставок
        </p>
      </div>
    );
  }

  const isProfit = viewMode === 'profit';
  const dataKey = isProfit ? 'profit' : 'balance';

  return (
    <div className="p-4 rounded-2xl bg-cs-card border border-cs-border space-y-3">
      {/* Chart Header + View Switcher */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Динамика {isProfit ? 'профита' : 'банка'}
        </h4>
        <div className="flex bg-cs-surface p-0.5 rounded-lg border border-cs-border">
          <button
            type="button"
            onClick={() => setViewMode('balance')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              !isProfit ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Банк
          </button>
          <button
            type="button"
            onClick={() => setViewMode('profit')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              isProfit ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
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
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />

            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1f293d' }}
            />

            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}`}
              domain={['auto', 'auto']}
              width={42}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const point = payload[0].payload as ChartPoint;
                return (
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-xl text-xs space-y-1">
                    <div className="text-[10px] text-slate-400">{point.fullDate}</div>
                    <div className="font-mono font-bold text-white text-sm">
                      Банк: {formatCurrency(point.balance, currency)}
                    </div>
                    <div
                      className={`font-mono text-xs font-semibold ${
                        point.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      Профит: {point.profit >= 0 ? `+${point.profit}` : point.profit} {currency}
                    </div>
                    {point.description && (
                      <div className="text-[10px] text-slate-400 line-clamp-1 border-t border-slate-800 pt-1">
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
              dot={{ r: 2.5, fill: isProfit ? '#10b981' : '#f59e0b' }}
              activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
