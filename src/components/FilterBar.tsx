import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { BetStatus } from '../db';
import { BET_STATUS_LABELS } from '../utils/constants';

export interface BetFilterOptions {
  status: BetStatus | 'all';
  datePeriod: 'all' | '7days' | '30days' | 'month';
  minOdds: string;
  searchQuery: string;
}

interface FilterBarProps {
  filters: BetFilterOptions;
  onChange: (filters: BetFilterOptions) => void;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange, onReset }) => {
  const statusOptions: { value: BetStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'pending', label: BET_STATUS_LABELS.pending },
    { value: 'win', label: BET_STATUS_LABELS.win },
    { value: 'loss', label: BET_STATUS_LABELS.loss },
    { value: 'push', label: BET_STATUS_LABELS.push },
  ];

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.datePeriod !== 'all' ||
    filters.minOdds !== '' ||
    filters.searchQuery !== '';

  return (
    <div className="p-4 sm:p-5 rounded-3xl glass-card space-y-3.5">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-palette-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          placeholder="Поиск по команде или событию..."
          className="pl-10 py-2.5 text-xs rounded-2xl bg-palette-900/90 border-palette-400/20"
        />
        {filters.searchQuery && (
          <button
            type="button"
            onClick={() => onChange({ ...filters, searchQuery: '' })}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-palette-400 hover:text-palette-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status Filter Horizontal Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ ...filters, status: opt.value })}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              filters.status === opt.value
                ? 'bg-palette-600 text-palette-100 shadow-glow-forest border border-palette-400/40'
                : 'bg-palette-900/80 text-palette-400 hover:text-palette-200 border border-palette-400/15'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Second row: Period & Min Odds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {/* Period */}
        <div className="flex items-center gap-2 bg-palette-900/90 px-3.5 py-2 rounded-2xl border border-palette-400/20 shadow-inner-light">
          <Filter className="w-3.5 h-3.5 text-palette-200 shrink-0" />
          <select
            value={filters.datePeriod}
            onChange={(e) =>
              onChange({
                ...filters,
                datePeriod: e.target.value as BetFilterOptions['datePeriod'],
              })
            }
            className="bg-transparent border-0 p-0 text-xs font-semibold text-palette-200 focus:ring-0 cursor-pointer w-full"
          >
            <option value="all" className="bg-palette-900">За всё время</option>
            <option value="7days" className="bg-palette-900">За 7 дней</option>
            <option value="30days" className="bg-palette-900">За 30 дней</option>
            <option value="month" className="bg-palette-900">Текущий месяц</option>
          </select>
        </div>

        {/* Min Odds */}
        <div className="flex items-center gap-2 bg-palette-900/90 px-3.5 py-2 rounded-2xl border border-palette-400/20 shadow-inner-light">
          <span className="text-[11px] text-palette-400 shrink-0 font-bold uppercase tracking-wider">Кэф от:</span>
          <input
            type="number"
            step="0.1"
            min="1.0"
            value={filters.minOdds}
            onChange={(e) => onChange({ ...filters, minOdds: e.target.value })}
            placeholder="1.50"
            className="bg-transparent border-0 p-0 text-xs font-mono font-bold text-palette-100 focus:ring-0 w-full tabular-nums"
          />
        </div>
      </div>

      {/* Reset button if filters active */}
      {hasActiveFilters && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-bold text-status-loss hover:text-palette-100 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-status-loss/10 border border-status-loss/20 active:scale-95 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            <span>Сбросить фильтры</span>
          </button>
        </div>
      )}
    </div>
  );
};
