import React, { useState, useId } from 'react';
import {
  Link as LinkIcon,
  Calculator,
  Clipboard,
  Sparkles,
  Percent,
} from 'lucide-react';
import type { BetType } from '../db';
import type { CreateBetInput } from '../services/betService';
import { BET_TYPES, QUICK_PERCENTAGES, POPULAR_CS2_TEAMS } from '../utils/constants';
import { formatCurrency } from '../utils/format';

interface BetFormProps {
  currentBalance: number;
  currency?: string;
  onSubmit: (input: CreateBetInput) => Promise<number>;
  onSuccess?: (betId: number) => void;
}

export const BetForm: React.FC<BetFormProps> = ({
  currentBalance,
  currency = '₽',
  onSubmit,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [betType, setBetType] = useState<BetType>('match_winner');
  const [betPick, setBetPick] = useState('П1');
  const [oddsStr, setOddsStr] = useState('1.85');
  const [stakeStr, setStakeStr] = useState('');
  const [hltvUrl, setHltvUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const stakeId = useId();
  const oddsId = useId();
  const titleId = useId();
  const pickId = useId();
  const hltvId = useId();

  const odds = parseFloat(oddsStr) || 0;
  const stake = parseFloat(stakeStr) || 0;

  const potentialWin = odds > 0 && stake > 0 ? Math.round(stake * odds * 100) / 100 : 0;
  const netProfit = odds > 1 && stake > 0 ? Math.round(stake * (odds - 1) * 100) / 100 : 0;

  // Paste from clipboard helper
  const handlePasteHLTV = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.includes('hltv.org')) {
        setHltvUrl(text.trim());
      } else {
        setHltvUrl(text.trim());
      }
    } catch {
      // Clipboard access denied, user can paste manually
    }
  };

  // Quick pick suggestions based on type
  const getPickSuggestions = () => {
    switch (betType) {
      case 'match_winner':
        return ['П1', 'П2'];
      case 'map_total':
        return ['ТБ 2.5', 'ТМ 2.5', 'ТБ 1.5', 'ТМ 1.5'];
      case 'map_handicap':
        return ['Ф1 (-1.5)', 'Ф1 (+1.5)', 'Ф2 (-1.5)', 'Ф2 (+1.5)'];
      case 'round_total':
        return ['ТБ 20.5', 'ТМ 20.5', 'ТБ 21.5', 'ТМ 21.5'];
      default:
        return [];
    }
  };

  // Quick percentage of bank calculation
  const handleQuickPercent = (pct: number) => {
    if (currentBalance <= 0) return;
    const calculated = Math.floor((currentBalance * pct) / 100);
    setStakeStr(String(calculated));
  };

  // Quick team selection
  const handleQuickTeam = (team: string) => {
    if (!title) {
      setTitle(`${team} vs `);
    } else if (title.endsWith('vs ') || title.endsWith('против ')) {
      setTitle(`${title}${team}`);
    } else {
      setTitle(`${title} vs ${team}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Укажите название матча или команд');
      return;
    }
    if (!betPick.trim()) {
      setErrorMessage('Укажите выбранный исход (пик)');
      return;
    }
    if (odds <= 1.0) {
      setErrorMessage('Коэффициент должен быть больше 1.00');
      return;
    }
    if (stake <= 0) {
      setErrorMessage('Сумма ставки должна быть больше 0');
      return;
    }
    if (stake > currentBalance) {
      setErrorMessage(`Недостаточно средств. В банке доступно: ${formatCurrency(currentBalance, currency)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const newId = await onSubmit({
        title: title.trim(),
        betType,
        betPick: betPick.trim(),
        odds,
        stake,
        hltvUrl: hltvUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (onSuccess) {
        onSuccess(newId);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка при сохранении ставки';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-status-loss/15 border border-status-loss/30 text-status-loss text-xs font-semibold shadow-glow-rose/10 animate-in fade-in">
          {errorMessage}
        </div>
      )}

      {/* Field 1: Match Title */}
      <div className="space-y-1.5">
        <label htmlFor={titleId} className="block text-xs font-bold uppercase tracking-wider text-palette-300">
          Событие / Команды <span className="text-palette-200">*</span>
        </label>
        <input
          id={titleId}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="NaVi vs FaZe, BLAST Premier"
          required
          autoComplete="off"
        />
        {/* Quick teams pill scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1.5 pb-0.5">
          <span className="text-[10px] text-palette-400 uppercase tracking-wider shrink-0 font-bold">
            Команды:
          </span>
          {POPULAR_CS2_TEAMS.slice(0, 8).map((team) => (
            <button
              key={team}
              type="button"
              onClick={() => handleQuickTeam(team)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-palette-900/80 hover:bg-palette-800 text-palette-300 hover:text-palette-100 shrink-0 border border-palette-400/15 hover:border-palette-400/35 transition-all active:scale-95"
            >
              +{team}
            </button>
          ))}
        </div>
      </div>

      {/* Field 2: Bet Type Chips */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-palette-300">Тип ставки</label>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {BET_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => {
                setBetType(type.value);
                const suggestions: Record<string, string> = {
                  match_winner: 'П1',
                  map_total: 'ТБ 2.5',
                  map_handicap: 'Ф1 (-1.5)',
                  round_total: 'ТБ 20.5',
                  other: '',
                };
                if (suggestions[type.value]) {
                  setBetPick(suggestions[type.value]);
                }
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                betType === type.value
                  ? 'bg-palette-600 text-palette-100 shadow-glow-forest border border-palette-400/40'
                  : 'bg-palette-900/80 text-palette-400 hover:text-palette-200 border border-palette-400/15'
              }`}
            >
              {type.short}
            </button>
          ))}
        </div>
      </div>

      {/* Field 3: Bet Pick with fast suggestions */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor={pickId} className="block text-xs font-bold uppercase tracking-wider text-palette-300">
            Выбор исхода (Пик) <span className="text-palette-200">*</span>
          </label>
          <span className="text-[11px] text-palette-400 font-medium">Например: П1 или ТБ 2.5</span>
        </div>
        <input
          id={pickId}
          type="text"
          value={betPick}
          onChange={(e) => setBetPick(e.target.value)}
          placeholder="П1, ТБ 2.5, Фора 1 (-1.5)"
          required
        />
        {/* Suggestion pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1.5">
          {getPickSuggestions().map((sugg) => (
            <button
              key={sugg}
              type="button"
              onClick={() => setBetPick(sugg)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all active:scale-95 ${
                betPick === sugg
                  ? 'bg-palette-600/70 border-palette-400/40 text-palette-100 shadow-glow-forest/20'
                  : 'bg-palette-900/80 border-palette-400/15 text-palette-400 hover:text-palette-200'
              }`}
            >
              {sugg}
            </button>
          ))}
        </div>
      </div>

      {/* Field 4: HLTV URL */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor={hltvId} className="block text-xs font-bold uppercase tracking-wider text-palette-300">
            Ссылка на матч (HLTV)
          </label>
          <button
            type="button"
            onClick={handlePasteHLTV}
            className="inline-flex items-center gap-1 text-xs text-palette-200 hover:text-palette-100 font-bold px-2 py-0.5 rounded-lg bg-palette-700/60 border border-palette-400/25 active:scale-95 transition-all"
          >
            <Clipboard className="w-3 h-3" /> Вставить
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-palette-400">
            <LinkIcon className="w-4 h-4" />
          </div>
          <input
            id={hltvId}
            type="url"
            value={hltvUrl}
            onChange={(e) => setHltvUrl(e.target.value)}
            placeholder="https://www.hltv.org/matches/..."
            className="pl-10 text-xs font-mono"
          />
        </div>
      </div>

      {/* Field 5 & 6: Stake & Odds side by side */}
      <div className="grid grid-cols-2 gap-3">
        {/* Stake */}
        <div className="space-y-1.5">
          <label htmlFor={stakeId} className="block text-xs font-bold uppercase tracking-wider text-palette-300">
            Сумма ставки <span className="text-palette-200">*</span>
          </label>
          <input
            id={stakeId}
            type="number"
            step="1"
            min="1"
            max={currentBalance}
            value={stakeStr}
            onChange={(e) => setStakeStr(e.target.value)}
            placeholder="500"
            required
            className="font-mono text-base font-bold tabular-nums"
          />
        </div>

        {/* Odds */}
        <div className="space-y-1.5">
          <label htmlFor={oddsId} className="block text-xs font-bold uppercase tracking-wider text-palette-300">
            Коэффициент <span className="text-palette-200">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              id={oddsId}
              type="number"
              step="0.01"
              min="1.01"
              value={oddsStr}
              onChange={(e) => setOddsStr(e.target.value)}
              placeholder="1.85"
              required
              className="font-mono text-base font-bold pr-16 tabular-nums"
            />
            {/* Step buttons */}
            <div className="absolute right-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const val = Math.max(1.01, Math.round((odds - 0.05) * 100) / 100);
                  setOddsStr(val.toFixed(2));
                }}
                className="w-7 h-8 rounded-lg bg-palette-800 hover:bg-palette-700 text-palette-200 text-xs font-black flex items-center justify-center border border-palette-400/20 active:scale-95 transition-all"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = Math.round((odds + 0.05) * 100) / 100;
                  setOddsStr(val.toFixed(2));
                }}
                className="w-7 h-8 rounded-lg bg-palette-800 hover:bg-palette-700 text-palette-200 text-xs font-black flex items-center justify-center border border-palette-400/20 active:scale-95 transition-all"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stake percent buttons */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-palette-400">
          <span className="flex items-center gap-1 font-semibold uppercase tracking-wider">
            <Percent className="w-3 h-3 text-palette-200" />
            Быстрый % от банка:
          </span>
          <span className="font-mono text-palette-200 font-bold tabular-nums">
            Банк: {formatCurrency(currentBalance, currency)}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {QUICK_PERCENTAGES.map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => handleQuickPercent(pct)}
              className="py-2 rounded-xl bg-palette-900/80 hover:bg-palette-800 border border-palette-400/15 hover:border-palette-400/35 text-palette-300 hover:text-palette-100 text-xs font-bold transition-all active:scale-95"
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Potential Calculation Preview Card */}
      {potentialWin > 0 && (
        <div className="p-4 rounded-2xl bg-palette-800/60 border border-palette-400/25 flex items-center justify-between shadow-glow-forest/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-palette-700/60 border border-palette-400/25 flex items-center justify-center text-palette-200 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-palette-400">Выплата</div>
              <div className="text-lg font-black font-mono text-palette-100 tabular-nums">
                {formatCurrency(potentialWin, currency)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-bold uppercase tracking-wider text-palette-400">Чистый профит</div>
            <div className="text-base font-black font-mono text-status-win tabular-nums">
              +{formatCurrency(netProfit, currency)}
            </div>
          </div>
        </div>
      )}

      {/* Big Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || currentBalance <= 0}
        className="w-full py-4 rounded-2xl bg-palette-600 hover:bg-palette-500 text-palette-100 font-black text-sm tracking-wider uppercase shadow-glow-forest active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-palette-400/35 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Calculator className="w-5 h-5 stroke-[2.5]" />
        <span>{isSubmitting ? 'Сохранение...' : 'ЗАКЛЮЧИТЬ СТАВКУ'}</span>
      </button>
    </form>
  );
};
