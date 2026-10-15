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
    <div className="p-3.5 rounded-2xl bg-cs-card border border-cs-border space-y-3">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          placeholder="Поиск по команде или событию..."
          className="pl-9 py-2 text-xs rounded-xl bg-cs-surface border-cs-border"
        />
        {filters.searchQuery && (
          <button
            type="button"
            onClick={() => onChange({ ...filters, searchQuery: '' })}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
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
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filters.status === opt.value
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-cs-surface text-slate-400 hover:text-white border border-cs-border/80'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Second row: Period & Min Odds */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Period */}
        <div className="flex items-center gap-1.5 bg-cs-surface px-2.5 py-1.5 rounded-xl border border-cs-border">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filters.datePeriod}
            onChange={(e) =>
              onChange({
                ...filters,
                datePeriod: e.target.value as BetFilterOptions['datePeriod'],
              })
            }
            className="bg-transparent border-0 p-0 text-xs font-medium text-slate-200 focus:ring-0 cursor-pointer"
          >
            <option value="all" className="bg-slate-900">За всё время</option>
            <option value="7days" className="bg-slate-900">7 дней</option>
            <option value="30days" className="bg-slate-900">30 дней</option>
            <option value="month" className="bg-slate-900">Этот месяц</option>
          </select>
        </div>

        {/* Min Odds */}
        <div className="flex items-center gap-1.5 bg-cs-surface px-2.5 py-1 rounded-xl border border-cs-border">
          <span className="text-[11px] text-slate-400 shrink-0 font-medium">Кэф от:</span>
          <input
            type="number"
            step="0.1"
            min="1.0"
            value={filters.minOdds}
            onChange={(e) => onChange({ ...filters, minOdds: e.target.value })}
            placeholder="1.50"
            className="bg-transparent border-0 p-0 text-xs font-mono font-bold text-white focus:ring-0 w-full"
          />
        </div>
      </div>

      {/* Reset button if filters active */}
      {hasActiveFilters && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Сбросить все фильтры</span>
          </button>
        </div>
      )}
    </div>
  );
};
