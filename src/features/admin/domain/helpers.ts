import type { Alumno, Jornada, Plan, RayoStore } from './types';

export function fullName(a?: Alumno | null): string {
  return (((a && a.nombre) || '') + ' ' + ((a && a.apellido) || '')).trim();
}

export function currentBelt(d: RayoStore, alumnoId: string): string {
  const gs = (d.graduaciones || [])
    .filter((g) => g.alumnoId === alumnoId)
    .sort((a, b) => (a.fechaExamen < b.fechaExamen ? 1 : -1));
  return gs.length ? gs[0].cinturon : 'Blanco';
}

export function planDe(d: RayoStore, alumnoId: string | null): Plan | null {
  const a = (d.alumnos || []).find((x) => x.id === alumnoId);
  return a && a.planId ? (d.planes || []).find((p) => p.id === a.planId) || null : null;
}

export function pendientesPeriodo(d: RayoStore, periodo: string): Alumno[] {
  return (d.alumnos || []).filter(
    (a) => a.activo && a.planId && !(d.cuotas || []).some((c) => c.alumnoId === a.id && c.periodo === periodo)
  );
}

export function ausentesDe(d: RayoStore, jornada: Jornada): Alumno[] {
  const activos = (d.alumnos || []).filter((a) => a.activo);
  return activos.filter((a) => jornada.presentes.indexOf(a.id) === -1);
}
