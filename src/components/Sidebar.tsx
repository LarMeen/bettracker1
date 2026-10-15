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
    { to: '/', label: 'Дашборд и Статистика', icon: LayoutDashboard },
    { to: '/new-bet', label: 'Создать ставку', icon: PlusCircle },
    { to: '/history', label: 'История ставок', icon: History },
    { to: '/wallet', label: 'Кошелек (Банк)', icon: Wallet },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-cs-card border-r border-cs-border z-50 flex flex-col transform transition-transform duration-300 ease-out safe-top safe-bottom ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-cs-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Crosshair className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base leading-tight tracking-wide">CS2 TRACKER</h2>
              <p className="text-xs text-amber-400/90 font-medium">Виртуальный банк</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-cs-surface text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Закрыть меню"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bankroll Mini Card inside Drawer */}
        <div className="p-4 mx-4 my-3 rounded-xl bg-cs-surface/60 border border-cs-border/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Текущий банк</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
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
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                      : 'text-slate-300 hover:bg-cs-surface hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-cs-border text-center text-xs text-slate-500">
          <p>CS2 BetTracker PWA v1.0</p>
          <p className="text-[10px] text-slate-600 mt-0.5">Данные хранятся локально на телефоне</p>
        </div>
      </aside>
    </>
  );
};
