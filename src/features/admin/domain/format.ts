export function fmtFecha(iso: string): string {
  if (!iso) return '';
  try {
    const dt = new Date(iso + 'T12:00:00');
    return dt.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export const fmtDate = fmtFecha;

export function fmtFechaLarga(iso: string): string {
  if (!iso) return '';
  try {
    const dt = new Date(iso + 'T12:00:00');
    return dt.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  } catch {
    return iso;
  }
}

export function periodoLabel(p: string): string {
  try {
    const parts = p.split('-');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, 1).toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return p;
  }
}

export function fmtMoney(n: number): string {
  return '$' + Number(n || 0).toLocaleString('es-AR');
}

function toNum(n: number | string): number {
  const v = typeof n === 'string' ? Number(n) : n;
  return Number.isFinite(v) ? v : 0;
}

export function fmtNum(n: number | string): string {
  return String(toNum(n)).replace('.', ',');
}

export function fmtPeso(n: number | string | null | undefined): string {
  if (n == null || n === '') return '';
  return fmtNum(n) + ' kg';
}
