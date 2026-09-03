import { Children, cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  labelClassName?: string;
  children: ReactNode;
}

export function Field({ label, required, hint, className, labelClassName, children }: FieldProps) {
  const id = useId();
  const kids = Children.toArray(children);
  const control = kids[0];
  const rest = kids.slice(1);
  const cloned = isValidElement<{ id?: string }>(control)
    ? cloneElement(control as ReactElement<{ id?: string }>, { id })
    : control;
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={labelClassName ?? 'block text-sm font-medium text-foreground mb-1.5'}
      >
        {label} {required && <span className="text-pulso-red">*</span>}
      </label>
      {cloned}
      {rest}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}
