import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ChevronRight, Sparkles } from 'lucide-react';
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
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. KEY METRICS GRID (Profit, ROI, Winrate, Avg Odds, Turnover, Total) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Сводная аналитика</span>
          </h2>
          <span className="text-[11px] text-slate-500">
            {stats.settledBets} рассч. / {stats.totalBets} всего
          </span>
        </div>
        <MetricsGrid stats={stats} currency={currency} />
      </section>

      {/* 2. DYNAMIC BALANCE / PROFIT CHART */}
      <section className="space-y-2">
        <BalanceChart data={chartData} currency={currency} />
      </section>

      {/* 3. PENDING BETS (If any are active right now) */}
      {pendingBets.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>В игре ({pendingBets.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Нажмите для расчета</span>
          </div>
          <div className="space-y-2.5">
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

      {/* 4. RECENT BETS LIST (Wireframe 2: "недавние ставки") */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Недавние ставки
          </h3>
          <Link
            to="/history"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-0.5"
          >
            <span>Все ставки</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentBets.length === 0 ? (
          <div className="p-8 rounded-2xl bg-cs-card border border-cs-border text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-white text-base">Ставок пока нет</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Создайте вашу первую ставку на CS2 матч, чтобы начать отслеживать профит и ROI
              </p>
            </div>
            <Link
              to="/new-bet"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Создать первую ставку</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentBets.map((bet) => (
              <BetCard
                key={bet.id}
                bet={bet}
                onClick={(b) => setSelectedBet(b)}
                currency={currency}
              />
            ))}
          </div>
        )}
      </section>

      {/* Bet Detail & Settlement Modal */}
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
