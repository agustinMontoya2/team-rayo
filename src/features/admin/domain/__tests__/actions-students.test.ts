import { describe, expect, it } from 'vitest';
import { registerCurrentWeight, registerHistoricalWeight, deleteWeightEntry, toggleStudentActive } from '../actions';
import { base } from './fixtures';

describe('registerCurrentWeight', () => {
  it('registra el peso de hoy como nuevo registro', () => {
    const s = base();
    const res = registerCurrentWeight(s, 'a1', 62);
    expect(res.error).toBeUndefined();
    const a = res.store.students[0];
    expect(a.currentWeight).toBe(62);
    expect(a.weightHistory[a.weightHistory.length - 1].weight).toBe(62);
  });

  it('sobrescribe el peso si ya hay registro de hoy', () => {
    const s = base();
    const primero = registerCurrentWeight(s, 'a1', 61);
    const res = registerCurrentWeight(primero.store, 'a1', 61.8);
    const a = res.store.students[0];
    expect(a.weightHistory).toHaveLength(1);
    expect(a.weightHistory[0].weight).toBe(61.8);
  });

  it('rechaza peso fuera de rango', () => {
    const s = base();
    const res = registerCurrentWeight(s, 'a1', 400);
    expect(res.error).toContain('peso');
  });
});

describe('registerHistoricalWeight', () => {
  it('agrega un registro histórico y actualiza el peso actual', () => {
    const s = base();
    const res = registerHistoricalWeight(s, 'a1', { date: '2026-07-01', weight: '58' });
    expect(res.error).toBeUndefined();
    const a = res.store.students[0];
    expect(a.currentWeight).toBe(58);
    expect(a.weightHistory.some((x) => x.date === '2026-07-01' && x.weight === 58)).toBe(true);
  });

  it('actualiza el registro si la fecha ya existe', () => {
    const s = base();
    s.students[0].weightHistory = [{ date: '2026-07-01', weight: 58 }];
    const res = registerHistoricalWeight(s, 'a1', { date: '2026-07-01', weight: '60' });
    const a = res.store.students[0];
    expect(a.weightHistory.filter((x) => x.date === '2026-07-01')).toHaveLength(1);
    expect(a.weightHistory[0].weight).toBe(60);
  });

  it('rechaza fecha vacía', () => {
    const s = base();
    const res = registerHistoricalWeight(s, 'a1', { date: '', weight: '60' });
    expect(res.error).toBeTruthy();
  });
});

describe('deleteWeightEntry', () => {
  it('elimina el registro y recalculca el peso actual', () => {
    const s = base();
    s.students[0].weightHistory = [
      { date: '2026-06-01', weight: 60 },
      { date: '2026-07-01', weight: 61 },
    ];
    const res = deleteWeightEntry(s, 'a1', '2026-07-01');
    const a = res.store.students[0];
    expect(a.weightHistory.map((x) => x.date)).toEqual(['2026-06-01']);
    expect(a.currentWeight).toBe(60);
  });
});

describe('toggleStudentActive', () => {
  it('relega el historial intacto', () => {
    const s = base();
    s.students[0].weightHistory = [{ date: '2026-06-01', weight: 60 }];
    const res = toggleStudentActive(s, 'a1');
    const a = res.store.students[0];
    expect(a.active).toBe(false);
    expect(a.weightHistory).toHaveLength(1);
  });
});
