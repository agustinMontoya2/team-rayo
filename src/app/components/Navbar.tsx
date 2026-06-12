import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import logoImg from '../../imports/logo.jpeg';

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#111318]/95 backdrop-blur-sm border-b border-[#D4243A]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('hero')}>
            <img src={logoImg} alt="Team Rayo" className="h-10 w-10 object-contain rounded-full" />
            <span className="text-[#F2F2F2] text-xl font-bold">Team Rayo</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('plans')} className="text-gray-300 hover:text-[#22288A] transition-colors">Clases</button>
            <button onClick={() => scrollToSection('plans')} className="text-gray-300 hover:text-[#22288A] transition-colors">Precios</button>
            <button onClick={() => scrollToSection('schedule')} className="text-gray-300 hover:text-[#22288A] transition-colors">Horarios</button>
            <button onClick={() => scrollToSection('location')} className="text-gray-300 hover:text-[#22288A] transition-colors">Contacto</button>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-[#F2F2F2]">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#111318] border-t border-[#D4243A]/30">
          <div className="px-4 py-4 space-y-3">
            <button onClick={() => scrollToSection('plans')} className="block w-full text-left text-gray-300 hover:text-[#22288A] transition-colors py-2">Clases</button>
            <button onClick={() => scrollToSection('plans')} className="block w-full text-left text-gray-300 hover:text-[#22288A] transition-colors py-2">Precios</button>
            <button onClick={() => scrollToSection('schedule')} className="block w-full text-left text-gray-300 hover:text-[#22288A] transition-colors py-2">Horarios</button>
            <button onClick={() => scrollToSection('location')} className="block w-full text-left text-gray-300 hover:text-[#22288A] transition-colors py-2">Contacto</button>
          </div>
        </div>
      )}
    </nav>
  );
}
