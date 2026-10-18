import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Wallet } from 'lucide-react';
import { useBalance } from '../hooks/useBalance';
import { useBets } from '../hooks/useBets';
import { BetForm } from '../components/BetForm';
import { formatCurrency } from '../utils/format';

export const NewBet: React.FC = () => {
  const navigate = useNavigate();
  const { balance, currency, isInitialized } = useBalance();
  const { createBet } = useBets();
  const [successNotice, setSuccessNotice] = useState(false);

  const handleSuccess = () => {
    setSuccessNotice(true);
    setTimeout(() => {
      navigate('/');
    }, 900);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 py-2 px-3 -ml-2 rounded-xl text-xs font-bold text-palette-400 hover:text-palette-100 hover:bg-palette-800/40 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-palette-900/80 border border-palette-400/20 text-xs shadow-inner-light">
          <Wallet className="w-3.5 h-3.5 text-palette-200" />
          <span className="text-palette-400 font-medium">Банк:</span>
          <span className="font-mono font-bold text-palette-100 tabular-nums">
            {formatCurrency(balance, currency)}
          </span>
        </div>
      </div>

      {/* Success Banner */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-status-win/15 border border-status-win/35 text-status-win flex items-center gap-3 animate-in fade-in zoom-in-95 shadow-glow-emerald/20">
          <CheckCircle2 className="w-5 h-5 text-status-win shrink-0" />
          <div className="text-sm font-bold">Ставка успешно заключена и добавлена!</div>
        </div>
      )}

      {/* Bet Form Container */}
      <div className="p-6 sm:p-7 rounded-3xl glass-card shadow-2xl">
        <BetForm
          currentBalance={balance}
          currency={currency}
          onSubmit={createBet}
          onSuccess={handleSuccess}
        />
      </div>

      {!isInitialized && (
        <p className="text-xs text-center text-palette-400 font-medium">
          * Чтобы делать ставки, сначала установите стартовый банк в разделе «Банк и Кошелек».
        </p>
      )}
    </div>
  );
};
