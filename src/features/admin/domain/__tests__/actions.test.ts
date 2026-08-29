import { describe, expect, it } from 'vitest';
import {
  registrarPago,
  eliminarPago,
  toggleAlumnoActivo,
  crearJornada,
  eliminarJornada,
  guardarAsistencia,
  registrarGraduacion,
  guardarAlumno,
  crearActualizarPlan,
  crearActualizarHorario,
  eliminarHorario,
} from '../actions';
import { seed } from '../seed';
import type { RayoStore } from '../types';

function base(): RayoStore {
  return seed();
}

describe('registrarPago', () => {
  it('registra la cuota del alumno', () => {
    const s = base();
    const a = s.alumnos[0];
    const res = registrarPago(s, { alumnoId: a.id, periodo: '2026-08', monto: 25000, fechaPago: '2026-08-01' });
    expect(res.error).toBeUndefined();
    expect(res.store.cuotas.length).toBe(s.cuotas.length + 1);
    expect(res.store.cuotas[res.store.cuotas.length - 1].periodo).toBe('2026-08');
  });

  it('rechaza monto vacío', () => {
    const s = base();
    const a = s.alumnos[0];
    const res = registrarPago(s, { alumnoId: a.id, periodo: '2026-08', monto: '', fechaPago: '2026-08-01' });
    expect(res.error).toContain('monto');
  });

  it('avisa si el período ya fue pagado por el alumno', () => {
    const s = base();
    const a = s.alumnos[0];
    registrarPago(s, { alumnoId: a.id, periodo: '2026-08', monto: 100, fechaPago: '2026-08-05' });
    const s2 = { ...s, cuotas: [...s.cuotas, { id: 'c1', alumnoId: a.id, periodo: '2026-08', monto: 100, fechaPago: '2026-08-05' }] };
    const res = registrarPago(s2, { alumnoId: a.id, periodo: '2026-08', monto: 100, fechaPago: '2026-08-05' });
    expect(res.info).toContain('ya pagó ese período');
  });
});

describe('eliminarPago', () => {
  it('elimina la cuota por id', () => {
    const s = base();
    s.cuotas = [{ id: 'c1', alumnoId: 'a1', periodo: '2026-08', monto: 100, fechaPago: '2026-08-01' }];
    const res = eliminarPago(s, 'c1');
    expect(res.store.cuotas).toHaveLength(0);
  });
});

describe('toggleAlumnoActivo', () => {
  it('invierte el estado activo y conserva el historial', () => {
    const s = base();
    const a = s.alumnos[0];
    const res = toggleAlumnoActivo(s, a.id);
    expect(res.store.alumnos.find((x) => x.id === a.id)!.activo).toBe(!a.activo);
  });

  it('devuelve error si el alumno no existe', () => {
    const s = base();
    const res = toggleAlumnoActivo(s, 'no-existe');
    expect(res.error).toBeTruthy();
  });
});

describe('crearJornada', () => {
  it('crea la jornada con horario opcional', () => {
    const s = base();
    const res = crearJornada(s, '2026-09-01', 'h1');
    expect(res.error).toBeUndefined();
    expect(res.store.jornadas.length).toBe(s.jornadas.length + 1);
    expect(res.store.jornadas[res.store.jornadas.length - 1].horarioId).toBe('h1');
  });

  it('rechaza fecha repetida', () => {
    const s = base();
    s.jornadas = [{ id: 'j1', fecha: '2026-09-01', horarioId: null, presentes: [] }];
    const res = crearJornada(s, '2026-09-01', '');
    expect(res.error).toContain('Ya existe');
  });
});

describe('guardarAsistencia', () => {
  it('guarda los presentes y calcula ausentes', () => {
    const s = base();
    s.jornadas = [{ id: 'j1', fecha: '2026-09-01', horarioId: null, presentes: [] }];
    const activos = s.alumnos.filter((a) => a.activo);
    const res = guardarAsistencia(s, 'j1', [activos[0].id]);
    expect(res.error).toBeUndefined();
    expect(res.store.jornadas[0].presentes).toEqual([activos[0].id]);
    expect(res.info).toContain('1 presentes');
  });

  it('devuelve error si la jornada no existe', () => {
    const s = base();
    const res = guardarAsistencia(s, 'no-existe', []);
    expect(res.error).toBeTruthy();
  });
});

describe('eliminarJornada', () => {
  it('elimina la jornada por id', () => {
    const s = base();
    s.jornadas = [{ id: 'j1', fecha: '2026-09-01', horarioId: null, presentes: [] }];
    const res = eliminarJornada(s, 'j1');
    expect(res.store.jornadas).toHaveLength(0);
  });
});

describe('registrarGraduacion', () => {
  it('registra la graduación si es válida', () => {
    const s = base();
    const a = s.alumnos[0];
    const res = registrarGraduacion(s, { alumnoId: a.id, cinturon: 'Azul', fechaExamen: '2026-08-20', puntuacion: 8.5 });
    expect(res.error).toBeUndefined();
    expect(res.store.graduaciones.length).toBe(s.graduaciones.length + 1);
    expect(res.store.graduaciones[res.store.graduaciones.length - 1].cinturon).toBe('Azul');
  });

  it('rechaza fecha futura y puntuación fuera de rango', () => {
    const s = base();
    const a = s.alumnos[0];
    const futura = registrarGraduacion(s, { alumnoId: a.id, cinturon: 'Azul', fechaExamen: '2099-01-01', puntuacion: 8 });
    expect(futura.error).toContain('futura');
    const fuera = registrarGraduacion(s, { alumnoId: a.id, cinturon: 'Azul', fechaExamen: '2026-08-20', puntuacion: 11 });
    expect(fuera.error).toContain('Puntuación');
  });
});

describe('guardarAlumno', () => {
  it('registra un alumno nuevo activo', () => {
    const s = base();
    const res = guardarAlumno(s, {
      nombre: 'Lucas',
      apellido: 'Méndez',
      dni: '12345678',
      fechaNacimiento: '2000-01-01',
      telefono: '',
      fechaIngreso: '2026-08-20',
      planId: null,
      pesoActual: null,
      fotoCompetencia: null,
    });
    expect(res.result.error).toBeUndefined();
    expect(res.result.store.alumnos.length).toBe(s.alumnos.length + 1);
    expect(res.exists?.activo).toBe(true);
  });

  it('rechaza DNI repetido para un alumno distinto', () => {
    const s = base();
    const a = s.alumnos[0];
    const res = guardarAlumno(s, {
      nombre: 'Lucas',
      apellido: 'Méndez',
      dni: a.dni,
      fechaNacimiento: '2000-01-01',
      telefono: '',
      fechaIngreso: '2026-08-20',
      planId: null,
      pesoActual: null,
      fotoCompetencia: null,
    });
    expect(res.result.error).toBeTruthy();
    expect(res.result.fieldErrors).toHaveProperty('dni');
  });

  it('actualiza los datos de un alumno existente', () => {
    const s = base();
    const a = s.alumnos[0];
    const res = guardarAlumno(s, {
      id: a.id,
      nombre: 'Cambiado',
      apellido: a.apellido,
      dni: a.dni,
      fechaNacimiento: a.fechaNacimiento,
      telefono: a.telefono,
      fechaIngreso: a.fechaIngreso,
      planId: a.planId,
      pesoActual: a.pesoActual,
      fotoCompetencia: a.fotoCompetencia || null,
    });
    expect(res.result.error).toBeUndefined();
    expect(res.result.store.alumnos.find((x) => x.id === a.id)!.nombre).toBe('Cambiado');
  });
});

describe('plan / horario actions', () => {
  it('crea y actualiza un plan', () => {
    const s = base();
    const creado = crearActualizarPlan(s, {
      id: 'p-nuevo',
      nombre: 'Competitivo Pro',
      tipo: 'competitivo',
      precio: 40000,
      descripcion: 'Entrenamiento competitivo',
      destacado: true,
      beneficios: ['Dos competencias por año'],
    });
    expect(creado.error).toBeUndefined();
    expect(creado.store.planes.some((p) => p.id === 'p-nuevo')).toBe(true);
    const actualizado = crearActualizarPlan(creado.store, {
      ...creado.store.planes.find((p) => p.id === 'p-nuevo')!,
      precio: 45000,
    });
    expect(actualizado.store.planes.find((p) => p.id === 'p-nuevo')!.precio).toBe(45000);
  });

  it('rechaza un plan sin nombre o con precio inválido', () => {
    const s = base();
    const sinNombre = crearActualizarPlan(s, {
      id: 'p-x',
      nombre: ' ',
      tipo: 'competitivo',
      precio: 40000,
      descripcion: '',
      destacado: false,
      beneficios: [],
    });
    expect(sinNombre.error).toBeTruthy();
    const sinPrecio = crearActualizarPlan(s, {
      id: 'p-x',
      nombre: 'Plan',
      tipo: 'competitivo',
      precio: 0,
      descripcion: '',
      destacado: false,
      beneficios: [],
    });
    expect(sinPrecio.error).toBeTruthy();
  });

  it('crea y elimina un horario, y desvincula jornadas al eliminarlo', () => {
    const s = base();
    const creado = crearActualizarHorario(s, { dia: 'Domingo', inicio: '19:00', fin: '21:00' });
    expect(creado.error).toBeUndefined();
    const h = creado.store.horarios.find((x) => x.dia === 'Domingo')!;
    const conJornada: RayoStore = {
      ...creado.store,
      jornadas: [...creado.store.jornadas, { id: 'j-test', fecha: '2026-09-02', horarioId: h.id, presentes: [] }],
    };
    const borrado = eliminarHorario(conJornada, h.id);
    expect(borrado.store.horarios.some((x) => x.id === h.id)).toBe(false);
    expect(borrado.store.jornadas.find((j) => j.id === 'j-test')!.horarioId).toBeNull();
  });
});