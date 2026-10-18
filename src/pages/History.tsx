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
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Filters Bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(initialFilters)}
      />

      {/* Filter summary bar */}
      <div className="flex items-center justify-between text-xs text-palette-400 px-3 py-2 rounded-2xl glass-card-subtle">
        <span className="flex items-center gap-1.5 font-medium">
          <Layers className="w-3.5 h-3.5 text-palette-200" />
          <span>Найдено:</span>
          <strong className="text-palette-100 font-mono font-black tabular-nums">{filteredBets.length}</strong>
        </span>
        {filteredStats.settledCount > 0 && (
          <span className="font-mono tabular-nums text-xs">
            Профит выборки:{' '}
            <strong
              className={`font-black ${
                filteredStats.profit >= 0 ? 'text-status-win' : 'text-status-loss'
              }`}
            >
              {formatCurrencyWithSign(filteredStats.profit, currency)}
            </strong>
          </span>
        )}
      </div>

      {/* Bets Grid: 1 col on mobile, 2 cols on tablet/desktop */}
      {filteredBets.length === 0 ? (
        <div className="p-10 rounded-3xl glass-card text-center space-y-3 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-palette-900 flex items-center justify-center mx-auto border border-palette-400/20 text-palette-400">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <p className="font-bold text-palette-100 text-base">Ставки не найдены</p>
          <p className="text-xs text-palette-400 max-w-xs mx-auto leading-relaxed">
            Попробуйте изменить параметры поиска или сбросить фильтры
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
