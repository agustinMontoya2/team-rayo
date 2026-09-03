const LOCALE = 'es-AR';
const NOON_HACK = 'T12:00:00';

import { today } from './utils';

export function parseDate(iso: string): Date {
  return new Date(iso + NOON_HACK);
}

export function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    return parseDate(iso).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export const fmtDate = formatDate;

export function formatLongDate(iso: string): string {
  if (!iso) return '';
  try {
    return parseDate(iso).toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });
  } catch {
    return iso;
  }
}

export function formatShortDate(iso: string): string {
  if (!iso) return '';
  try {
    return parseDate(iso).toLocaleDateString(LOCALE, { day: '2-digit', month: '2-digit' });
  } catch {
    return iso;
  }
}

export function ageFrom(birthDate: string): number | null {
  if (!birthDate) return null;
  try {
    const n = parseDate(birthDate);
    const h = new Date();
    let e = h.getFullYear() - n.getFullYear();
    if (h < new Date(h.getFullYear(), n.getMonth(), n.getDate())) e--;
    return e;
  } catch {
    return null;
  }
}

export function daysUntil(iso: string): number {
  return Math.round((parseDate(iso).getTime() - parseDate(today()).getTime()) / 86400000);
}

export function daysLabel(iso: string): string {
  const dias = daysUntil(iso);
  return dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `en ${dias} días`;
}

export function periodLabel(p: string): string {
  try {
    const parts = p.split('-');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, 1).toLocaleDateString(LOCALE, {
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return p;
  }
}

export function monthShortLabel(p: string): string {
  try {
    const [y, m] = p.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString(LOCALE, { month: 'short' }).replace('.', '');
  } catch {
    return p;
  }
}

export function formatMoney(n: number): string {
  return '$' + Number(n || 0).toLocaleString(LOCALE);
}

function toNum(n: number | string): number {
  const v = typeof n === 'string' ? Number(n) : n;
  return Number.isFinite(v) ? v : 0;
}

export function formatNumber(n: number | string): string {
  return String(toNum(n)).replace('.', ',');
}

export function formatWeight(n: number | string | null | undefined): string {
  if (n == null || n === '') return '';
  return formatNumber(n) + ' kg';
}
