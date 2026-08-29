import { describe, expect, it } from 'vitest';
import { fmtDate, fmtFechaLarga, fmtMoney, fmtNum, fmtPeso, periodoLabel } from '../format';

describe('fmtDate', () => {
  it('formatea una fecha ISO en es-AR', () => {
    expect(fmtDate('2026-08-28')).toMatch(/ago/);
    expect(fmtDate('2026-08-28')).toMatch(/2026/);
  });

  it('deja la entrada vacía sin formato', () => {
    expect(fmtDate('')).toBe('');
  });
});

describe('fmtFechaLarga', () => {
  it('formatea con el día en español', () => {
    expect(fmtFechaLarga('2026-08-28')).toContain('ago');
  });
});

describe('fmtMoney', () => {
  it('usa peso argentino y separador de miles', () => {
    expect(fmtMoney(25000)).toContain('$');
    expect(fmtMoney(25000)).toContain('25.000');
  });

  it('respeta el separador decimal', () => {
    expect(fmtMoney(100.5)).toContain('100,5');
  });
});

describe('fmtNum', () => {
  it('usa coma como separador decimal', () => {
    expect(fmtNum(63.5)).toBe('63,5');
    expect(fmtNum('63.5')).toBe('63,5');
  });

  it('deja enteros sin cambio', () => {
    expect(fmtNum(10)).toBe('10');
  });
});

describe('fmtPeso', () => {
  it('agrega la unidad y formatea el número', () => {
    expect(fmtPeso(63.5)).toBe('63,5 kg');
    expect(fmtPeso(70)).toBe('70 kg');
  });

  it('devuelve vacío para null/undefined', () => {
    expect(fmtPeso(null)).toBe('');
    expect(fmtPeso(undefined)).toBe('');
    expect(fmtPeso('')).toBe('');
  });
});

describe('periodoLabel', () => {
  it('convierte YYYY-MM a nombre de mes y año en es-AR', () => {
    expect(periodoLabel('2026-08')).toMatch(/ago/);
    expect(periodoLabel('2026-08')).toMatch(/2026/);
  });
});