import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
} from 'lucide-react';
import type { Bet } from '../db';
import {
  encodeBetToShareUrl,
  encodeBetToToken,
  downloadSingleBetJson,
} from '../services/shareBetService';

interface ShareBetModalProps {
  bet: Bet | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareBetModal: React.FC<ShareBetModalProps> = ({ bet, isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'code'>('qr');

  useEffect(() => {
    if (!isOpen || !bet) return;

    const url = encodeBetToShareUrl(bet);

    QRCode.toDataURL(url, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#020e0e',
        light: '#DAF1DE',
      },
      errorCorrectionLevel: 'M',
    })
      .then((data) => setQrDataUrl(data))
      .catch((err) => console.error('Ошибка генерации QR:', err));
  }, [isOpen, bet]);

  if (!isOpen || !bet) return null;

  const shareUrl = encodeBetToShareUrl(bet);
  const token = encodeBetToToken(bet);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ставка: ${bet.title}`,
          text: `Перенос ставки в BetTracker: ${bet.title} (${bet.betPick}, кэф ${bet.odds})`,
          url: shareUrl,
        });
      } catch {
        // user dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-palette-900/95 backdrop-blur-2xl border border-palette-400/25 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-palette-400/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-palette-700/60 border border-palette-400/25 flex items-center justify-center text-palette-200">
                <QrCode className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-extrabold text-palette-100 text-sm sm:text-base leading-tight">
                  Перенести ставку
                </h3>
                <p className="text-[11px] text-palette-400">На другой телефон или компьютер</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-palette-800/80 border border-palette-400/20 text-palette-400 hover:text-palette-100 flex items-center justify-center transition-colors active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Bet Overview pill */}
          <div className="p-3 rounded-2xl glass-card-subtle flex items-center justify-between text-xs">
            <div className="min-w-0 pr-2">
              <span className="font-bold text-palette-100 truncate block">{bet.title}</span>
              <span className="text-[11px] text-palette-400 font-mono">
                {bet.betPick} • Кэф {bet.odds} • {bet.stake} ₽
              </span>
            </div>
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-palette-600/40 text-palette-200 border border-palette-400/25">
              {bet.status}
            </span>
          </div>

          {/* Mode Switcher: QR-код / Текстовый код */}
          <div className="flex bg-palette-950/80 p-1 rounded-2xl border border-palette-400/15">
            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                activeTab === 'qr'
                  ? 'bg-palette-600 text-palette-100 shadow-glow-forest'
                  : 'text-palette-400 hover:text-palette-200'
              }`}
            >
              QR-код
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                activeTab === 'code'
                  ? 'bg-palette-600 text-palette-100 shadow-glow-forest'
                  : 'text-palette-400 hover:text-palette-200'
              }`}
            >
              Код и ссылка
            </button>
          </div>

          {/* Tab 1: QR Code display */}
          {activeTab === 'qr' && (
            <div className="space-y-3 text-center">
              <div className="p-4 bg-palette-950/60 rounded-3xl border border-palette-400/20 inline-block shadow-inner-light">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR-код ставки"
                    className="w-52 h-52 sm:w-60 sm:h-60 mx-auto rounded-2xl shadow-lg border border-[#DAF1DE]/40"
                  />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-xs text-palette-400">
                    Генерация QR-кода...
                  </div>
                )}
              </div>
              <p className="text-xs text-palette-400 max-w-xs mx-auto">
                Наведите камеру смартфона на этот QR-код, чтобы моментально открыть и импортировать ставку
              </p>
            </div>
          )}

          {/* Tab 2: Code & Link text */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-palette-400 uppercase tracking-wider">
                  Прямая ссылка для открытия
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="text-xs font-mono py-2 bg-palette-950/80 text-palette-300 truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3.5 rounded-xl bg-palette-600 hover:bg-palette-500 text-palette-100 font-bold text-xs shrink-0 flex items-center gap-1.5 active:scale-95 transition-all shadow-glow-forest"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-status-win" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Скопировано' : 'Копировать'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-palette-400 uppercase tracking-wider">
                  Код ставки (текстовый токен)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={token}
                    className="text-xs font-mono py-2 bg-palette-950/80 text-palette-300 truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="px-3.5 rounded-xl bg-palette-800 hover:bg-palette-700 text-palette-200 font-bold text-xs shrink-0 flex items-center gap-1.5 active:scale-95 transition-all border border-palette-400/20"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5 text-status-win" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedToken ? 'Скопировано' : 'Код'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-palette-400/10">
            <button
              type="button"
              onClick={handleNativeShare}
              className="py-3 px-3 rounded-2xl bg-palette-600 hover:bg-palette-500 text-palette-100 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-glow-forest border border-palette-400/30"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Поделиться</span>
            </button>

            <button
              type="button"
              onClick={() => downloadSingleBetJson(bet)}
              className="py-3 px-3 rounded-2xl bg-palette-800/80 hover:bg-palette-700 text-palette-200 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all border border-palette-400/20"
            >
              <Download className="w-3.5 h-3.5 text-palette-200" />
              <span>Скачать .json</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
