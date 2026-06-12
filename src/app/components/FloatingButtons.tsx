import { MessageCircle, Instagram } from 'lucide-react';
import { useState, useEffect } from 'react';

export function FloatingButtons() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hola! Me interesa saber más sobre Team Rayo');
    window.open(`https://wa.me/5491157234518?text=${message}`, '_blank');
  };

  const handleInstagramClick = () => {
    window.open('https://instagram.com/teamrayo31', '_blank');
  };

  return (
    <div
      className={`fixed bottom-6 right-6 flex flex-col gap-3 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
    >
      <button
        onClick={handleWhatsAppClick}
        className="group relative bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-[#111318] text-[#F2F2F2] px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Escribinos por WhatsApp
        </span>
      </button>

      <button
        onClick={handleInstagramClick}
        className="group relative bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all"
        aria-label="Ver Instagram"
      >
        <Instagram className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-[#111318] text-[#F2F2F2] px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Seguinos en Instagram
        </span>
      </button>
    </div>
  );
}
