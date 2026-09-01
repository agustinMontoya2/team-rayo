import { useCallback, useMemo, useState } from 'react';

type Errors = Record<string, string>;

interface Options<T extends Record<string, any>> {
  initialValues: T;
  validate: (values: T, field: string) => string;
}

export function useRealtimeValidation<T extends Record<string, any>>({
  initialValues,
  validate,
}: Options<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const onChange = useCallback(
    (field: string, value: any) => {
      setValues((prev) => {
        const nextValues = { ...prev, [field]: value };
        if (touched[field]) {
          const err = validate(nextValues, field);
          setErrors((prevErrors) => {
            const next = { ...prevErrors };
            if (err) next[field] = err;
            else delete next[field];
            return next;
          });
        }
        return nextValues;
      });
    },
    [touched, validate]
  );

  const onBlur = useCallback(
    (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const err = validate(values, field);
      setErrors((prev) => {
        const next = { ...prev };
        if (err) next[field] = err;
        else delete next[field];
        return next;
      });
    },
    [values, validate]
  );

  const error = useCallback((field: string): string | undefined => (touched[field] ? errors[field] : undefined), [touched, errors]);

  const validateAll = useCallback(() => {
    const errs: Errors = {};
    (Object.keys(values) as string[]).forEach((field) => {
      const err = validate(values, field);
      if (err) errs[field] = err;
    });
    setErrors(errs);
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
    return { valid: Object.keys(errs).length === 0, errors: errs };
  }, [values, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const fieldProps = useMemo(
    () => (field: string) => ({
      value: values[field],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(field, e.target.value),
      onBlur: () => onBlur(field),
    }),
    [values, onChange, onBlur]
  );

  return { values, setValues, onChange, onBlur, error, errors, validateAll, reset, fieldProps };
}
