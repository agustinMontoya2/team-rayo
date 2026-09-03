export function ViewLoader() {
  return (
    <div className="flex items-center justify-center py-24" role="status" aria-label="Cargando">
      <span className="w-8 h-8 rounded-full border-2 border-pulso-line border-t-pulso-red animate-spin" />
    </div>
  );
}
