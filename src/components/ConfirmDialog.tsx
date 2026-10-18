import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getConfirmStyle = () => {
    switch (confirmVariant) {
      case 'danger':
        return 'bg-status-loss hover:bg-rose-500 text-white shadow-glow-rose/30 border border-status-loss/40';
      case 'warning':
      case 'primary':
      default:
        return 'bg-palette-600 hover:bg-palette-500 text-palette-100 font-bold shadow-glow-forest border border-palette-400/35';
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md z-[60] transition-opacity"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-palette-900/95 backdrop-blur-2xl border border-palette-400/25 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-status-loss/15 border border-status-loss/30 flex items-center justify-center text-status-loss shrink-0 shadow-glow-rose/10">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-palette-100 text-base leading-tight">{title}</h3>
            </div>
          </div>

          <p className="text-xs text-palette-300 leading-relaxed font-medium">{message}</p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="py-3 px-4 rounded-xl bg-palette-800 hover:bg-palette-700 text-palette-300 font-bold text-xs transition-colors border border-palette-400/20 active:scale-95"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`py-3 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 ${getConfirmStyle()}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
