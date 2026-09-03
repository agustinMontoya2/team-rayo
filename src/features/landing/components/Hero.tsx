import { ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import heroImage from "/assets/hero-image.webp";
import { openWhatsApp } from '../links';
import { FIRST_CLASS_WHATSAPP_MESSAGE, TAGLINE } from '../constants';

export function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-[70px]">
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src={heroImage}
          alt="Boxing training"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-pulso-bg/80 via-pulso-bg/65 to-pulso-bg"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="font-mono text-pulso-red uppercase tracking-widest text-xl mb-4 font-semibold">{TAGLINE}</p>
        <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 leading-tight tracking-tight">
          Vos ponés el rayo,
          <br />
          <span className="text-pulso-red">nosotros te hacemos brillar.</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
          No es solo entrenamiento, es un estilo de vida. Tanto si querés ponerte en forma como subir al ring, en Team Rayo encontrás tu lugar.
        </p>
        <button
          onClick={() => openWhatsApp(FIRST_CLASS_WHATSAPP_MESSAGE)}
          className="inline-flex items-center gap-2 bg-pulso-red text-[#16040A] px-8 py-4 rounded-xl text-lg font-bold hover:bg-foreground hover:text-background transition-all transform hover:scale-105 min-h-[48px]"
        >
          Probá tu primera clase gratis
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
