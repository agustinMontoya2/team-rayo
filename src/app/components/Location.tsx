import { MapPin } from "lucide-react";

export function Location() {
  return (
    <section id="location" className="py-20 bg-[#0d1016]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-[#F2F2F2] mb-4">
          Dónde <span className="text-[#22288A]">estamos</span>
        </h2>
        <p className="text-center text-gray-400 mb-12 text-lg">
          Vení a conocernos
        </p>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-[#22288A] mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-[#F2F2F2] font-semibold text-xl mb-2">
                  Dirección
                </h3>
                <p className="text-gray-300">
                  Las Heras 1000 - Villa la Ñata
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Arriba de Sociedad de Fomento
                </p>
              </div>
            </div>

            <div className="bg-[#1a1d26] border border-[#D4243A]/30 rounded-xl p-6">
              <p className="text-gray-300 italic text-lg leading-relaxed">
                "No importa de dónde venís. Importa a dónde
                vas."
              </p>
            </div>

            <div className="pt-2">
              <a
                href="https://www.google.com/maps/place/Las+Heras+1000,+B1622AKN+Dique+Luj%C3%A1n,+Provincia+de+Buenos+Aires/@-34.3635156,-58.6889609,17z/data=!3m1!4b1!4m6!3m5!1s0x95bca08b67092def:0xb20c5c482c173b51!8m2!3d-34.3635201!4d-58.686386!16s%2Fg%2F11gr6b9pfd?entry=ttu&g_ep=EgoyMDI2MDYwOS4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#22288A] text-[#F2F2F2] px-6 py-3 rounded-lg font-semibold hover:bg-[#b81e31] transition-colors"
              >
                <MapPin className="w-5 h-5" />
                Ver en Google Maps
              </a>
            </div>
          </div>

          {/* Map */}
          <div className="relative h-[400px] bg-[#1a1d26] rounded-2xl overflow-hidden border border-[#D4243A]/30">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3293.487642307125!2d-58.68896092354737!3d-34.36351564485376!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bca08b67092def%3A0xb20c5c482c173b51!2sLas%20Heras%201000%2C%20B1622AKN%20Dique%20Luj%C3%A1n%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1781219090276!5m2!1ses-419!2sar"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de Team Rayo - Las Heras 1000"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}