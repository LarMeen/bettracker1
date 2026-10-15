import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { useBalance } from '../hooks/useBalance';
import { useBets } from '../hooks/useBets';
import { BetForm } from '../components/BetForm';

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
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        <span className="text-xs text-slate-400">
          Свободно:{' '}
          <span className="font-mono font-bold text-amber-400">
            {balance.toLocaleString('ru-RU')} {currency}
          </span>
        </span>
      </div>

      {/* Success Banner */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-sm font-semibold">Ставка успешно добавлена в игру!</div>
        </div>
      )}

      {/* Bet Form Container */}
      <div className="p-4 rounded-3xl bg-cs-card border border-cs-border shadow-xl">
        <BetForm
          currentBalance={balance}
          currency={currency}
          onSubmit={createBet}
          onSuccess={handleSuccess}
        />
      </div>

      {!isInitialized && (
        <p className="text-xs text-center text-amber-400/80">
          * Чтобы делать ставки, сначала установите стартовый банк в разделе «Кошелек».
        </p>
      )}
    </div>
  );
};
