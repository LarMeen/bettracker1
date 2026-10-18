import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ArrowUpRight, Sparkles, Flame } from 'lucide-react';
import { useStats } from '../hooks/useStats';
import { useBets } from '../hooks/useBets';
import { useBalance } from '../hooks/useBalance';
import { MetricsGrid } from '../components/MetricsGrid';
import { BalanceChart } from '../components/BalanceChart';
import { BetCard } from '../components/BetCard';
import { BetDetail } from '../components/BetDetail';
import type { Bet } from '../db';

export const Dashboard: React.FC = () => {
  const { stats, chartData } = useStats();
  const { recentBets, pendingBets, settleBet, deleteBet } = useBets();
  const { currency } = useBalance();
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-200">
      {/* 1. TOP ROW: 4 CLASY-STYLE KPI METRICS CARDS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-palette-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-palette-200" />
            <span>Сводная аналитика</span>
          </h2>
          <span className="text-[11px] text-palette-400 font-mono font-semibold tabular-nums">
            {stats.settledBets} рассчитано / {stats.totalBets} всего
          </span>
        </div>
        <MetricsGrid stats={stats} currency={currency} />
      </section>

      {/* 2. MAIN BENTO GRID ON PC (2 Columns on Desktop: Left 2/3 for Chart & Pending, Right 1/3 for Recent Bets) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Chart & Active Bets */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dynamic Balance / Profit Spline Chart */}
          <BalanceChart data={chartData} currency={currency} />

          {/* Active / Pending Bets In-Game (If any) */}
          {pendingBets.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-status-pending uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-status-pending" />
                  <span>В игре ({pendingBets.length})</span>
                </h3>
                <span className="text-[11px] text-palette-400 font-medium">Кликните для расчета</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pendingBets.map((bet) => (
                  <BetCard
                    key={bet.id}
                    bet={bet}
                    onClick={(b) => setSelectedBet(b)}
                    currency={currency}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Recent Bets / Activity List (like Clasy's "Requested Withdrawal" panel) */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-palette-300 uppercase tracking-wider">
              Недавние ставки
            </h3>
            <Link
              to="/history"
              className="text-xs text-palette-200 hover:text-palette-100 font-bold flex items-center gap-1 transition-colors group"
            >
              <span>Все ставки</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {recentBets.length === 0 ? (
            <div className="p-8 rounded-3xl glass-card text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-palette-800/80 text-palette-200 flex items-center justify-center mx-auto border border-palette-400/20 shadow-glow-forest/20">
                <PlusCircle className="w-7 h-7 stroke-[2]" />
              </div>
              <div>
                <p className="font-extrabold text-palette-100 text-base">Ставок пока нет</p>
                <p className="text-xs text-palette-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Заключите первую ставку на матч CS2, чтобы начать отслеживать статистику и баланс
                </p>
              </div>
              <Link
                to="/new-bet"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-palette-600 hover:bg-palette-500 text-palette-100 font-black text-xs uppercase tracking-wider shadow-glow-forest transition-all active:scale-95 border border-palette-400/30"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Создать ставку</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBets.slice(0, 6).map((bet) => (
                <BetCard
                  key={bet.id}
                  bet={bet}
                  onClick={(b) => setSelectedBet(b)}
                  currency={currency}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bet Detail & Settlement Modal (Bottom Sheet on mobile, Centered Modal on PC) */}
      <BetDetail
        bet={selectedBet}
        isOpen={Boolean(selectedBet)}
        onClose={() => setSelectedBet(null)}
        onSettle={settleBet}
        onDelete={deleteBet}
        currency={currency}
      />
    </div>
  );
};
