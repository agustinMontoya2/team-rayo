import { ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Hero() {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hola! Me interesa probar la primera clase gratis 🥊');
    window.open(`https://wa.me/5491157234518?text=${message}`, '_blank');
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-16">
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1636302925863-6ad504baaf3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjB0cmFpbmluZyUyMGd5bXxlbnwxfHx8fDE3ODEwOTI0NDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Boxing training"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#111318]/80 via-[#111318]/65 to-[#111318]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-[#22288A] uppercase tracking-widest text-xl mb-4 font-semibold">Fuerza · Disciplina · Respeto</p>
        <h1 className="text-5xl md:text-7xl font-bold text-[#F2F2F2] mb-6 leading-tight">
          Vos ponés el rayo,
          <br />
          <span className="text-[#22288A]">nosotros te hacemos brillar.</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
          No es solo entrenamiento, es un estilo de vida. Tanto si querés ponerte en forma como subir al ring, en Team Rayo encontrás tu lugar.
        </p>
        <button
          onClick={handleWhatsAppClick}
          className="inline-flex items-center gap-2 bg-[#22288A] text-[#F2F2F2] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#b81e31] transition-all transform hover:scale-105"
        >
          Probá tu primera clase gratis
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
