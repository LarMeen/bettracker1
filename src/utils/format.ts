import { format, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';

export function formatCurrency(amount: number, currency = '₽'): string {
  const rounded = Math.round(amount * 100) / 100;
  const formatted = rounded.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`.trim();
}

export function formatCurrencyWithSign(amount: number, currency = '₽'): string {
  const sign = amount > 0 ? '+' : '';
  return `${sign}${formatCurrency(amount, currency)}`;
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

export function formatDate(dateInput: Date | string | number): string {
  const d = new Date(dateInput);
  if (!isValid(d)) return '';
  return format(d, 'd MMMM yyyy', { locale: ru });
}

export function formatDateTime(dateInput: Date | string | number): string {
  const d = new Date(dateInput);
  if (!isValid(d)) return '';
  return format(d, 'd MMM, HH:mm', { locale: ru });
}

export function formatShortDate(dateInput: Date | string | number): string {
  const d = new Date(dateInput);
  if (!isValid(d)) return '';
  return format(d, 'dd.MM', { locale: ru });
}
