import { describe, expect, it } from 'vitest';
import { fullName, currentBelt, planDe, pendientesPeriodo, ausentesDe } from '../helpers';
import { seed } from '../seed';
import type { RayoStore } from '../types';

function base(): RayoStore {
  const s = seed();
  return s;
}

describe('fullName', () => {
  it('combina nombre y apellido', () => {
    expect(fullName({ nombre: 'Ana', apellido: 'Pérez' } as any)).toBe('Ana Pérez');
  });

  it('maneja nulos', () => {
    expect(fullName(null)).toBe('');
  });
});

describe('currentBelt', () => {
  it('devuelve Blanco si no hay graduaciones', () => {
    const s = base();
    expect(currentBelt(s, 'alumno-x')).toBe('Blanco');
  });

  it('devuelve el cinturón de la graduación más reciente', () => {
    const s = base();
    s.graduaciones = [
      { id: 'g1', alumnoId: 'a1', cinturon: 'Blanco', fechaExamen: '2025-01-10', puntuacion: 8 },
      { id: 'g2', alumnoId: 'a1', cinturon: 'Azul', fechaExamen: '2026-06-01', puntuacion: 9 },
    ];
    expect(currentBelt(s, 'a1')).toBe('Azul');
  });
});

describe('planDe', () => {
  it('devuelve null si el alumno no tiene plan', () => {
    const s = base();
    const a = s.alumnos.find((x) => !x.planId);
    expect(planDe(s, a ? a.id : 'nope')).toBeNull();
  });
});

describe('pendientesPeriodo', () => {
  it('listas alumnos activos con plan que no pagaron el periodo', () => {
    const s = base();
    const a = s.alumnos.find((x) => x.activo && x.planId) ?? s.alumnos[0];
    s.cuotas = [];
    const result = pendientesPeriodo(s, '2026-08');
    expect(result.some((x) => x.id === a.id)).toBe(true);
  });

  it('excluye alumnos inactivos y sin plan', () => {
    const s = base();
    s.alumnos = s.alumnos.map((a, i) => (i === 0 ? { ...a, activo: false, planId: null } : a));
    s.cuotas = [];
    const result = pendientesPeriodo(s, '2026-08');
    expect(result.every((x) => x.activo && x.planId)).toBe(true);
  });
});

describe('ausentesDe', () => {
  it('los activos que no están en presentes son ausentes', () => {
    const s = base();
    const activos = s.alumnos.filter((a) => a.activo);
    const primera = activos[0];
    const aus = ausentesDe(s, { id: 'j1', fecha: '2026-08-28', horarioId: null, presentes: [primera.id] });
    expect(aus.length).toBe(activos.length - 1);
    expect(aus.some((x) => x.id === primera.id)).toBe(false);
  });
});