import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Coach() {
  return (
    <section id="coach" className="py-20 bg-[#0d1016]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-[#F2F2F2] mb-16">
          Tu <span className="text-[#22288A]">entrenador</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#22288A]/20 rounded-2xl blur-3xl"></div>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1517438322307-e67111335449?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBjb2FjaCUyMHRyYWluZXJ8ZW58MXx8fHwxNzgxMjE1MjY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Coach Daniel Portillo"
              className="relative rounded-2xl w-full h-[500px] object-cover shadow-2xl"
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-[#22288A]">
              Coach Daniel Portillo
            </h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              Daniel lleva más de 30 años en el mundo del kick boxing.
              Con una trayectoria forjada en la disciplina y el
              trabajo duro, hoy dirige Team Rayo con un método
              que combina técnica, respeto y el ritmo justo para
              cada alumno, sin importar el nivel.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              No importa de dónde venís, importa a dónde vas. Su
              enfoque se basa en la construcción progresiva de
              fundamentos sólidos, adaptando cada sesión a las
              necesidades individuales.
            </p>
            <div className="border-l-4 border-[#22288A] pl-6 py-4 bg-[#22288A]/5 rounded">
              <p className="text-xl italic text-gray-200">
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