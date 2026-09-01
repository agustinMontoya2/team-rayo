import { describe, expect, it } from 'vitest';
import { fmtDate, formatLongDate, formatMoney, formatNumber, formatWeight, periodLabel } from '../format';

describe('fmtDate', () => {
  it('formatea una fecha ISO en es-AR', () => {
    expect(fmtDate('2026-08-28')).toMatch(/ago/);
    expect(fmtDate('2026-08-28')).toMatch(/2026/);
  });

  it('deja la entrada vacía sin formato', () => {
    expect(fmtDate('')).toBe('');
  });
});

describe('formatLongDate', () => {
  it('formatea con el día en español', () => {
    expect(formatLongDate('2026-08-28')).toContain('ago');
  });
});

describe('formatMoney', () => {
  it('usa peso argentino y separador de miles', () => {
    expect(formatMoney(25000)).toContain('$');
    expect(formatMoney(25000)).toContain('25.000');
  });

  it('respeta el separador decimal', () => {
    expect(formatMoney(100.5)).toContain('100,5');
  });
});

describe('formatNumber', () => {
  it('usa coma como separador decimal', () => {
    expect(formatNumber(63.5)).toBe('63,5');
    expect(formatNumber('63.5')).toBe('63,5');
  });

  it('deja enteros sin cambio', () => {
    expect(formatNumber(10)).toBe('10');
  });
});

describe('formatWeight', () => {
  it('agrega la unidad y formatea el número', () => {
    expect(formatWeight(63.5)).toBe('63,5 kg');
    expect(formatWeight(70)).toBe('70 kg');
  });

  it('devuelve vacío para null/undefined', () => {
    expect(formatWeight(null)).toBe('');
    expect(formatWeight(undefined)).toBe('');
    expect(formatWeight('')).toBe('');
  });
});

describe('periodLabel', () => {
  it('convierte YYYY-MM a nombre de mes y año en es-AR', () => {
    expect(periodLabel('2026-08')).toMatch(/ago/);
    expect(periodLabel('2026-08')).toMatch(/2026/);
  });
});
