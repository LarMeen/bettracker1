import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  PlusCircle,
  History,
  Wallet,
  Crosshair,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  currency: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, balance, currency }) => {
  const navItems = [
    { to: '/', label: 'Дашборд', icon: LayoutDashboard },
    { to: '/new-bet', label: 'Новая ставка', icon: PlusCircle },
    { to: '/history', label: 'История ставок', icon: History },
    { to: '/wallet', label: 'Банк и Кошелек', icon: Wallet },
  ];

  return (
    <>
      {/* Mobile Backdrop with smooth blur (only on screens < lg) */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel - Fixed drawer on mobile, persistent docked sidebar on desktop (lg:w-64) */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] lg:w-64 bg-palette-900/90 lg:bg-palette-900/80 backdrop-blur-2xl border-r border-palette-400/15 z-50 flex flex-col transform transition-transform duration-300 ease-out safe-top safe-bottom shadow-2xl lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-palette-400/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-palette-600 to-palette-700 flex items-center justify-center shadow-glow-forest border border-palette-400/30">
              <Crosshair className="w-5 h-5 text-palette-200 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-black text-palette-100 text-sm tracking-wider uppercase">BetTracker</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-status-win animate-pulse" />
                <p className="text-[10px] text-palette-400 font-semibold tracking-wider uppercase">CS2 Analytics</p>
              </div>
            </div>
          </div>
          {/* Close button on mobile only */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-palette-800/80 hover:bg-palette-700 text-palette-400 hover:text-palette-100 flex items-center justify-center border border-palette-400/15 transition-colors active:scale-95 lg:hidden"
            aria-label="Закрыть меню"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bankroll Mini Card inside Sidebar */}
        <div className="p-4 mx-4 my-3 rounded-2xl glass-card-subtle">
          <div className="flex items-center justify-between text-xs text-palette-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Виртуальный банк</span>
            <div className="p-1 rounded-md bg-palette-600/30 text-palette-200">
              <TrendingUp className="w-3 h-3" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-palette-100 tracking-tight">
            {formatCurrency(balance, currency)}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-2xl font-semibold text-xs tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-palette-600/70 text-palette-100 border border-palette-400/30 shadow-[0_0_15px_-2px_rgba(35,83,71,0.5)]'
                      : 'text-palette-400 hover:text-palette-200 hover:bg-palette-800/40'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-palette-200' : 'text-palette-400'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info with local offline storage badge */}
        <div className="p-4 border-t border-palette-400/10 bg-palette-950/40 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-palette-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-palette-200" />
            <span>Локально (Offline PWA)</span>
          </div>
          <p className="text-[10px] text-palette-400/60 mt-0.5">Данные хранятся на устройстве</p>
        </div>
      </aside>
    </>
  );
};
