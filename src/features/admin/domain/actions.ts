import type {
  Alumno,
  Cuota,
  Evento,
  Graduacion,
  Jornada,
  Pelea,
  PeleaResultado,
  Plan,
  RayoStore,
} from '../domain/types';
import { uid, hoy } from '../domain/seed';

export interface ActionResult {
  store: RayoStore;
  error?: string;
  info?: string;
  fieldErrors?: Record<string, string>;
}

function ok(store: RayoStore, info?: string): ActionResult {
  return info ? { store, info } : { store };
}

function err(store: RayoStore, error: string, fieldErrors?: Record<string, string>): ActionResult {
  return fieldErrors ? { store, error, fieldErrors } : { store, error };
}

export function registrarPago(
  d: RayoStore,
  input: { alumnoId: string; periodo: string; monto: string | number; fechaPago: string }
): ActionResult {
  if (!input.alumnoId) return err(d, 'Elegí el alumno que paga.');
  if (!input.periodo) return err(d, 'Indicá el período (mes y año).');
  const monto = Number(input.monto);
  if (input.monto === '' || isNaN(monto) || monto <= 0) return err(d, 'Indicá un monto válido.');
  if (!input.fechaPago) return err(d, 'Indicá la fecha de pago.');

  let info: string | undefined;
  if (d.cuotas.some((c) => c.alumnoId === input.alumnoId && c.periodo === input.periodo)) {
    info = 'Este alumno ya pagó ese período. Si seguís, se registrará otro pago.';
  }

  const cuota: Cuota = {
    id: uid('c'),
    alumnoId: input.alumnoId,
    periodo: input.periodo,
    monto,
    fechaPago: input.fechaPago,
  };
  return ok({ ...d, cuotas: [...d.cuotas, cuota] }, info);
}

export function eliminarPago(d: RayoStore, cuotaId: string): ActionResult {
  return ok({ ...d, cuotas: d.cuotas.filter((c) => c.id !== cuotaId) });
}

export function toggleAlumnoActivo(d: RayoStore, alumnoId: string): ActionResult {
  const alumno = d.alumnos.find((a) => a.id === alumnoId);
  if (!alumno) return err(d, 'Alumno no encontrado.');
  const next = d.alumnos.map((a) => (a.id === alumnoId ? { ...a, activo: !a.activo } : a));
  const wasActive = alumno.activo;
  return ok(
    { ...d, alumnos: next },
    wasActive ? 'Alumno desactivado. Su historial se conserva.' : 'Alumno reactivado.'
  );
}

export function guardarAsistencia(d: RayoStore, jornadaId: string, presentes: string[]): ActionResult {
  const j = d.jornadas.find((x) => x.id === jornadaId);
  if (!j) return err(d, 'Jornada no encontrada.');
  const activos = d.alumnos.filter((a) => a.activo).length;
  const aus = activos - presentes.length;
  const next = d.jornadas.map((x) => (x.id === jornadaId ? { ...x, presentes } : x));
  return ok({ ...d, jornadas: next }, `Jornada guardada: ${presentes.length} presentes · ${aus} ausentes.`);
}

export function crearJornada(d: RayoStore, fecha: string, horarioId: string): ActionResult {
  if (!fecha) return err(d, 'Indicá la fecha de la jornada.');
  if (d.jornadas.some((j) => j.fecha === fecha)) return err(d, 'Ya existe una jornada abierta para esa fecha.');
  const jornada: Jornada = { id: uid('j'), fecha, horarioId: horarioId || null, presentes: [] };
  return ok({ ...d, jornadas: [...d.jornadas, jornada] });
}

export function eliminarJornada(d: RayoStore, jornadaId: string): ActionResult {
  return ok({ ...d, jornadas: d.jornadas.filter((x) => x.id !== jornadaId) });
}

export function registrarGraduacion(
  d: RayoStore,
  input: { alumnoId: string; cinturon: string; fechaExamen: string; puntuacion: number | string }
): ActionResult {
  const fechaHoy = hoy();
  const pts = Number(input.puntuacion);
  if (!input.fechaExamen) return err(d, 'Indicá la fecha del examen.');
  if (input.fechaExamen > fechaHoy) return err(d, 'La fecha no puede ser futura.');
  if (input.puntuacion === '' || isNaN(pts) || pts < 0 || pts > 10) return err(d, 'Puntuación entre 0 y 10.');
  if (!d.alumnos.some((a) => a.id === input.alumnoId)) return err(d, 'Alumno no encontrado.');
  const grad: Graduacion = {
    id: uid('g'),
    alumnoId: input.alumnoId,
    cinturon: input.cinturon,
    fechaExamen: input.fechaExamen,
    puntuacion: pts,
  };
  return ok({ ...d, graduaciones: [...d.graduaciones, grad] });
}

export function registrarPesoActual(d: RayoStore, alumnoId: string, peso: number | string): ActionResult {
  const pesoNum = Number(peso);
  if (peso === '' || isNaN(pesoNum) || pesoNum < 20 || pesoNum > 250) {
    return err(d, 'Ingresá un peso válido (20-250 kg).');
  }
  const next = d.alumnos.map((al) => {
    if (al.id !== alumnoId) return al;
    const pesos = al.pesos ? [...al.pesos] : [];
    const last = pesos[pesos.length - 1];
    if (last && last.fecha === hoy()) last.peso = pesoNum;
    else pesos.push({ fecha: hoy(), peso: pesoNum });
    return { ...al, pesoActual: pesoNum, pesos };
  });
  return ok({ ...d, alumnos: next });
}

export function registrarPesoHistorico(
  d: RayoStore,
  alumnoId: string,
  input: { fecha: string; peso: string | number }
): ActionResult {
  const pesoNum = Number(input.peso);
  if (!input.fecha) return err(d, 'Seleccioná una fecha.');
  if (input.peso === '' || isNaN(pesoNum) || pesoNum < 20 || pesoNum > 250) {
    return err(d, 'Ingresá un peso válido (20-250 kg).');
  }
  const next = d.alumnos.map((al) => {
    if (al.id !== alumnoId) return al;
    const pesos = al.pesos ? [...al.pesos] : [];
    const existIdx = pesos.findIndex((x) => x.fecha === input.fecha);
    const updated = existIdx > -1 ? pesos.map((x, i) => (i === existIdx ? { ...x, peso: pesoNum } : x)) : [...pesos, { fecha: input.fecha, peso: pesoNum }];
    return { ...al, pesoActual: pesoNum, pesos: updated };
  });
  return ok({ ...d, alumnos: next });
}

export function eliminarRegistroPeso(d: RayoStore, alumnoId: string, fecha: string): ActionResult {
  const next = d.alumnos.map((al) => {
    if (al.id !== alumnoId) return al;
    const pesos = (al.pesos || []).filter((x) => x.fecha !== fecha);
    return { ...al, pesos, pesoActual: pesos.length ? pesos[pesos.length - 1].peso : al.pesoActual };
  });
  return ok({ ...d, alumnos: next });
}

export function crearActualizarEvento(
  d: RayoStore,
  input: {
    id?: string;
    nombre: string;
    tipo: Evento['tipo'];
    fecha: string;
    descripcion: string;
    publico: boolean;
  }
): ActionResult {
  if (!input.nombre.trim()) return err(d, 'Poné un nombre al evento.');
  if (!input.fecha) return err(d, 'Indicá una fecha.');
  if (input.id && d.eventos.some((e) => e.id === input.id)) {
    const eventos = d.eventos.map((e) =>
      e.id === input.id
        ? { ...e, nombre: input.nombre.trim(), tipo: input.tipo, fecha: input.fecha, descripcion: input.descripcion.trim(), publico: input.publico }
        : e
    );
    return ok({ ...d, eventos }, 'Evento actualizado.');
  }
  const nuevo: Evento = {
    id: uid('e'),
    nombre: input.nombre.trim(),
    tipo: input.tipo,
    fecha: input.fecha,
    descripcion: input.descripcion.trim(),
    publico: input.publico,
    participantes: [],
    peleas: [],
  };
  return ok({ ...d, eventos: [...d.eventos, nuevo] }, 'Evento creado.');
}

export function toggleEventoPublico(d: RayoStore, eventoId: string): ActionResult {
  const e = d.eventos.find((x) => x.id === eventoId);
  if (!e) return err(d, 'Evento no encontrado.');
  const eventos = d.eventos.map((x) => (x.id === eventoId ? { ...x, publico: !x.publico } : x));
  return ok({ ...d, eventos }, e.publico ? 'Evento quedó oculto.' : 'Evento ahora es público.');
}

export function eliminarEvento(d: RayoStore, eventoId: string): ActionResult {
  return ok({ ...d, eventos: d.eventos.filter((x) => x.id !== eventoId) });
}

export function agregarParticipante(
  d: RayoStore,
  eventoId: string,
  input: { alumnoId: string; pesoCompetencia: string | number | null }
): ActionResult {
  const evento = d.eventos.find((e) => e.id === eventoId);
  if (!evento) return err(d, 'Evento no encontrado.');
  if (!input.alumnoId) return err(d, 'Elegí un alumno.');
  if (evento.participantes.some((p) => p.alumnoId === input.alumnoId)) return err(d, 'Ese alumno ya está en el evento.');
  let pesoNum: number | null = null;
  if (evento.tipo === 'competencia') {
    pesoNum = Number(input.pesoCompetencia);
    if (input.pesoCompetencia === '' || isNaN(pesoNum) || pesoNum < 20 || pesoNum > 250) {
      return err(d, 'Indicá el peso de competencia (20-250 kg).');
    }
  }
  const participantes = [...evento.participantes, { alumnoId: input.alumnoId, pesoCompetencia: pesoNum }];
  const eventos = d.eventos.map((e) => (e.id === eventoId ? { ...e, participantes } : e));
  return ok({ ...d, eventos }, 'Participante agregado.');
}

export function quitarParticipante(d: RayoStore, eventoId: string, alumnoId: string): ActionResult {
  const eventos = d.eventos.map((e) =>
    e.id === eventoId
      ? {
          ...e,
          participantes: e.participantes.filter((p) => p.alumnoId !== alumnoId),
          peleas: e.peleas.filter((f) => f.alumnoId !== alumnoId),
        }
      : e
  );
  return ok({ ...d, eventos }, 'Participante quitado. Sus peleas también se eliminaron.');
}

export function agregarPelea(
  d: RayoStore,
  eventoId: string,
  input: { alumnoId: string; rival: string; pesoRival: string | number | null }
): ActionResult {
  const evento = d.eventos.find((e) => e.id === eventoId);
  if (!evento) return err(d, 'Evento no encontrado.');
  if (!input.alumnoId || !input.rival.trim()) return err(d, 'Elegí un alumno del equipo y escribí el rival.');
  let pesoNum: number | null = null;
  if (input.pesoRival !== '' && input.pesoRival != null) {
    pesoNum = Number(input.pesoRival);
    if (isNaN(pesoNum) || pesoNum < 20 || pesoNum > 250) return err(d, 'Peso del rival fuera de rango (20-250 kg).');
  }
  const pelea: Pelea = {
    id: uid('f'),
    alumnoId: input.alumnoId,
    rival: input.rival.trim(),
    pesoRival: pesoNum,
    resultado: 'pendiente',
  };
  const eventos = d.eventos.map((e) => (e.id === eventoId ? { ...e, peleas: [...e.peleas, pelea] } : e));
  return ok({ ...d, eventos }, 'Pelea cargada.');
}

export function setPeleaResultado(
  d: RayoStore,
  eventoId: string,
  peleaId: string,
  resultado: PeleaResultado
): ActionResult {
  const eventos = d.eventos.map((e) =>
    e.id === eventoId ? { ...e, peleas: e.peleas.map((f) => (f.id === peleaId ? { ...f, resultado } : f)) } : e
  );
  const msg =
    resultado === 'pendiente' ? 'Pelea marcada como pendiente.' : resultado === 'victoria' ? 'Resultado: victoria.' : 'Resultado: derrota.';
  return ok({ ...d, eventos }, msg);
}

export function quitarPelea(d: RayoStore, eventoId: string, peleaId: string): ActionResult {
  const eventos = d.eventos.map((e) => (e.id === eventoId ? { ...e, peleas: e.peleas.filter((f) => f.id !== peleaId) } : e));
  return ok({ ...d, eventos }, 'Pelea eliminada.');
}

export function guardarAlumno(
  d: RayoStore,
  input: {
    id?: string;
    nombre: string;
    apellido: string;
    dni: string;
    fechaNacimiento: string;
    telefono: string;
    fechaIngreso: string;
    planId: string | null;
    pesoActual: number | null;
    fotoCompetencia: string | null;
  }
): { result: ActionResult; exists?: Alumno } {
  const errors: Record<string, string> = {};
  if (input.nombre.trim().length < 2) errors.nombre = 'Ingresá el nombre.';
  if (input.apellido.trim().length < 2) errors.apellido = 'Ingresá el apellido.';
  const dniClean = input.dni.replace(/\D/g, '');
  if (dniClean.length < 7) errors.dni = 'El DNI necesita al menos 7 números.';
  else if (d.alumnos.some((x) => x.dni === dniClean && x.id !== input.id)) errors.dni = 'Ya existe un alumno con ese DNI.';
  if (!input.fechaNacimiento) errors.nac = 'Seleccioná la fecha de nacimiento.';
  if (!input.fechaIngreso) errors.ingreso = 'Indicá la fecha de ingreso.';
  else if (input.fechaNacimiento && input.fechaIngreso <= input.fechaNacimiento) errors.ingreso = 'El ingreso debe ser posterior al nacimiento.';
  if (input.pesoActual != null && (input.pesoActual < 20 || input.pesoActual > 250)) errors.peso = 'Peso fuera de rango.';

  if (Object.keys(errors).length > 0) {
    return { result: err(d, 'Revisá los campos marcados.', errors) };
  }

  const data = {
    nombre: input.nombre.trim(),
    apellido: input.apellido.trim(),
    dni: dniClean,
    fechaNacimiento: input.fechaNacimiento,
    telefono: input.telefono.trim(),
    fechaIngreso: input.fechaIngreso,
    pesoActual: input.pesoActual,
    fotoCompetencia: input.fotoCompetencia,
  };

  if (input.id && d.alumnos.some((a) => a.id === input.id)) {
    const updated = d.alumnos.map((a) => (a.id === input.id ? { ...a, ...data } : a));
    return { result: ok({ ...d, alumnos: updated }, 'Datos actualizados.') };
  }
  const planId = input.planId || null;
  const nuevo: Alumno = {
    id: uid('a'),
    ...data,
    planId,
    activo: true,
    pesos: data.pesoActual != null ? [{ fecha: data.fechaIngreso, peso: data.pesoActual }] : [],
  };
  return { result: ok({ ...d, alumnos: [...d.alumnos, nuevo] }, 'Alumno registrado.'), exists: nuevo };
}

export function crearActualizarPlan(
  d: RayoStore,
  input: Plan
): ActionResult {
  if (!input.nombre.trim() || input.precio <= 0) return err(d, 'Nombre y precio válidos.');
  const cleaned: Plan = {
    ...input,
    nombre: input.nombre.trim(),
    descripcion: input.descripcion.trim(),
    beneficios: input.beneficios.map((b) => b.trim()).filter(Boolean),
  };
  if (d.planes.some((p) => p.id === cleaned.id)) {
    return ok({ ...d, planes: d.planes.map((p) => (p.id === cleaned.id ? cleaned : p)) }, `${cleaned.nombre} actualizado.`);
  }
  return ok({ ...d, planes: [...d.planes, cleaned] }, `${cleaned.nombre} creado.`);
}

function ordenarHorarios(horarios: RayoStore['horarios']): RayoStore['horarios'] {
  const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return horarios.slice().sort((a, b) => {
    const ia = DIAS.indexOf(a.dia);
    const ib = DIAS.indexOf(b.dia);
    if (ia !== ib) return ia - ib;
    return a.inicio < b.inicio ? -1 : 1;
  });
}

export function crearActualizarHorario(
  d: RayoStore,
  input: { id?: string; dia: string; inicio: string; fin: string }
): ActionResult {
  if (!input.dia || !input.inicio || !input.fin) return err(d, 'Completá día y horario.');
  if (input.inicio >= input.fin) return err(d, 'La hora de fin debe ser después del inicio.');
  if (input.id && d.horarios.some((h) => h.id === input.id)) {
    const next = ordenarHorarios(d.horarios.map((h) => (h.id === input.id ? { ...h, ...input } : h)));
    return ok({ ...d, horarios: next }, 'Horario actualizado.');
  }
  const next = ordenarHorarios([...d.horarios, { id: uid('h'), ...input }]);
  return ok({ ...d, horarios: next }, 'Horario agregado.');
}

export function eliminarHorario(d: RayoStore, horarioId: string): ActionResult {
  const usos = d.jornadas.filter((j) => j.horarioId === horarioId).length;
  const info = usos ? ` Se desvinculó de ${usos} jornada${usos === 1 ? '' : 's'}.` : '';
  return ok(
    { ...d, horarios: d.horarios.filter((x) => x.id !== horarioId), jornadas: d.jornadas.map((j) => (j.horarioId === horarioId ? { ...j, horarioId: null } : j)) },
    `Horario eliminado.${info}`
  );
}
