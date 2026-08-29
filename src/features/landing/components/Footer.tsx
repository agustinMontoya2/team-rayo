import { Instagram, MapPin, Phone } from "lucide-react";
import logoImg from "/assets/logo.webp";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-pulso-line py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 mb-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logoImg}
                alt="Team Rayo"
                className="w-10 h-10 object-cover rounded-xl"
              />
              <span className="text-foreground text-2xl font-extrabold tracking-tight">
                Team Rayo
              </span>
            </div>
            <p className="text-muted-foreground">
              No es solo entrenamiento, es un estilo de vida.
              Fuerza, disciplina y respeto para todos.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-foreground font-semibold text-lg mb-4">
              Contacto
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-pulso-red flex-shrink-0 mt-0.5" />
                <span>
                  Las Heras 1000 (arriba de Sociedad de Fomento)
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-pulso-red flex-shrink-0" />
                <a
                  href="https://wa.me/5491157234518"
                  className="hover:text-pulso-red transition-colors"
                >
                  +54 9 11 5723-4518
                </a>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Instagram className="w-5 h-5 text-pulso-red flex-shrink-0" />
                <a
                  href="https://instagram.com/teamrayo31"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pulso-red transition-colors"
                >
                  @teamrayo31
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-foreground font-semibold text-lg mb-4">
              Links rápidos
            </h3>
            <div className="space-y-2">
              {[
                { label: "Planes y precios", id: "plans" },
                { label: "Horarios", id: "schedule" },
                { label: "Preguntas frecuentes", id: "faq" },
                { label: "Cómo llegar", id: "location" },
              ].map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() =>
                    document
                      .getElementById(id)
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="block text-muted-foreground hover:text-pulso-red transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-pulso-line pt-8 text-center">
          <p className="text-muted-foreground/60">
            © 2026 Team Rayo. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
