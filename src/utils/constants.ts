import type { BetType, BetStatus, OperationType } from '../db';

export const BET_TYPES: { value: BetType; label: string; short: string }[] = [
  { value: 'match_winner', label: 'Победитель (П1 / П2)', short: 'Победа' },
  { value: 'map_total', label: 'Тотал карт (ТБ / ТМ)', short: 'Тотал карт' },
  { value: 'map_handicap', label: 'Фора по картам', short: 'Фора карт' },
  { value: 'round_total', label: 'Тотал раундов', short: 'Тотал рнд' },
  { value: 'other', label: 'Другой исход', short: 'Другое' },
];

export const BET_TYPE_LABELS: Record<BetType, string> = {
  match_winner: 'Победитель матча',
  map_total: 'Тотал карт',
  map_handicap: 'Фора карт',
  round_total: 'Тотал раундов',
  other: 'Другой исход',
};

export const BET_STATUS_LABELS: Record<BetStatus, string> = {
  pending: 'Ожидает',
  win: 'Выигрыш',
  loss: 'Проигрыш',
  push: 'Возврат',
};

export const OPERATION_LABELS: Record<OperationType, string> = {
  bet_placed: 'Ставка',
  bet_win: 'Выигрыш',
  bet_loss: 'Проигрыш',
  bet_push: 'Возврат',
  deposit: 'Пополнение',
  withdraw: 'Списание',
  reset: 'Сброс банка',
};

export const QUICK_PERCENTAGES = [5, 10, 15, 25, 50];

// CS2 top tier teams for quick autocomplete on mobile
export const POPULAR_CS2_TEAMS = [
  'Natus Vincere',
  'FaZe Clan',
  'Team Spirit',
  'Vitality',
  'G2 Esports',
  'MOUZ',
  'Eternal Fire',
  'Virtus.pro',
  'Astralis',
  'Heroic',
  'Team Liquid',
  'Complexity',
  'FURIA',
  'The MongolZ',
  'Falcons',
  'Cloud9',
  'paiN Gaming',
  'SAW',
  'BIG',
  'Ninjas in Pyjamas',
  'ENCE',
  'GamerLegion',
  '3DMAX',
  'Aurora',
  'fnatic',
];
