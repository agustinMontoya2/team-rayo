import { useState } from 'react';
import logoImg from '/assets/logo.webp';
import { Field } from './Field';
import { useAuthContext } from './providers/AuthProvider';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { login } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError('');
    const res = await login(email, password);
    setChecking(false);
    if (res.error) {
      setError(res.error);
    } else {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card rounded-2xl border border-pulso-line shadow-[0_24px_55px_-22px_rgba(0,0,0,.6)] p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logoImg} alt="Logo de Team Rayo" className="w-16 h-16 mx-auto rounded-2xl mb-4 object-cover" />
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Team Rayo</h1>
          <p className="font-mono text-pulso-red uppercase text-xs tracking-[.16em] mt-1">PANEL DEL PROFESOR</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email" labelClassName="block text-sm font-medium text-muted-foreground mb-1.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu email"
              className="w-full px-4 py-3 bg-background border border-pulso-line rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20 transition-colors"
            />
          </Field>
          <Field label="Contraseña" labelClassName="block text-sm font-medium text-muted-foreground mb-1.5">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-background border border-pulso-line rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20 transition-colors"
            />
          </Field>

          {error && (
            <p className="text-pulso-red text-sm font-medium" role="alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={checking}
            className="w-full bg-pulso-red text-primary-foreground font-bold py-3 rounded-xl hover:bg-foreground hover:text-background transition-colors min-h-[44px] disabled:opacity-60 disabled:hover:bg-pulso-red disabled:hover:text-primary-foreground"
          >
            {checking ? 'Verificando…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
