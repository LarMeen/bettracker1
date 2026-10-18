import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, Wallet, Plus, Sparkles } from 'lucide-react';
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
        return 'Дашборд и Аналитика';
      case '/new-bet':
        return 'Новая ставка';
      case '/history':
        return 'История ставок';
      case '/wallet':
        return 'Виртуальный банк';
      case '/import-bet':
        return 'Импорт ставки';
      default:
        return 'CS2 BetTracker';
    }
  };

  return (
    <div className="min-h-screen text-palette-200 flex flex-col selection:bg-palette-600/40">
      {/* Sidebar Drawer on mobile / Persistent sidebar on desktop (lg:w-64) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        balance={balance}
        currency={currency}
      />

      {/* Main Wrapper with left offset on desktop */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header - Glassmorphic, full width responsive */}
        <header className="sticky top-0 z-30 bg-palette-950/75 backdrop-blur-xl border-b border-palette-400/15 safe-top transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Left: Mobile hamburger (hidden on lg) + Title / Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="w-10 h-10 rounded-xl bg-palette-900/80 hover:bg-palette-800 text-palette-200 active:scale-95 flex items-center justify-center border border-palette-400/15 transition-all shadow-inner-light lg:hidden"
                aria-label="Открыть главное меню"
              >
                <Menu className="w-5 h-5 stroke-[2.2]" />
              </button>

              <div className="flex items-center gap-2">
                <span className="hidden lg:inline-flex items-center gap-1 text-xs font-semibold text-palette-400">
                  <span>Обзор</span>
                  <span className="text-palette-400/50">/</span>
                </span>
                <h1 className="font-extrabold text-palette-100 text-sm sm:text-base tracking-wide uppercase">
                  {getPageTitle()}
                </h1>
              </div>
            </div>

            {/* Right: Quick Action Buttons & Wallet Pill */}
            <div className="flex items-center gap-3">
              {/* Desktop "+ Новая ставка" Header button */}
              {location.pathname !== '/new-bet' && (
                <Link
                  to="/new-bet"
                  className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-palette-600 hover:bg-palette-500 text-palette-100 font-bold text-xs tracking-wider uppercase transition-all shadow-glow-forest active:scale-95 border border-palette-400/30"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Ставка</span>
                </Link>
              )}

              {/* Wallet Pill Button */}
              <Link
                to="/wallet"
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-palette-800/80 hover:bg-palette-700/80 border border-palette-400/25 text-palette-200 font-semibold text-xs transition-all active:scale-95 shadow-glass"
                aria-label="Открыть кошелек"
              >
                <div className="relative flex items-center justify-center">
                  <Wallet className="w-4 h-4 stroke-[2] text-palette-200" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-status-win animate-pulse" />
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-mono font-black tracking-tight text-palette-100 tabular-nums">
                    {formatCurrency(balance, currency)}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area - Full width on desktop with max-w-7xl container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-12">
          {/* Banner if wallet is not set up */}
          {!isInitialized && location.pathname !== '/wallet' && (
            <div className="mb-6 p-4 rounded-3xl bg-palette-800/70 border border-palette-400/25 text-palette-200 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-palette-600/40 border border-palette-400/30 flex items-center justify-center text-palette-200 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-palette-100">Банк не инициализирован</p>
                  <p className="text-xs text-palette-400 mt-0.5">Укажите стартовый депозит для расчёта статистики и ROI</p>
                </div>
              </div>
              <Link
                to="/wallet"
                className="px-4 py-2 rounded-xl bg-palette-600 hover:bg-palette-500 text-palette-100 font-bold text-xs shadow-glow-forest whitespace-nowrap active:scale-95 transition-all border border-palette-400/30"
              >
                Настроить банк
              </Link>
            </div>
          )}

          <Outlet />
        </main>
      </div>

      {/* Mobile Floating Action Button (Only on screens < sm) */}
      {location.pathname !== '/new-bet' && (
        <div className="fixed bottom-6 right-6 z-20 sm:hidden">
          <Link
            to="/new-bet"
            className="w-14 h-14 rounded-2xl bg-palette-600 hover:bg-palette-500 text-palette-100 font-black shadow-glow-forest flex items-center justify-center active:scale-90 transition-all duration-200 border border-palette-400/40"
            aria-label="Быстро добавить ставку"
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </Link>
        </div>
      )}
    </div>
  );
};
