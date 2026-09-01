import { Link } from 'react-router';

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center gap-2">
      <span className="text-6xl font-extrabold text-pulso-red">404</span>
      <h1 className="text-lg font-extrabold text-foreground">¡Fuera del ring!</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Esa esquina no existe. Volvé al centro del ring y arrancá de nuevo.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors"
      >
        🥊 Volver al ring
      </Link>
    </div>
  );
}