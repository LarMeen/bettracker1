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
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Navigation Row with Min 44px touch target */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 py-2 px-3 -ml-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-xs shadow-inner-light">
          <Wallet className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400 font-medium">Банк:</span>
          <span className="font-mono font-bold text-amber-300 tabular-nums">
            {formatCurrency(balance, currency)}
          </span>
        </div>
      </div>

      {/* Success Banner */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 animate-in fade-in zoom-in-95 shadow-glow-emerald/20">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-sm font-bold">Ставка успешно заключена и добавлена!</div>
        </div>
      )}

      {/* Bet Form Container */}
      <div className="p-5 rounded-3xl glass-card shadow-2xl">
        <BetForm
          currentBalance={balance}
          currency={currency}
          onSubmit={createBet}
          onSuccess={handleSuccess}
        />
      </div>

      {!isInitialized && (
        <p className="text-xs text-center text-amber-400/90 font-medium">
          * Чтобы делать ставки, сначала установите стартовый банк в разделе «Кошелек».
        </p>
      )}
    </div>
  );
};
