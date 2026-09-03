import { useState } from 'react';
import { Modal } from '../Modal';
import { useStore, today, saveStudent, fullName, type Student } from '../store';
import {
  validateStudentFirstName,
  validateStudentLastName,
  validateStudentDni,
  validateStudentBirthDate,
  validateStudentEnrollmentDate,
  validateStudentWeight,
} from '../domain/validators';
import { useRealtimeValidation } from '../hooks/useRealtimeValidation';
import { useToast } from '../ui-kit';
import { Field } from '../Field';
import { Upload, Trash2 } from 'lucide-react';
import { inputPhCls, btnSecondary, btnPrimaryModal } from '../classes';

interface StudentFormModalProps {
  open: boolean;
  onClose: () => void;
  edit?: Student | null;
  onDone?: () => void;
}

export function StudentFormModal({ open, onClose, edit, onDone }: StudentFormModalProps) {
  const { store, setStore } = useStore();
  const toast = useToast();

  const initial = {
    firstName: edit?.firstName || '',
    lastName: edit?.lastName || '',
    idNumber: edit?.idNumber || '',
    birthDate: edit?.birthDate || '',
    phone: edit?.phone || '',
    enrollmentDate: edit?.enrollmentDate || today(),
    planId: edit?.planId || '',
    weight: edit?.currentWeight != null ? String(edit.currentWeight) : '',
  };

  const validateField = (v: typeof initial, field: string): string => {
    switch (field) {
      case 'firstName':
        return validateStudentFirstName(v.firstName);
      case 'lastName':
        return validateStudentLastName(v.lastName);
      case 'idNumber':
        return validateStudentDni(store, v.idNumber, edit?.id);
      case 'birthDate':
        return validateStudentBirthDate(v.birthDate);
      case 'enrollmentDate':
        return validateStudentEnrollmentDate(v.birthDate, v.enrollmentDate);
      case 'weight':
        return validateStudentWeight(v.weight === '' ? null : Number(v.weight));
      default:
        return '';
    }
  };

  const { values: form, onChange, onBlur, error, validateAll } = useRealtimeValidation({
    initialValues: initial,
    validate: validateField,
  });
  const [photo, setPhoto] = useState<string | null>(edit?.competitionPhoto || null);

  const set = (k: string, v: string) => onChange(k, v);

  const onFile = (file?: File) => {
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => setPhoto(rd.result as string);
    rd.readAsDataURL(file);
  };

  const save = () => {
    const { valid } = validateAll();
    if (!valid) {
      toast('err', 'Revisá los campos marcados.');
      return;
    }
    const res = saveStudent(store, {
      id: edit?.id,
      firstName: form.firstName,
      lastName: form.lastName,
      idNumber: form.idNumber,
      birthDate: form.birthDate,
      phone: form.phone,
      enrollmentDate: form.enrollmentDate,
      planId: form.planId || null,
      currentWeight: form.weight === '' ? null : Number(form.weight),
      competitionPhoto: photo,
    });
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    toast('ok', edit ? `Datos de ${fullName(edit)} actualizados.` : `${form.firstName.trim()} registrado como alumno.`);
    onClose();
    onDone?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={edit ? 'Editar alumno' : 'Nuevo alumno'}
      sub={edit ? `Actualizá los datos de ${fullName(edit)}` : 'Registrá un nuevo alumno en el gimnasio'}
      footer={
        <>
          <button onClick={onClose} className={btnSecondary}>
            Cancelar
          </button>
          <button onClick={save} className={btnPrimaryModal}>
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
          <input className={inputPhCls} value={form.firstName} onChange={(e) => set('firstName', e.target.value)} onBlur={() => onBlur('firstName')} placeholder="Ej.: Ana" />
          {error('firstName') && <p className="text-xs text-pulso-red mt-1">{error('firstName')}</p>}
        </Field>
        <Field label="Apellido" required>
          <input className={inputPhCls} value={form.lastName} onChange={(e) => set('lastName', e.target.value)} onBlur={() => onBlur('lastName')} placeholder="Ej.: Gutiérrez" />
          {error('lastName') && <p className="text-xs text-pulso-red mt-1">{error('lastName')}</p>}
        </Field>
        <Field label="DNI" required>
          <input className={inputPhCls} inputMode="numeric" value={form.idNumber} onChange={(e) => set('idNumber', e.target.value)} onBlur={() => onBlur('idNumber')} placeholder="Solo números" />
          {error('idNumber') && <p className="text-xs text-pulso-red mt-1">{error('idNumber')}</p>}
        </Field>
        <Field label="Fecha de nacimiento" required>
          <input type="date" className={inputPhCls} value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} onBlur={() => onBlur('birthDate')} />
          {error('birthDate') && <p className="text-xs text-pulso-red mt-1">{error('birthDate')}</p>}
        </Field>
        <Field label="Teléfono">
          <input className={inputPhCls} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+54 9 11 …" />
        </Field>
        <Field label="Fecha de ingreso" required>
          <input type="date" className={inputPhCls} value={form.enrollmentDate} onChange={(e) => set('enrollmentDate', e.target.value)} onBlur={() => onBlur('enrollmentDate')} />
          {error('enrollmentDate') && <p className="text-xs text-pulso-red mt-1">{error('enrollmentDate')}</p>}
        </Field>
        <Field label="Plan" hint="Cambiar el plan conserva el historial de cuotas.">
          <select className={`${inputPhCls} appearance-none`} value={form.planId} onChange={(e) => set('planId', e.target.value)}>
            <option value="">Sin plan asignado</option>
            {store.plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Peso actual (kg)">
          <input type="number" step="0.1" min="20" max="250" className={inputPhCls} value={form.weight} onChange={(e) => set('weight', e.target.value)} onBlur={() => onBlur('weight')} placeholder="Ej.: 72.5" />
          {error('weight') && <p className="text-xs text-pulso-red mt-1">{error('weight')}</p>}
        </Field>

        <div className="sm:col-span-2">
          <span className="block text-sm font-medium text-foreground mb-1.5">Foto de competencia</span>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl border border-pulso-border overflow-hidden flex items-center justify-center bg-pulso-input">
              {photo ? <img src={photo} alt="Foto de competencia" className="w-full h-full object-cover" /> : <Upload className="w-6 h-6 text-muted-foreground" />}
            </div>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-4 py-2.5 rounded-xl border border-pulso-line text-sm font-semibold text-foreground hover:bg-card transition-colors inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Subir foto
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
              </label>
              {photo && (
                <button type="button" onClick={() => setPhoto(null)} className="px-3 py-2.5 rounded-xl text-sm font-semibold text-pulso-red hover:bg-card transition-colors inline-flex items-center gap-1.5">
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
