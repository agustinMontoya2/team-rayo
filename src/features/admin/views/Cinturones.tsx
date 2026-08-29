import { useMemo, useState } from 'react';
import { useStore, fullName, currentBelt, fmtDate, hoy, fmtNum, BELT_ORDER, BELT_COLORS, registrarGraduacion } from '../store';
import { useToast, BeltBadge } from '../ui-kit';
import { Check } from 'lucide-react';

const inputSelCls =
  'w-full px-4 py-3 bg-pulso-input border border-pulso-line rounded-xl text-foreground focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20 transition-colors text-sm appearance-none';

export function Cinturones() {
  const { store, setStore } = useStore();
  const toast = useToast();

  const [sel, setSel] = useState<string>(store.alumnos[0] ? store.alumnos[0].id : '');
  const [gAlumno, setGAlumno] = useState<string>(store.alumnos[0] ? store.alumnos[0].id : '');
  const [gBelt, setGBelt] = useState<string>(BELT_ORDER[0]);
  const [gFecha, setGFecha] = useState(hoy());
  const [gPts, setGPts] = useState<number | string>('');

  const alum = sel ? store.alumnos.find((x) => x.id === sel) : null;
  const grados = useMemo(
    () =>
      sel
        ? store.graduaciones
            .filter((x) => x.alumnoId === sel)
            .sort((a, b) => (a.fechaExamen < b.fechaExamen ? 1 : -1))
        : [],
    [store, sel]
  );

  const registrar = (e: React.FormEvent) => {
    e.preventDefault();
    const res = registrarGraduacion(store, {
      alumnoId: gAlumno,
      cinturon: gBelt,
      fechaExamen: gFecha,
      puntuacion: gPts,
    });
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    setSel(gAlumno);
    setGPts('');
    setGFecha(hoy());
    const al = store.alumnos.find((x) => x.id === gAlumno);
    if (al) {
      toast('ok', `${fullName(al)} ahora figura con cinturón ${gBelt}.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Historial */}
        <div className="bg-card rounded-2xl p-6 border border-pulso-line shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)]">
          <h3 className="text-lg font-extrabold tracking-tight">Historial</h3>
          <p className="text-sm text-muted-foreground mb-4">El cinturÃ³n actual sale de la Ãºltima graduaciÃ³n.</p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1.5">Alumno</label>
            <select className={inputSelCls} value={sel} onChange={(e) => setSel(e.target.value)}>
              {store.alumnos.map((al) => (
                <option key={al.id} value={al.id}>
                  {fullName(al)}
                  {al.activo ? '' : ' (inactivo)'}
                </option>
              ))}
            </select>
          </div>
          {alum && (
            <p className="text-sm mb-3">
              CinturÃ³n actual: <BeltBadge belt={currentBelt(store, alum.id)} />
            </p>
          )}
          {grados.length ? (
            <ul className="space-y-4">
              {grados.map((gr) => (
                <li key={gr.id} className="flex gap-3">
                  <span
                    className="w-3 h-3 rounded-full mt-1 border-2 border-pulso-panel flex-shrink-0"
                    style={{ background: BELT_COLORS[gr.cinturon] || '#e2e8f0' }}
                  />
                  <div>
                    <div className="text-sm text-foreground font-bold">{gr.cinturon}</div>
                    <div className="text-xs text-muted-foreground">
                      Examen {fmtDate(gr.fechaExamen)} Â· PuntuaciÃ³n {fmtNum(gr.puntuacion)}/10
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Este alumno todavÃ­a no rindiÃ³ exÃ¡menes.</p>
          )}
        </div>

        {/* Registrar graduaciÃ³n */}
        <div className="bg-card rounded-2xl p-6 border border-pulso-line shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)]">
          <h3 className="text-lg font-extrabold tracking-tight">Registrar graduaciÃ³n</h3>
          <p className="text-sm text-muted-foreground mb-4">CinturÃ³n obtenido, fecha del examen y puntuaciÃ³n.</p>
          <form className="space-y-4" onSubmit={registrar} noValidate>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Alumno <span className="text-pulso-red">*</span>
              </label>
              <select className={inputSelCls} value={gAlumno} onChange={(e) => setGAlumno(e.target.value)}>
                {store.alumnos.map((al) => (
                  <option key={al.id} value={al.id}>
                    {fullName(al)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                CinturÃ³n obtenido <span className="text-pulso-red">*</span>
              </label>
              <select className={inputSelCls} value={gBelt} onChange={(e) => setGBelt(e.target.value)}>
                {BELT_ORDER.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Fecha del examen <span className="text-pulso-red">*</span>
              </label>
              <input type="date" className={inputSelCls} value={gFecha} onChange={(e) => setGFecha(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                PuntuaciÃ³n (0 a 10) <span className="text-pulso-red">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                className={inputSelCls}
                value={gPts}
                onChange={(e) => setGPts(e.target.value)}
                placeholder="Ej.: 8.5"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-pulso-red text-primary-foreground px-4 py-3 rounded-xl font-bold text-sm hover:bg-foreground hover:text-background transition-colors"
            >
              <Check className="w-4 h-4" />
              Registrar graduaciÃ³n
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}