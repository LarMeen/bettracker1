import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ChevronRight, Sparkles, Flame } from 'lucide-react';
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. KEY METRICS GRID (Profit, ROI, Winrate, Avg Odds, Turnover, Total) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Сводная аналитика</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-mono font-semibold tabular-nums">
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
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>В игре ({pendingBets.length})</span>
            </h3>
            <span className="text-[11px] text-amber-400/80 font-medium">Тапните для расчета</span>
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
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Недавние ставки
          </h3>
          <Link
            to="/history"
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5 transition-colors"
          >
            <span>Все ставки</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentBets.length === 0 ? (
          <div className="p-8 rounded-3xl glass-card text-center space-y-3.5 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30 shadow-glow-gold/10">
              <PlusCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="font-extrabold text-white text-base">Ставок пока нет</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Заключите вашу первую ставку на матч CS2, чтобы начать отслеживать банкролл и ROI
              </p>
            </div>
            <Link
              to="/new-bet"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-glow-gold transition-all active:scale-95 border border-amber-300/50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Сделать первую ставку</span>
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
