import { Check, MessageCircle } from "lucide-react";

export function Plans() {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hola! Me interesa saber más sobre Team Rayo");
    window.open(`https://wa.me/5491157234518?text=${message}`, "_blank");
  };

  return (
    <section id="plans" className="py-20 bg-[#111318]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-[#F2F2F2] mb-4">
          Elegí tu <span className="text-[#22288A]">plan</span>
        </h2>
        <p className="text-center text-gray-400 mb-16 text-lg">
          Dos opciones pensadas para diferentes objetivos
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Plan Recreativo */}
          <div className="bg-[#1a1d26] rounded-2xl p-8 border border-[#D4243A]/30 hover:border-[#D4243A] transition-all">
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-[#F2F2F2] mb-2">Plan Recreativo</h3>
              <p className="text-gray-400">
                Ideal para quienes quieren entrenar, moverse y aprender kick boxing sin presiones competitivas.
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-[#22288A]">$18.000</span>
                <span className="text-gray-400">/ mes</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {[
                "Clases grupales de técnica y cardio",
                "Acceso a todas las sesiones recreativas",
                "Sin experiencia previa necesaria",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#22288A] mt-1 flex-shrink-0" />
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleWhatsAppClick}
              className="w-full flex items-center justify-center gap-2 bg-[#D4243A] text-[#F2F2F2] px-6 py-3 rounded-lg font-semibold hover:bg-[#2d35b0] transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Consultar por WhatsApp
            </button>
          </div>

          {/* Plan Competitivo */}
          <div className="bg-gradient-to-br from-[#22288A]/10 to-[#D4243A]/10 rounded-2xl p-8 border-2 border-[#22288A] relative overflow-hidden">
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-[#F2F2F2] mb-2">Plan Competitivo</h3>
              <p className="text-gray-400">
                Para los que quieren prepararse para pelear y llevar su nivel al máximo.
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-[#22288A]">$25.000</span>
                <span className="text-gray-400">/ mes</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {[
                "Todo lo del plan recreativo",
                "Entrenamiento específico de competencia",
                "Sparring supervisado",
                "Seguimiento personalizado del profe",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#22288A] mt-1 flex-shrink-0" />
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleWhatsAppClick}
              className="w-full flex items-center justify-center gap-2 bg-[#22288A] text-[#F2F2F2] px-6 py-3 rounded-lg font-semibold hover:bg-[#b81e31] transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Consultar por WhatsApp
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
