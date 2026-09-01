import { ImageWithFallback } from "./figma/ImageWithFallback";
import { SectionHeading } from "./SectionHeading";

export function Coach() {
  return (
    <section id="coach" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading>
          Tu <span className="text-pulso-indigo">entrenador</span>
        </SectionHeading>
        <p className="font-mono text-pulso-red uppercase text-xs tracking-[.16em] text-center mb-16">KICK BOXING · VILLA LA ÑATA</p>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-pulso-indigo/20 rounded-2xl blur-3xl"></div>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1517438322307-e67111335449?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBjb2FjaCUyMHRyYWluZXJ8ZW58MXx8fHwxNzgxMjE1MjY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Profesor Daniel Portillo"
              className="relative rounded-2xl w-full h-[500px] object-cover shadow-[0_24px_55px_-22px_rgba(0,0,0,.6)]"
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-3xl font-extrabold text-pulso-indigo tracking-tight">
              Profesor Daniel Portillo
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Daniel lleva más de 30 años en el mundo del kick boxing.
              Con una trayectoria forjada en la disciplina y el
              trabajo duro, hoy dirige Team Rayo con un método
              que combina técnica, respeto y el ritmo justo para
              cada alumno, sin importar el nivel.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              No importa de dónde venís, importa a dónde vas. Su
              enfoque se basa en la construcción progresiva de
              fundamentos sólidos, adaptando cada sesión a las
              necesidades individuales.
            </p>
            <div className="border-l-4 border-pulso-indigo pl-6 py-4 bg-pulso-indigo/5 rounded-r-xl">
              <p className="text-xl italic text-foreground/80">
                "Solo triunfa el que soporta el proceso. Acá
                todos empiezan desde donde están y avanzan a su
                propio ritmo."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
