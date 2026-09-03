import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="bg-card border border-pulso-line rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-[0_24px_55px_-22px_rgba(0,0,0,.6)]">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-pulso-red/16 flex items-center justify-center">
              <span className="text-pulso-red text-2xl font-extrabold">!</span>
            </div>
            <h1 className="text-lg font-extrabold text-foreground">Algo salió mal</h1>
            <p className="text-sm text-muted-foreground">
              Ocurrió un error inesperado. Recargá la página para continuar.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
