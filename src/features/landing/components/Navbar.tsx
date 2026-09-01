import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import logoImg from '/assets/logo.webp';
import { scrollToSection } from '../links';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const jumpTo = (id: string) => {
    scrollToSection(id);
    setIsOpen(false);
  };

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed top-0 left-0 right-0 z-50 bg-pulso-glass backdrop-blur-[14px] border-b border-pulso-line"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[70px]">
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              jumpTo('hero');
            }}
            className="flex items-center gap-3 cursor-pointer min-h-[44px]"
          >
            <img src={logoImg} alt="Team Rayo" className="w-10 h-10 object-cover rounded-xl" />
            <span className="text-foreground text-[17px] font-extrabold tracking-tight">Team Rayo</span>
          </a>

          <div className="hidden md:flex items-center gap-1.5">
            <button onClick={() => jumpTo('plans')} className="text-muted-foreground hover:text-foreground hover:bg-surface rounded-[10px] px-3.5 py-2.5 text-sm font-medium transition-colors">Clases</button>
            <button onClick={() => jumpTo('plans')} className="text-muted-foreground hover:text-foreground hover:bg-surface rounded-[10px] px-3.5 py-2.5 text-sm font-medium transition-colors">Precios</button>
            <button onClick={() => jumpTo('schedule')} className="text-muted-foreground hover:text-foreground hover:bg-surface rounded-[10px] px-3.5 py-2.5 text-sm font-medium transition-colors">Horarios</button>
            <button onClick={() => jumpTo('location')} className="text-muted-foreground hover:text-foreground hover:bg-surface rounded-[10px] px-3.5 py-2.5 text-sm font-medium transition-colors">Contacto</button>
            <a href="/admin" className="inline-flex items-center justify-center min-h-[42px] px-4 rounded-xl bg-pulso-red text-[#16040A] text-[13.5px] font-bold transition-colors hover:bg-foreground hover:text-background ml-2">
              Administrar Gimnasio
            </a>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="md:hidden w-[46px] h-[46px] rounded-[10px] border border-pulso-line bg-surface text-foreground flex items-center justify-center"
          >
            {isOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div id="mobile-menu" className="md:hidden bg-pulso-bg border-t border-pulso-line">
          <div className="px-4 py-4 space-y-1">
            <button onClick={() => jumpTo('plans')} className="block w-full text-left text-muted-foreground hover:text-foreground hover:bg-surface rounded-xl px-4 py-3 text-sm font-semibold transition-colors">Clases</button>
            <button onClick={() => jumpTo('plans')} className="block w-full text-left text-muted-foreground hover:text-foreground hover:bg-surface rounded-xl px-4 py-3 text-sm font-semibold transition-colors">Precios</button>
            <button onClick={() => jumpTo('schedule')} className="block w-full text-left text-muted-foreground hover:text-foreground hover:bg-surface rounded-xl px-4 py-3 text-sm font-semibold transition-colors">Horarios</button>
            <button onClick={() => jumpTo('location')} className="block w-full text-left text-muted-foreground hover:text-foreground hover:bg-surface rounded-xl px-4 py-3 text-sm font-semibold transition-colors">Contacto</button>
            <a href="/admin" className="block w-full text-center bg-pulso-red text-[#16040A] rounded-xl px-4 py-3 text-sm font-bold mt-2">Administrar Gimnasio</a>
          </div>
        </div>
      )}
    </nav>
  );
}
