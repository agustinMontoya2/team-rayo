export type TipoPlan = 'recreativo' | 'competitivo';
export type TipoEvento = 'competencia' | 'exhibicion' | 'taller';
export type PeleaResultado = 'pendiente' | 'victoria' | 'derrota';

export interface Horario {
  id: string;
  dia: string;
  inicio: string;
  fin: string;
}

export interface Plan {
  id: string;
  nombre: string;
  tipo: TipoPlan;
  precio: number;
  descripcion: string;
  destacado: boolean;
  beneficios: string[];
}

export interface PesoRegistro {
  fecha: string;
  peso: number;
}

export interface Alumno {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string;
  dni: string;
  fechaIngreso: string;
  pesoActual: number | null;
  fotoCompetencia: string | null;
  planId: string | null;
  activo: boolean;
  pesos: PesoRegistro[];
}

export interface Graduacion {
  id: string;
  alumnoId: string;
  cinturon: string;
  fechaExamen: string;
  puntuacion: number;
}

export interface Cuota {
  id: string;
  alumnoId: string;
  periodo: string;
  monto: number;
  fechaPago: string;
}

export interface Jornada {
  id: string;
  fecha: string;
  horarioId: string | null;
  presentes: string[];
}

export interface Participante {
  alumnoId: string;
  pesoCompetencia: number | null;
}

export interface Pelea {
  id: string;
  alumnoId: string;
  rival: string;
  pesoRival: number | null;
  resultado: PeleaResultado;
}

export interface Evento {
  id: string;
  nombre: string;
  tipo: TipoEvento;
  fecha: string;
  descripcion: string;
  publico: boolean;
  participantes: Participante[];
  peleas: Pelea[];
}

export interface RayoStore {
  meta: { customized: boolean };
  horarios: Horario[];
  planes: Plan[];
  alumnos: Alumno[];
  graduaciones: Graduacion[];
  cuotas: Cuota[];
  jornadas: Jornada[];
  eventos: Evento[];
}

export const BELT_ORDER = ['Blanco', 'Amarillo', 'Naranja', 'Verde', 'Azul', 'Marrón', 'Negro'];
export const BELT_COLORS: Record<string, string> = {
  Blanco: '#e2e8f0',
  Amarillo: '#facc15',
  Naranja: '#fb923c',
  Verde: '#34d399',
  Azul: '#60a5fa',
  Marrón: '#b45309',
  Negro: '#0f172a',
};
