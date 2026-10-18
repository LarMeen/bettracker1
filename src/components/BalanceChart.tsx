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
import { TrendingUp, Activity } from 'lucide-react';
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
      <div className="p-8 rounded-3xl glass-card text-center">
        <div className="w-12 h-12 rounded-2xl bg-palette-800/80 border border-palette-400/20 flex items-center justify-center mx-auto text-palette-400 mb-3">
          <Activity className="w-6 h-6" />
        </div>
        <p className="text-sm text-palette-100 font-semibold">Недостаточно данных для графика</p>
        <p className="text-xs text-palette-400 mt-1 max-w-xs mx-auto">
          График начнет строиться сразу после добавления и первого расчета ставок
        </p>
      </div>
    );
  }

  const isProfit = viewMode === 'profit';
  const dataKey = isProfit ? 'profit' : 'balance';

  return (
    <div className="p-5 sm:p-6 rounded-3xl glass-card space-y-4">
      {/* Chart Header + View Switcher (Clasy styled) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-palette-700/60 border border-palette-400/25 flex items-center justify-center text-palette-200">
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-palette-100 uppercase tracking-wider">
              Динамика {isProfit ? 'профита' : 'банка'}
            </h3>
            <p className="text-[11px] text-palette-400">График изменений по ставкам</p>
          </div>
        </div>

        {/* Clasy segmented pill switch */}
        <div className="inline-flex self-start sm:self-auto bg-palette-900/90 p-1 rounded-2xl border border-palette-400/20 shadow-inner-light">
          <button
            type="button"
            onClick={() => setViewMode('balance')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              !isProfit
                ? 'bg-palette-600 text-palette-100 shadow-glow-forest border border-palette-400/30'
                : 'text-palette-400 hover:text-palette-200'
            }`}
          >
            Банк
          </button>
          <button
            type="button"
            onClick={() => setViewMode('profit')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              isProfit
                ? 'bg-palette-600 text-palette-100 shadow-glow-forest border border-palette-400/30'
                : 'text-palette-400 hover:text-palette-200'
            }`}
          >
            Профит
          </button>
        </div>
      </div>

      {/* Chart Canvas with responsive height (higher on desktop) */}
      <div className="h-56 sm:h-64 lg:h-72 w-full -ml-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DAF1DE" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#235347" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34D399" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0B2B26" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(142, 182, 155, 0.08)" vertical={false} />

            <XAxis
              dataKey="date"
              stroke="#8EB69B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(142, 182, 155, 0.15)' }}
            />

            <YAxis
              stroke="#8EB69B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}`}
              domain={['auto', 'auto']}
              width={50}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const point = payload[0].payload as ChartPoint;
                return (
                  <div className="p-3.5 rounded-2xl bg-palette-900/95 backdrop-blur-2xl border border-palette-400/25 shadow-2xl text-xs space-y-1.5 z-50">
                    <div className="text-[10px] font-semibold text-palette-400">{point.fullDate}</div>
                    <div className="font-mono font-black text-palette-100 text-sm">
                      Банк: {formatCurrency(point.balance, currency)}
                    </div>
                    <div
                      className={`font-mono text-xs font-bold ${
                        point.profit >= 0 ? 'text-status-win' : 'text-status-loss'
                      }`}
                    >
                      Профит: {point.profit >= 0 ? `+${point.profit}` : point.profit} {currency}
                    </div>
                    {point.description && (
                      <div className="text-[10px] text-palette-400 line-clamp-1 border-t border-palette-400/15 pt-1">
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
              stroke={isProfit ? '#34D399' : '#DAF1DE'}
              strokeWidth={2.5}
              fill={isProfit ? 'url(#profitGrad)' : 'url(#balanceGrad)'}
              dot={{ r: 3, fill: isProfit ? '#34D399' : '#DAF1DE', strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: '#031010', strokeWidth: 2, fill: isProfit ? '#34D399' : '#DAF1DE' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
