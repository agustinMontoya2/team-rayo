import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../components/ui/accordion';
import { SectionHeading } from './SectionHeading';

const FAQS = [
  {
    question: '¿Necesito tener experiencia previa?',
    answer: 'No. El plan recreativo está pensado para cualquier nivel. El profesor adapta el entrenamiento a cada persona desde el primer día.'
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
    answer: 'El profesor lo evalúa con vos cuando ve que tenés la base técnica y las ganas. No hay un tiempo mínimo, depende de cada alumno.'
  },
  {
    question: '¿Hacen clases para niños?',
    answer: 'Por el momento nos enfocamos en entrenamientos para adultos y adolescentes mayores de 15 años. Consultanos para casos particulares.'
  }
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading>
          Preguntas <span className="text-pulso-red">frecuentes</span>
        </SectionHeading>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Todo lo que necesitás saber antes de empezar
        </p>

        <Accordion type="single" collapsible defaultValue="0" className="space-y-4">
          {FAQS.map((faq, index) => (
            <AccordionItem
              key={index}
              value={String(index)}
              className="bg-card rounded-xl border border-pulso-line overflow-hidden"
            >
              <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-pulso-surface2 text-foreground font-semibold text-lg">
                <span className="pr-4">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="px-6">
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}