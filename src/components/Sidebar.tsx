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
    { to: '/', label: 'Дашборд и Статистика', icon: LayoutDashboard },
    { to: '/new-bet', label: 'Создать ставку', icon: PlusCircle },
    { to: '/history', label: 'История ставок', icon: History },
    { to: '/wallet', label: 'Кошелек (Банк)', icon: Wallet },
  ];

  return (
    <>
      {/* Backdrop with smooth blur */}
      <div
        className={`fixed inset-0 bg-black/75 backdrop-blur-md z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-slate-950/95 backdrop-blur-2xl border-r border-white/10 z-50 flex flex-col transform transition-transform duration-300 ease-out safe-top safe-bottom shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-glow-gold/30 border border-amber-300/40">
              <Crosshair className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-black text-white text-base leading-tight tracking-wider">CS2 TRACKER</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[11px] text-amber-400/90 font-semibold tracking-wide">PWA EDITION</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-white/10 transition-colors active:scale-95"
            aria-label="Закрыть меню"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bankroll Mini Card inside Drawer */}
        <div className="p-4 mx-4 my-3 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-white/[0.08] shadow-inner-light">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-medium uppercase tracking-wider text-[10px]">Виртуальный банк</span>
            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white tracking-tight">
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
                  `flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-300 border-l-2 border-amber-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info with security & local badge */}
        <div className="p-4 border-t border-white/[0.08] bg-slate-950/40 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Локальное хранилище (Offline)</span>
          </div>
          <p className="text-[10px] text-slate-600 mt-1">CS2 BetTracker • Без внешних серверов</p>
        </div>
      </aside>
    </>
  );
};
