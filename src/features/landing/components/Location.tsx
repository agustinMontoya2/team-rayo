import { MapPin } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { ADDRESS_STREET, ADDRESS_NEIGHBORHOOD, VENUE, MAPS_LINK_URL, MAPS_EMBED_URL } from "../constants";

export function Location() {
  return (
    <section id="location" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading>
          Dónde <span className="text-pulso-indigo">estamos</span>
        </SectionHeading>
        <p className="font-mono text-pulso-red uppercase text-xs tracking-[.16em] text-center mb-12">UBICACIÓN</p>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-pulso-red mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-foreground font-semibold text-xl mb-2">
                  Dirección
                </h3>
                <p className="text-muted-foreground">
                  {ADDRESS_STREET} · {ADDRESS_NEIGHBORHOOD}
                </p>
                <p className="text-muted-foreground/60 text-sm mt-1">
                  {VENUE}
                </p>
              </div>
            </div>

            <div className="bg-card border border-pulso-line rounded-xl p-6 shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)]">
              <p className="text-muted-foreground italic text-lg leading-relaxed">
                "No importa de dónde venís. Importa a dónde
                vas."
              </p>
            </div>

            <div className="pt-2">
              <a
                href={MAPS_LINK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-pulso-red text-[#16040A] px-6 py-3 rounded-xl font-bold hover:bg-foreground hover:text-background transition-colors min-h-[44px]"
              >
                <MapPin className="w-5 h-5" />
                Ver en Google Maps
              </a>
            </div>
          </div>

          {/* Map */}
          <div className="relative h-[400px] bg-card rounded-2xl overflow-hidden border border-pulso-line shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)]">
            <iframe
              src={MAPS_EMBED_URL}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Ubicación de Team Rayo - ${ADDRESS_STREET}`}
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
