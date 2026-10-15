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
        return 'Дашборд';
      case '/new-bet':
        return 'Создание ставки';
      case '/history':
        return 'История ставок';
      case '/wallet':
        return 'Кошелек';
      default:
        return 'CS2 BetTracker';
    }
  };

  return (
    <div className="min-h-screen bg-cs-bg text-slate-100 flex flex-col selection:bg-amber-500/30">
      {/* Top Header - Matches wireframes 2, 3, 4, 5 */}
      <header className="sticky top-0 z-30 bg-cs-card/90 backdrop-blur-md border-b border-cs-border safe-top">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between gap-2">
          {/* Left: Hamburger Menu Button (Red in wireframes) */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 -ml-1 rounded-xl bg-cs-surface/80 hover:bg-cs-surface text-amber-400 active:scale-95 flex items-center justify-center border border-cs-border transition-all"
            aria-label="Открыть меню"
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Center: Title */}
          <div className="text-center font-bold text-white text-base tracking-tight truncate">
            {getPageTitle()}
          </div>

          {/* Right: Wallet Button (Red in wireframes) */}
          <Link
            to="/wallet"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-semibold text-xs transition-all active:scale-95"
            aria-label="Открыть кошелек"
          >
            <Wallet className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="font-mono">{formatCurrency(balance, currency)}</span>
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
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 pb-24">
        {/* Banner if wallet is not set up */}
        {!isInitialized && location.pathname !== '/wallet' && (
          <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Банк не инициализирован</p>
              <p className="text-xs text-amber-400/80">Установите стартовый банк для расчета статистики</p>
            </div>
            <Link
              to="/wallet"
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs whitespace-nowrap"
            >
              Настроить
            </Link>
          </div>
        )}

        <Outlet />
      </main>

      {/* Quick Floating Action Button for New Bet when on Dashboard or History */}
      {location.pathname !== '/new-bet' && (
        <div className="fixed bottom-6 right-6 z-20 max-w-md mx-auto">
          <Link
            to="/new-bet"
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 flex items-center justify-center active:scale-95 transition-all border-2 border-amber-400/50"
            aria-label="Быстро добавить ставку"
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </Link>
        </div>
      )}
    </div>
  );
};
