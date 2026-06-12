import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: '¿Necesito tener experiencia previa?',
      answer: 'No. El plan recreativo está pensado para cualquier nivel. El profe adapta el entrenamiento a cada persona desde el primer día.'
    },
    {
      question: '¿Qué tengo que traer a la primera clase?',
      answer: 'Ropa cómoda y zapatillas deportivas. Los guantes y vendas se pueden conseguir en el gimnasio o te asesoramos para comprarlos.'
    },
    {
      question: '¿Puedo empezar cualquier día de la semana?',
      answer: 'Sí. Podés sumarte a cualquier clase sin esperar inicio de mes. Te recomendamos avisar antes por WhatsApp para que el profe te espere.'
    },
    {
      question: '¿Las clases son mixtas?',
      answer: 'Sí, entrenan hombres y mujeres juntos en un ambiente respetuoso y de compañerismo.'
    },
    {
      question: '¿Cómo sé si estoy listo para pasar al plan competitivo?',
      answer: 'El profe lo evalúa con vos cuando ve que tenés la base técnica y las ganas. No hay un tiempo mínimo, depende de cada alumno.'
    },
    {
      question: '¿Hacen clases para niños?',
      answer: 'Por el momento nos enfocamos en entrenamientos para adultos y adolescentes mayores de 15 años. Consultanos para casos particulares.'
    }
  ];

  return (
    <section id="faq" className="py-20 bg-[#111318]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-[#F2F2F2] mb-4">
          Preguntas <span className="text-[#22288A]">frecuentes</span>
        </h2>
        <p className="text-center text-gray-400 mb-12 text-lg">
          Todo lo que necesitás saber antes de empezar
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-[#1a1d26] rounded-xl border border-[#22288A]/30 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-[#1e2130] transition-colors"
              >
                <span className="text-[#F2F2F2] font-semibold text-lg pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-[#D4243A] flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
