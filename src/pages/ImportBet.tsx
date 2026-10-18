import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Calendar,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  decodeBetFromToken,
  importSingleBet,
  checkDuplicateBet,
  type SingleBetSharePayload,
} from '../services/shareBetService';
import { useBalance } from '../hooks/useBalance';
import { formatCurrency, formatOdds, formatDateTime } from '../utils/format';
import { BET_STATUS_LABELS, BET_TYPE_LABELS } from '../utils/constants';

export const ImportBet: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { balance, currency } = useBalance();

  const [inputData, setInputData] = useState('');
  const [parsedBet, setParsedBet] = useState<SingleBetSharePayload['bet'] | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [adjustBalance, setAdjustBalance] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // If URL has ?data=..., automatically parse on load
  useEffect(() => {
    const rawData = searchParams.get('data');
    if (rawData) {
      handleProcessData(rawData);
    }
  }, [searchParams]);

  const handleProcessData = async (tokenOrUrl: string) => {
    setError(null);
    try {
      const payload = decodeBetFromToken(tokenOrUrl);
      setParsedBet(payload.bet);
      const dup = await checkDuplicateBet(payload.bet);
      setIsDuplicate(dup);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не удалось распознать данные ставки';
      setError(msg);
      setParsedBet(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleProcessData(content);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (!parsedBet) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const newId = await importSingleBet(parsedBet, { adjustBalance });
      setSuccessId(newId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка при сохранении ставки';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-palette-100 uppercase tracking-wide">
          Импорт полученной ставки
        </h2>
        <p className="text-xs text-palette-400 max-w-sm mx-auto">
          Перенос отдельной ставки с другого телефона или компьютера
        </p>
      </div>

      {/* Success State */}
      {successId ? (
        <div className="p-7 sm:p-9 rounded-3xl glass-card text-center space-y-5 shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-status-win/15 border border-status-win/30 flex items-center justify-center mx-auto text-status-win shadow-glow-emerald/30">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-palette-100">Ставка успешно импортирована!</h3>
            <p className="text-xs text-palette-400 mt-1">
              Она добавлена в вашу локальную базу данных и уже учитывается в статистике.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to="/"
              className="py-3 px-6 rounded-2xl bg-palette-600 hover:bg-palette-500 text-palette-100 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-forest active:scale-95 transition-all border border-palette-400/30"
            >
              <span>На главный дашборд</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/history"
              className="py-3 px-6 rounded-2xl bg-palette-800 hover:bg-palette-700 text-palette-200 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all border border-palette-400/20"
            >
              <span>В историю ставок</span>
            </Link>
          </div>
        </div>
      ) : parsedBet ? (
        /* Preview & Confirmation Card */
        <div className="p-6 sm:p-7 rounded-3xl glass-card space-y-5 shadow-2xl">
          {/* Duplicate warning if exists */}
          {isDuplicate && (
            <div className="p-3.5 rounded-2xl bg-status-pending/15 border border-status-pending/30 text-status-pending text-xs font-semibold flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Похожая ставка с такими же параметрами уже есть в вашей истории.</span>
            </div>
          )}

          {/* Title & Type */}
          <div className="border-b border-palette-400/10 pb-4">
            <span className="text-[11px] font-bold text-palette-100 bg-palette-700/60 px-3 py-1 rounded-full border border-palette-400/25 inline-block mb-1.5">
              {BET_TYPE_LABELS[parsedBet.betType] || parsedBet.betType}
            </span>
            <h3 className="font-extrabold text-palette-100 text-lg leading-tight">
              {parsedBet.title}
            </h3>
          </div>

          {/* Pick Hero Box */}
          <div className="p-4 rounded-2xl bg-palette-800/60 border border-palette-400/25 flex items-center justify-between shadow-glow-forest/10">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-palette-400">Исход (Пик)</div>
              <div className="text-xl font-black text-palette-100 font-mono">{parsedBet.betPick}</div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-palette-700/60 text-palette-200 border border-palette-400/20">
              {BET_STATUS_LABELS[parsedBet.status] || parsedBet.status}
            </span>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-palette-950/40 border border-palette-400/15">
              <div className="text-[11px] font-medium text-palette-400 flex items-center gap-1 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-palette-200" />
                <span>Коэффициент</span>
              </div>
              <div className="text-xl font-black font-mono text-palette-100 tabular-nums">
                {formatOdds(parsedBet.odds)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-palette-950/40 border border-palette-400/15">
              <div className="text-[11px] font-medium text-palette-400 flex items-center gap-1 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-palette-200" />
                <span>Сумма ставки</span>
              </div>
              <div className="text-xl font-black font-mono text-palette-100 tabular-nums">
                {formatCurrency(parsedBet.stake, currency)}
              </div>
            </div>
          </div>

          {/* HLTV & Notes */}
          {parsedBet.hltvUrl && (
            <a
              href={parsedBet.hltvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-palette-800/80 hover:bg-palette-700 border border-palette-400/25 text-palette-200 text-xs font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>HLTV: {parsedBet.hltvUrl}</span>
            </a>
          )}

          {parsedBet.notes && (
            <div className="p-3 rounded-xl bg-palette-950/40 border border-palette-400/15 text-xs text-palette-300">
              <span className="font-semibold text-palette-400">Заметка: </span>
              {parsedBet.notes}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-palette-400 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDateTime(parsedBet.createdAt)}
            </span>
          </div>

          {/* Bank balance options */}
          <div className="p-4 rounded-2xl bg-palette-950/60 border border-palette-400/20 space-y-2.5">
            <div className="text-xs font-bold text-palette-100 uppercase tracking-wider">
              Влияние на баланс банка
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-palette-300">
              <input
                type="checkbox"
                checked={adjustBalance}
                onChange={(e) => setAdjustBalance(e.target.checked)}
                className="mt-0.5 rounded text-palette-600 focus:ring-palette-400/50 w-4 h-4 bg-palette-900 border-palette-400/30 cursor-pointer"
              />
              <span>
                Скорректировать текущий банк ({formatCurrency(balance, currency)}):{' '}
                {parsedBet.status === 'pending'
                  ? `списать сумму ставки (-${parsedBet.stake} ${currency})`
                  : parsedBet.status === 'win'
                  ? `начислить выигрыш (+${parsedBet.profit} ${currency})`
                  : 'учесть результат в банке'}
              </span>
            </label>
            <p className="text-[10px] text-palette-400/70 pl-6.5">
              Снимите галочку, если хотите добавить ставку только в статистику истории, не изменяя кошелек.
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmImport}
              className="w-full py-4 rounded-2xl bg-palette-600 hover:bg-palette-500 text-palette-100 font-black text-sm tracking-wider uppercase shadow-glow-forest active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-palette-400/35 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Сохранение...' : 'ИМПОРТИРОВАТЬ СТАВКУ'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setParsedBet(null);
                setInputData('');
              }}
              className="w-full py-2.5 rounded-xl text-palette-400 hover:text-palette-200 text-xs font-semibold"
            >
              Отменить и выбрать другую ставку
            </button>
          </div>
        </div>
      ) : (
        /* Manual Input & File Upload Form */
        <div className="p-6 sm:p-7 rounded-3xl glass-card space-y-5 shadow-2xl">
          {error && (
            <div className="p-3.5 rounded-2xl bg-status-loss/15 border border-status-loss/30 text-status-loss text-xs font-semibold shadow-glow-rose/10">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-palette-300">
              Вставьте ссылку или код ставки
            </label>
            <textarea
              rows={3}
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Вставьте ссылку https://...#/import-bet?data=... или код ставки"
              className="font-mono text-xs"
            />
          </div>

          <button
            type="button"
            disabled={!inputData.trim()}
            onClick={() => handleProcessData(inputData)}
            className="w-full py-3.5 rounded-2xl bg-palette-600 hover:bg-palette-500 text-palette-100 font-bold text-xs uppercase tracking-wider shadow-glow-forest active:scale-95 transition-all border border-palette-400/30 disabled:opacity-40"
          >
            Распознать ставку
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-palette-400/10"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-palette-400/60 uppercase tracking-widest">
              Или файл
            </span>
            <div className="flex-grow border-t border-palette-400/10"></div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 rounded-2xl bg-palette-900/80 hover:bg-palette-800 text-palette-200 font-bold text-xs flex items-center justify-center gap-2 border border-palette-400/20 active:scale-95 transition-all"
          >
            <Upload className="w-4 h-4 text-palette-200" />
            <span>Выбрать .json файл отдельной ставки</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
