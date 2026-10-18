import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, Wallet, Plus } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useBalance } from '../hooks/useBalance';
import { formatCurrency } from '../utils/format';

export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { balance, currency, isInitialized } = useBalance();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Дашборд и Статистика';
      case '/new-bet':
        return 'Новая ставка';
      case '/history':
        return 'История ставок';
      case '/wallet':
        return 'Кошелек (Банк)';
      default:
        return 'CS2 BetTracker';
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col selection:bg-amber-500/30">
      {/* Top Header - Glassmorphic with 44px touch targets */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.08] safe-top transition-colors">
        <div className="max-w-md mx-auto px-4 h-15 py-2 flex items-center justify-between gap-3">
          {/* Left: Hamburger Menu Button (Min 44x44px per UI Pro Max touch guidelines) */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-11 h-11 -ml-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-400 active:scale-95 flex items-center justify-center border border-white/10 transition-all shadow-inner-light"
            aria-label="Открыть главное меню"
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Center: Title with refined typography */}
          <div className="text-center">
            <h1 className="font-extrabold text-white text-sm tracking-wide uppercase truncate max-w-[180px]">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right: Wallet Pill Button (Clickable, min 44px tap zone) */}
          <Link
            to="/wallet"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/10 hover:from-amber-500/20 hover:to-amber-500/30 border border-amber-400/30 text-amber-300 font-semibold text-xs transition-all active:scale-95 shadow-[0_0_15px_-3px_rgba(245,158,11,0.15)]"
            aria-label="Открыть кошелек"
          >
            <div className="relative flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5 stroke-[2.5] text-amber-400" />
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <span className="font-mono font-bold tracking-tight text-white">
              {formatCurrency(balance, currency)}
            </span>
          </Link>
        </div>
      </header>

      {/* Sidebar Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        balance={balance}
        currency={currency}
      />

      {/* Main Content Area (Mobile constrained max-w-md mx-auto) */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 pb-28">
        {/* Banner if wallet is not set up */}
        {!isInitialized && location.pathname !== '/wallet' && (
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 to-amber-500/5 border border-amber-500/30 text-amber-200 text-sm flex items-center justify-between gap-3 shadow-lg shadow-black/30 backdrop-blur-md">
            <div>
              <p className="font-bold text-amber-300">Банк не инициализирован</p>
              <p className="text-xs text-slate-400 mt-0.5">Укажите стартовый депозит для расчёта статистики</p>
            </div>
            <Link
              to="/wallet"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 whitespace-nowrap active:scale-95 transition-all"
            >
              Настроить
            </Link>
          </div>
        )}

        <Outlet />
      </main>

      {/* Quick Floating Action Button for New Bet (Glowing radiant gold, 56x56px) */}
      {location.pathname !== '/new-bet' && (
        <div className="fixed bottom-6 right-6 z-20">
          <Link
            to="/new-bet"
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black shadow-glow-gold hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] flex items-center justify-center active:scale-90 transition-all duration-200 border border-amber-200/50"
            aria-label="Быстро добавить ставку"
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </Link>
        </div>
      )}
    </div>
  );
};
