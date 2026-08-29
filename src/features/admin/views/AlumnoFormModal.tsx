import { useState } from 'react';
import { Modal } from '../Modal';
import { useStore, hoy, guardarAlumno, fullName, type Alumno } from '../store';
import { useToast } from '../ui-kit';
import { Upload, Trash2 } from 'lucide-react';

interface AlumnoFormModalProps {
  open: boolean;
  onClose: () => void;
  edit?: Alumno | null;
  onDone?: () => void;
}

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label} {required && <span className="text-pulso-red">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

const inputCls =
  'w-full px-4 py-3 bg-pulso-input border border-pulso-line rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20 transition-colors text-sm';

export function AlumnoFormModal({ open, onClose, edit, onDone }: AlumnoFormModalProps) {
  const { store, setStore } = useStore();
  const toast = useToast();

  const [form, setForm] = useState(() => ({
    nombre: edit?.nombre || '',
    apellido: edit?.apellido || '',
    dni: edit?.dni || '',
    nac: edit?.fechaNacimiento || '',
    tel: edit?.telefono || '',
    ingreso: edit?.fechaIngreso || hoy(),
    planId: edit?.planId || '',
    peso: edit?.pesoActual != null ? String(edit.pesoActual) : '',
  }));
  const [foto, setFoto] = useState<string | null>(edit?.fotoCompetencia || null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onFile = (file?: File) => {
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => setFoto(rd.result as string);
    rd.readAsDataURL(file);
  };

  const save = () => {
    const res = guardarAlumno(store, {
      id: edit?.id,
      nombre: form.nombre,
      apellido: form.apellido,
      dni: form.dni,
      fechaNacimiento: form.nac,
      telefono: form.tel,
      fechaIngreso: form.ingreso,
      planId: form.planId || null,
      pesoActual: form.peso === '' ? null : Number(form.peso),
      fotoCompetencia: foto,
    });
    if (res.result.error) {
      setErrors(res.result.fieldErrors || {});
      toast('err', res.result.error);
      return;
    }
    setStore(res.result.store);
    const nombre = edit ? fullName(edit) : res.exists ? fullName(res.exists) : '';
    toast('ok', edit ? `Datos de ${nombre} actualizados.` : `${form.nombre.trim()} registrado como alumno.`);
    onClose();
    onDone?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={edit ? 'Editar alumno' : 'Nuevo alumno'}
      sub={edit ? `ActualizÃ¡ los datos de ${fullName(edit)}` : 'RegistrÃ¡ un nuevo alumno en el gimnasio'}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-pulso-line text-sm font-semibold text-foreground hover:bg-card transition-colors">
            Cancelar
          </button>
          <button onClick={save} className="px-4 py-2.5 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors">
            {edit ? 'Guardar cambios' : 'Registrar alumno'}
          </button>
        </>
      }
    >
      <form
        className="grid sm:grid-cols-2 gap-4 min-w-0"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Field label="Nombre" required>
          <input className={inputCls} value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Ej.: Ana" />
          {errors.nombre && <p className="text-xs text-pulso-red mt-1">{errors.nombre}</p>}
        </Field>
        <Field label="Apellido" required>
          <input className={inputCls} value={form.apellido} onChange={(e) => set('apellido', e.target.value)} placeholder="Ej.: GutiÃ©rrez" />
          {errors.apellido && <p className="text-xs text-pulso-red mt-1">{errors.apellido}</p>}
        </Field>
        <Field label="DNI" required>
          <input className={inputCls} inputMode="numeric" value={form.dni} onChange={(e) => set('dni', e.target.value)} placeholder="Solo nÃºmeros" />
          {errors.dni && <p className="text-xs text-pulso-red mt-1">{errors.dni}</p>}
        </Field>
        <Field label="Fecha de nacimiento" required>
          <input type="date" className={inputCls} value={form.nac} onChange={(e) => set('nac', e.target.value)} />
          {errors.nac && <p className="text-xs text-pulso-red mt-1">{errors.nac}</p>}
        </Field>
        <Field label="TelÃ©fono">
          <input className={inputCls} value={form.tel} onChange={(e) => set('tel', e.target.value)} placeholder="+54 9 11 â€¦" />
        </Field>
        <Field label="Fecha de ingreso" required>
          <input type="date" className={inputCls} value={form.ingreso} onChange={(e) => set('ingreso', e.target.value)} />
          {errors.ingreso && <p className="text-xs text-pulso-red mt-1">{errors.ingreso}</p>}
        </Field>
        <Field label="Plan" hint="Cambiar el plan conserva el historial de cuotas.">
          <select className={`${inputCls} appearance-none`} value={form.planId} onChange={(e) => set('planId', e.target.value)}>
            <option value="">Sin plan asignado</option>
            {store.planes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Peso actual (kg)">
          <input type="number" step="0.1" min="20" max="250" className={inputCls} value={form.peso} onChange={(e) => set('peso', e.target.value)} placeholder="Ej.: 72.5" />
          {errors.peso && <p className="text-xs text-pulso-red mt-1">{errors.peso}</p>}
        </Field>

        <div className="sm:col-span-2">
          <span className="block text-sm font-medium text-foreground mb-1.5">Foto de competencia</span>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl border border-pulso-border overflow-hidden flex items-center justify-center bg-pulso-input">
              {foto ? <img src={foto} alt="Foto de competencia" className="w-full h-full object-cover" /> : <Upload className="w-6 h-6 text-muted-foreground" />}
            </div>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-4 py-2.5 rounded-xl border border-pulso-line text-sm font-semibold text-foreground hover:bg-card transition-colors inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Subir foto
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
              </label>
              {foto && (
                <button type="button" onClick={() => setFoto(null)} className="px-3 py-2.5 rounded-xl text-sm font-semibold text-pulso-red hover:bg-card transition-colors inline-flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" />
                  Quitar
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Se muestra en su perfil como foto deportiva.</p>
        </div>
      </form>
    </Modal>
  );
}