export const inputCls =
  'w-full px-4 py-3 bg-pulso-input border border-pulso-line rounded-xl text-foreground focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20 transition-colors text-sm';
export const selectCls = inputCls + ' appearance-none';

export const tipoBtn: Record<string, string> = {
  competencia: 'bg-pulso-indigo/16 text-pulso-indigo-soft border-pulso-indigo/32',
  exhibicion: 'bg-pulso-red/16 text-pulso-red border-pulso-red/32',
  taller: 'bg-amber-500/14 text-amber-400 border-amber-500/30',
};