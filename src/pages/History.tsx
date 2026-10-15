import React, { useState, useMemo } from 'react';
import { History as HistoryIcon, Layers } from 'lucide-react';
import { subDays, startOfMonth } from 'date-fns';
import { useBets } from '../hooks/useBets';
import { useBalance } from '../hooks/useBalance';
import { BetCard } from '../components/BetCard';
import { BetDetail } from '../components/BetDetail';
import { FilterBar, type BetFilterOptions } from '../components/FilterBar';
import { formatCurrencyWithSign } from '../utils/format';
import type { Bet } from '../db';

const initialFilters: BetFilterOptions = {
  status: 'all',
  datePeriod: 'all',
  minOdds: '',
  searchQuery: '',
};

export const History: React.FC = () => {
  const { bets, settleBet, deleteBet } = useBets();
  const { currency } = useBalance();
  const [filters, setFilters] = useState<BetFilterOptions>(initialFilters);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);

  // Filter bets based on user criteria
  const filteredBets = useMemo(() => {
    return bets.filter((bet) => {
      // 1. Status filter
      if (filters.status !== 'all' && bet.status !== filters.status) {
        return false;
      }

      // 2. Date period filter
      const betDate = new Date(bet.createdAt);
      const now = new Date();
      if (filters.datePeriod === '7days') {
        const cutoff = subDays(now, 7);
        if (betDate < cutoff) return false;
      } else if (filters.datePeriod === '30days') {
        const cutoff = subDays(now, 30);
        if (betDate < cutoff) return false;
      } else if (filters.datePeriod === 'month') {
        const cutoff = startOfMonth(now);
        if (betDate < cutoff) return false;
      }

      // 3. Min Odds filter
      if (filters.minOdds) {
        const minVal = parseFloat(filters.minOdds);
        if (!isNaN(minVal) && bet.odds < minVal) {
          return false;
        }
      }

      // 4. Search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchTitle = bet.title.toLowerCase().includes(query);
        const matchPick = bet.betPick.toLowerCase().includes(query);
        const matchTeam1 = bet.team1.toLowerCase().includes(query);
        const matchTeam2 = bet.team2.toLowerCase().includes(query);
        if (!matchTitle && !matchPick && !matchTeam1 && !matchTeam2) {
          return false;
        }
      }

      return true;
    });
  }, [bets, filters]);

  // Aggregate stats of filtered selection
  const filteredStats = useMemo(() => {
    let profit = 0;
    let settledCount = 0;
    let winsCount = 0;

    for (const b of filteredBets) {
      if (b.status !== 'pending') {
        profit += b.profit;
        settledCount++;
        if (b.status === 'win') winsCount++;
      }
    }

    const winrate = settledCount > 0 ? (winsCount / settledCount) * 100 : 0;
    return { profit, settledCount, winrate };
  }, [filteredBets]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Filters Bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(initialFilters)}
      />

      {/* Filter summary bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span className="flex items-center gap-1 font-medium">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          Найдено: <strong className="text-white font-mono">{filteredBets.length}</strong>
        </span>
        {filteredStats.settledCount > 0 && (
          <span className="font-mono">
            Профит выборки:{' '}
            <strong
              className={
                filteredStats.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }
            >
              {formatCurrencyWithSign(filteredStats.profit, currency)}
            </strong>
          </span>
        )}
      </div>

      {/* Bets List */}
      {filteredBets.length === 0 ? (
        <div className="p-8 rounded-2xl bg-cs-card border border-cs-border text-center space-y-2">
          <HistoryIcon className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="font-bold text-white text-sm">Ставки не найдены</p>
          <p className="text-xs text-slate-400">
            Попробуйте изменить параметры поиска или сбросить фильтры
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredBets.map((bet) => (
            <BetCard
              key={bet.id}
              bet={bet}
              onClick={(b) => setSelectedBet(b)}
              currency={currency}
            />
          ))}
        </div>
      )}

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
