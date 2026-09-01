import type { RayoStore, Fee } from '../types';
import { uid } from '../utils';
import { validatePaymentFields } from '../validators';
import { err, ok, type ActionResult } from './common';

export function registerPayment(
  d: RayoStore,
  input: { studentId: string; period: string; amount: string | number; paymentDate: string }
): ActionResult {
  const fieldErrors = validatePaymentFields(input);
  if (Object.keys(fieldErrors).length > 0) {
    return err(d, Object.values(fieldErrors)[0], fieldErrors);
  }
  const amount = Number(input.amount);

  let info: string | undefined;
  if (d.fees.some((f) => f.studentId === input.studentId && f.period === input.period)) {
    info = 'Este alumno ya pagó ese período. Si seguís, se registrará otro pago.';
  }

  const fee: Fee = {
    id: uid('c'),
    studentId: input.studentId,
    period: input.period,
    amount,
    paymentDate: input.paymentDate,
  };
  return ok({ ...d, fees: [...d.fees, fee] }, info);
}

export function deletePayment(d: RayoStore, feeId: string): ActionResult {
  return ok({ ...d, fees: d.fees.filter((f) => f.id !== feeId) });
}