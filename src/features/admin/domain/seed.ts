import type { Alumno, RayoStore } from '../domain/types';

export function uid(p: string): string {
  return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}

export function periodoActual(): string {
  return new Date().toISOString().slice(0, 7);
}

export function seed(): RayoStore {
  return {
    meta: { customized: false },
    horarios: [
      { id: 'h1', dia: 'Lunes', inicio: '19:00', fin: '21:00' },
      { id: 'h2', dia: 'Miércoles', inicio: '20:00', fin: '21:00' },
      { id: 'h3', dia: 'Jueves', inicio: '19:00', fin: '21:00' },
      { id: 'h4', dia: 'Viernes', inicio: '19:00', fin: '21:00' },
    ],
    planes: [
      {
        id: 'p1',
        nombre: 'Plan Recreativo',
        tipo: 'recreativo',
        precio: 18000,
        descripcion: 'Ideal para quienes quieren entrenar, moverse y aprender kick boxing sin presiones competitivas.',
        destacado: false,
        beneficios: [
          'Clases grupales de técnica y cardio',
          'Acceso a todas las sesiones recreativas',
          'Sin experiencia previa necesaria',
        ],
      },
      {
        id: 'p2',
        nombre: 'Plan Competitivo',
        tipo: 'competitivo',
        precio: 25000,
        descripcion: 'Para los que quieren prepararse para pelear y llevar su nivel al máximo.',
        destacado: true,
        beneficios: [
          'Todo lo del plan recreativo',
          'Entrenamiento específico de competencia',
          'Sparring supervisado',
          'Seguimiento personalizado del profe',
        ],
      },
    ],
    alumnos: [
      { id: 'a1', nombre: 'Ana', apellido: 'Gutiérrez', fechaNacimiento: '1995-03-14', telefono: '+54 9 11 5555-1122', dni: '37123456', fechaIngreso: '2025-02-03', pesoActual: 61.5, fotoCompetencia: null, planId: 'p1', activo: true, pesos: [{ fecha: '2025-02-03', peso: 64 }, { fecha: '2025-09-12', peso: 62.4 }, { fecha: '2026-08-14', peso: 61.5 }] },
      { id: 'a2', nombre: 'Lucas', apellido: 'Fernández', fechaNacimiento: '1998-07-22', telefono: '+54 9 11 4455-8890', dni: '38999887', fechaIngreso: '2024-06-10', pesoActual: 71, fotoCompetencia: null, planId: 'p2', activo: true, pesos: [{ fecha: '2024-06-10', peso: 73.2 }, { fecha: '2026-08-20', peso: 71 }] },
      { id: 'a3', nombre: 'Carla', apellido: 'Moreno', fechaNacimiento: '1990-11-02', telefono: '+54 9 11 3322-6677', dni: '30456778', fechaIngreso: '2023-09-05', pesoActual: 58, fotoCompetencia: null, planId: 'p1', activo: true, pesos: [{ fecha: '2023-09-05', peso: 60 }, { fecha: '2026-08-21', peso: 58 }] },
      { id: 'a4', nombre: 'Martín', apellido: 'Sosa', fechaNacimiento: '2001-01-30', telefono: '+54 9 11 6655-4433', dni: '42345671', fechaIngreso: '2026-03-16', pesoActual: 84, fotoCompetencia: null, planId: 'p2', activo: true, pesos: [{ fecha: '2026-03-16', peso: 86 }, { fecha: '2026-07-20', peso: 84 }] },
      { id: 'a5', nombre: 'Julieta', apellido: 'Ríos', fechaNacimiento: '1996-05-19', telefono: '+54 9 11 7788-9900', dni: '37564839', fechaIngreso: '2025-08-11', pesoActual: 65.5, fotoCompetencia: null, planId: 'p1', activo: true, pesos: [{ fecha: '2025-08-11', peso: 66.8 }, { fecha: '2026-08-18', peso: 65.5 }] },
      { id: 'a6', nombre: 'Diego', apellido: 'Ramírez', fechaNacimiento: '1988-09-08', telefono: '+54 9 11 2233-5566', dni: '32167845', fechaIngreso: '2024-03-04', pesoActual: 90, fotoCompetencia: null, planId: 'p1', activo: false, pesos: [{ fecha: '2024-03-04', peso: 90 }] },
    ],
    graduaciones: [
      { id: 'g1', alumnoId: 'a2', cinturon: 'Amarillo', fechaExamen: '2024-11-09', puntuacion: 8 },
      { id: 'g2', alumnoId: 'a2', cinturon: 'Naranja', fechaExamen: '2025-06-14', puntuacion: 8.5 },
      { id: 'g3', alumnoId: 'a2', cinturon: 'Verde', fechaExamen: '2026-03-21', puntuacion: 9 },
      { id: 'g4', alumnoId: 'a1', cinturon: 'Amarillo', fechaExamen: '2026-05-30', puntuacion: 7.5 },
      { id: 'g5', alumnoId: 'a3', cinturon: 'Naranja', fechaExamen: '2025-08-23', puntuacion: 8 },
      { id: 'g6', alumnoId: 'a4', cinturon: 'Amarillo', fechaExamen: '2026-06-27', puntuacion: 7 },
    ],
    cuotas: [
      { id: 'c1', alumnoId: 'a1', periodo: '2026-07', monto: 18000, fechaPago: '2026-07-03' },
      { id: 'c2', alumnoId: 'a1', periodo: '2026-08', monto: 18000, fechaPago: '2026-08-05' },
      { id: 'c3', alumnoId: 'a2', periodo: '2026-07', monto: 25000, fechaPago: '2026-07-08' },
      { id: 'c4', alumnoId: 'a3', periodo: '2026-08', monto: 18000, fechaPago: '2026-08-01' },
      { id: 'c5', alumnoId: 'a5', periodo: '2026-07', monto: 18000, fechaPago: '2026-07-15' },
      { id: 'c6', alumnoId: 'a4', periodo: '2026-07', monto: 25000, fechaPago: '2026-07-20' },
    ],
    jornadas: [
      { id: 'j1', fecha: '2026-08-18', horarioId: 'h1', presentes: ['a1', 'a2', 'a4', 'a5'] },
      { id: 'j2', fecha: '2026-08-20', horarioId: 'h3', presentes: ['a1', 'a3', 'a5'] },
      { id: 'j3', fecha: '2026-08-21', horarioId: 'h4', presentes: ['a2', 'a3', 'a4'] },
    ],
    eventos: [
      {
        id: 'e1',
        nombre: 'Copa Provincial de Kick Boxing',
        tipo: 'competencia',
        fecha: '2026-09-12',
        descripcion: 'Competencia provincial amateur. Pesaje por la mañana y combates desde el mediodía.',
        publico: true,
        participantes: [{ alumnoId: 'a2', pesoCompetencia: 70.5 }, { alumnoId: 'a4', pesoCompetencia: 83 }],
        peleas: [{ id: 'f1', alumnoId: 'a2', rival: 'Matías Torres', pesoRival: null, resultado: 'victoria' }],
      },
      {
        id: 'e2',
        nombre: 'Exhibición abierta en el barrio',
        tipo: 'exhibicion',
        fecha: '2026-09-05',
        descripcion: 'Exhibición de técnica y defensa personal en el polideportivo, entrada libre.',
        publico: true,
        participantes: [{ alumnoId: 'a1', pesoCompetencia: null }, { alumnoId: 'a3', pesoCompetencia: null }, { alumnoId: 'a5', pesoCompetencia: null }],
        peleas: [],
      },
      {
        id: 'e3',
        nombre: 'Examen de cinturones',
        tipo: 'taller',
        fecha: '2026-10-03',
        descripcion: 'Examen formal de graduación ante mesa evaluadora.',
        publico: false,
        participantes: [],
        peleas: [],
      },
    ],
  };
}

export function normalize(raw: unknown): RayoStore {
  const base = seed();
  if (!raw) return base;
  const d = raw as Partial<RayoStore>;
  const out: RayoStore = {
    meta: { customized: (d.meta && d.meta.customized) || false },
    horarios: d.horarios || base.horarios,
    planes: d.planes || base.planes,
    alumnos: d.alumnos || base.alumnos,
    graduaciones: d.graduaciones || base.graduaciones,
    cuotas: d.cuotas || base.cuotas,
    jornadas: d.jornadas || base.jornadas,
    eventos: d.eventos || base.eventos,
  };
  (out.alumnos || []).forEach((a: Alumno) => {
    if (typeof a.apellido === 'undefined') {
      const n = String(a.nombre || '').trim();
      const i = n.indexOf(' ');
      if (i > 0) {
        a.apellido = n.slice(i + 1);
        a.nombre = n.slice(0, i);
      } else {
        a.apellido = '';
      }
    }
    if (!Array.isArray(a.pesos)) {
      a.pesos = a.pesoActual != null && !isNaN(Number(a.pesoActual)) ? [{ fecha: a.fechaIngreso || hoy(), peso: Number(a.pesoActual) }] : [];
    }
  });
  return out;
}
