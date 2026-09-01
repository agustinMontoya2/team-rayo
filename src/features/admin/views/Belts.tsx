import { useMemo, useState } from 'react';
import { useStore, fullName, currentBelt, formatDate, today, formatNumber, sortByDateDesc, BELT_ORDER, BELT_COLORS, registerGraduation } from '../store';
import { validateGraduationFields } from '../domain/validators';
import { useRealtimeValidation } from '../hooks/useRealtimeValidation';
import { useToast, BeltBadge } from '../ui-kit';
import { Check } from 'lucide-react';
import { selectCls, cardSurface } from '../classes';

export function Belts() {
  const { store, setStore } = useStore();
  const toast = useToast();

  const [sel, setSel] = useState<string>(store.students[0] ? store.students[0].id : '');
  const [gStudent, setGStudent] = useState<string>(store.students[0] ? store.students[0].id : '');
  const [gBelt, setGBelt] = useState<string>(BELT_ORDER[0]);

  const initial = { examDate: today(), score: '' as string | number };
  const validateField = (v: typeof initial, field: string): string => validateGraduationFields(v)[field] || '';
  const { values: g, onChange, onBlur, error, validateAll, setValues } = useRealtimeValidation({
    initialValues: initial,
    validate: validateField,
  });

  const student = sel ? store.students.find((x) => x.id === sel) : null;
  const grades = useMemo(
    () =>
      sel
        ? sortByDateDesc(store.graduations.filter((x) => x.studentId === sel), (g) => g.examDate)
        : [],
    [store, sel]
  );

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const { valid } = validateAll();
    if (!valid) {
      toast('err', 'Revisá los campos marcados.');
      return;
    }
    const res = registerGraduation(store, {
      studentId: gStudent,
      belt: gBelt,
      examDate: g.examDate,
      score: g.score,
    });
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    setSel(gStudent);
    setValues({ examDate: today(), score: '' });
    const al = store.students.find((x) => x.id === gStudent);
    if (al) {
      toast('ok', `${fullName(al)} ahora figura con cinturón ${gBelt}.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Historial */}
        <div className={`${cardSurface} p-6`}>
          <h3 className="text-lg font-extrabold tracking-tight">Historial</h3>
          <p className="text-sm text-muted-foreground mb-4">El cinturón actual sale de la última graduación.</p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1.5">Alumno</label>
            <select className={selectCls} value={sel} onChange={(e) => setSel(e.target.value)}>
              {store.students.map((al) => (
                <option key={al.id} value={al.id}>
                  {fullName(al)}
                  {al.active ? '' : ' (inactivo)'}
                </option>
              ))}
            </select>
          </div>
          {student && (
            <p className="text-sm mb-3">
              Cinturón actual: <BeltBadge belt={currentBelt(store, student.id)} />
            </p>
          )}
          {grades.length ? (
            <ul className="space-y-4">
              {grades.map((gr) => (
                <li key={gr.id} className="flex gap-3">
                  <span
                    className="w-3 h-3 rounded-full mt-1 border-2 border-pulso-panel flex-shrink-0"
                    style={{ background: BELT_COLORS[gr.belt] || '#e2e8f0' }}
                  />
                  <div>
                    <div className="text-sm text-foreground font-bold">{gr.belt}</div>
                    <div className="text-xs text-muted-foreground">
                      Examen {formatDate(gr.examDate)} · Puntuación {formatNumber(gr.score)}/10
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Este alumno todavía no rindió exámenes.</p>
          )}
        </div>

        {/* Registrar graduación */}
        <div className={`${cardSurface} p-6`}>
          <h3 className="text-lg font-extrabold tracking-tight">Registrar graduación</h3>
          <p className="text-sm text-muted-foreground mb-4">Cinturón obtenido, fecha del examen y puntuación.</p>
          <form className="space-y-4" onSubmit={handleRegister} noValidate>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Alumno <span className="text-pulso-red">*</span>
              </label>
              <select className={selectCls} value={gStudent} onChange={(e) => setGStudent(e.target.value)}>
                {store.students.map((al) => (
                  <option key={al.id} value={al.id}>
                    {fullName(al)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Cinturón obtenido <span className="text-pulso-red">*</span>
              </label>
              <select className={selectCls} value={gBelt} onChange={(e) => setGBelt(e.target.value)}>
                {BELT_ORDER.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Fecha del examen <span className="text-pulso-red">*</span>
              </label>
              <input type="date" className={selectCls} value={g.examDate} onChange={(e) => onChange('examDate', e.target.value)} onBlur={() => onBlur('examDate')} />
              {error('examDate') && <p className="text-xs text-pulso-red mt-1">{error('examDate')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Puntuación (0 a 10) <span className="text-pulso-red">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                className={selectCls}
                value={g.score}
                onChange={(e) => onChange('score', e.target.value)}
                onBlur={() => onBlur('score')}
                placeholder="Ej.: 8.5"
              />
              {error('score') && <p className="text-xs text-pulso-red mt-1">{error('score')}</p>}
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-pulso-red text-primary-foreground px-4 py-3 rounded-xl font-bold text-sm hover:bg-foreground hover:text-background transition-colors"
            >
              <Check className="w-4 h-4" />
              Registrar graduación
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}