import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import logoImg from '/assets/logo.webp';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-pulso-glass backdrop-blur-[14px] border-b border-pulso-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[70px]">
          <div className="flex items-center gap-3 cursor-pointer min-h-[44px]" onClick={() => scrollToSection('hero')}>
            <img src={logoImg} alt="Team Rayo" className="w-10 h-10 object-cover rounded-xl" />
            <span className="text-foreground text-[17px] font-extrabold tracking-tight">Team Rayo</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <button onClick={() => scrollToSection('plans')} className="text-muted-foreground hover:text-foreground hover:bg-surface rounded-[10px] px-3.5 py-2.5 text-sm font-medium transition-colors">Clases</button>
            <button onClick={() => scrollToSection('plans')} className="text-muted-foreground hover:text-foreground hover:bg-surface rounded-[10px] px-3.5 py-2.5 text-sm font-medium transition-colors">Precios</button>
            <button onClick={() => scrollToSection('schedule')} className="text-muted-foreground hover:text-foreground hover:bg-surface rounded-[10px] px-3.5 py-2.5 text-sm font-medium transition-colors">Horarios</button>
            <button onClick={() => scrollToSection('location')} className="text-muted-foreground hover:text-foreground hover:bg-surface rounded-[10px] px-3.5 py-2.5 text-sm font-medium transition-colors">Contacto</button>
            <a href="/admin" className="inline-flex items-center justify-center min-h-[42px] px-4 rounded-xl bg-pulso-red text-[#16040A] text-[13.5px] font-bold transition-colors hover:bg-foreground hover:text-background ml-2">
              Panel admin
            </a>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden w-[46px] h-[46px] rounded-[10px] border border-pulso-line bg-surface text-foreground flex items-center justify-center">
            {isOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-pulso-bg border-t border-pulso-line">
          <div className="px-4 py-4 space-y-1">
            <button onClick={() => scrollToSection('plans')} className="block w-full text-left text-muted-foreground hover:text-foreground hover:bg-surface rounded-xl px-4 py-3 text-sm font-semibold transition-colors">Clases</button>
            <button onClick={() => scrollToSection('plans')} className="block w-full text-left text-muted-foreground hover:text-foreground hover:bg-surface rounded-xl px-4 py-3 text-sm font-semibold transition-colors">Precios</button>
            <button onClick={() => scrollToSection('schedule')} className="block w-full text-left text-muted-foreground hover:text-foreground hover:bg-surface rounded-xl px-4 py-3 text-sm font-semibold transition-colors">Horarios</button>
            <button onClick={() => scrollToSection('location')} className="block w-full text-left text-muted-foreground hover:text-foreground hover:bg-surface rounded-xl px-4 py-3 text-sm font-semibold transition-colors">Contacto</button>
            <a href="/admin" className="block w-full text-center bg-pulso-red text-[#16040A] rounded-xl px-4 py-3 text-sm font-bold mt-2">Panel admin</a>
          </div>
        </div>
      )}
    </nav>
  );
}
