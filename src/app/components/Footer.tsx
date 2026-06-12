import { Instagram, MapPin, Phone } from "lucide-react";
import logoImg from "../../imports/logo.jpeg";

export function Footer() {
  return (
    <footer className="bg-[#0d1016] border-t border-[#22288A]/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 mb-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src={logoImg}
                alt="Team Rayo"
                className="h-10 w-10 object-contain rounded-full"
              />
              <span className="text-[#F2F2F2] text-2xl font-bold">
                Team Rayo
              </span>
            </div>
            <p className="text-gray-400">
              No es solo entrenamiento, es un estilo de vida.
              Fuerza, disciplina y respeto para todos.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[#F2F2F2] font-semibold text-lg mb-4">
              Contacto
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-[#D4243A] flex-shrink-0 mt-0.5" />
                <span>
                  Las Heras 1000 (arriba de Sociedad de Fomento)
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-[#D4243A] flex-shrink-0" />
                <a
                  href="https://wa.me/5491157234518"
                  className="hover:text-[#D4243A] transition-colors"
                >
                  +54 9 11 5723-4518
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Instagram className="w-5 h-5 text-[#D4243A] flex-shrink-0" />
                <a
                  href="https://instagram.com/teamrayo31"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4243A] transition-colors"
                >
                  @teamrayo31
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#F2F2F2] font-semibold text-lg mb-4">
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
                  className="block text-gray-400 hover:text-[#D4243A] transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#22288A]/30 pt-8 text-center">
          <p className="text-gray-500">
            © 2026 Team Rayo. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}