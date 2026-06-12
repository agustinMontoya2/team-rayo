import { Quote } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Ana Gutiérrez',
      plan: 'Plan Recreativo',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      text: 'Empecé sin ninguna experiencia y el profe supo llevarme de a poco. Ahora no cambio estas clases por nada. Me siento más fuerte y confiada.'
    },
    {
      name: 'Lucas Fernández',
      plan: 'Plan Competitivo',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      text: 'El nivel de entrenamiento es increíble. Daniel te saca lo mejor, siempre con respeto y técnica. Somos más que un equipo, somos una familia.'
    },
    {
      name: 'Carla Moreno',
      plan: 'Plan Recreativo',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      text: 'Buscaba una actividad para desconectar del trabajo y encontré mucho más. El ambiente es excelente y las clases súper completas.'
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-[#0d1016]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-[#F2F2F2] mb-4">
          Lo que dicen <span className="text-[#22288A]">nuestros alumnos</span>
        </h2>
        <p className="text-center text-gray-400 mb-16 text-lg">
          Experiencias reales de nuestra comunidad
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-[#1a1d26] rounded-2xl p-8 border border-[#D4243A]/30 hover:border-[#22288A]/50 transition-all"
            >
              <Quote className="w-10 h-10 text-[#22288A] mb-4" />
              <p className="text-gray-300 text-lg mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-4 pt-6 border-t border-[#D4243A]/20">
                <ImageWithFallback
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <div className="text-[#F2F2F2] font-semibold">{testimonial.name}</div>
                  <div className="text-[#D4243A] text-sm">{testimonial.plan}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
