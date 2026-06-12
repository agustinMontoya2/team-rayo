import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Gallery() {
  const images = [
    {
      url: "https://images.unsplash.com/photo-1546711076-85a7923432ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBzcGFycmluZyUyMHJpbmd8ZW58MXx8fHwxNzgxMjE1MjY5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Sparring en el ring",
    },
    {
      url: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBnbG92ZXMlMjB3b3Jrb3V0fGVufDF8fHx8MTc4MTIxNTI2OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Entrenamiento con guantes",
    },
    {
      url: "https://images.unsplash.com/photo-1606335543042-57c525922933?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBoZWF2eSUyMGJhZyUyMHRyYWluaW5nfGVufDF8fHx8MTc4MTIxNTI2OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Trabajo en bolsa pesada",
    },
    {
      url: "https://images.unsplash.com/photo-1607702713064-0143212236ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRlJTIwYm94aW5nJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzgxMjE1MjY5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Atleta entrenando",
    },
  ];

  return (
    <section id="gallery" className="py-20 bg-[#0d1016]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-[#F2F2F2] mb-4">
          Así <span className="text-[#22288A]">entrenamos</span>
        </h2>
        <p className="text-center text-gray-400 mb-16 text-lg">
          Mirá el día a día en Team Rayo
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-xl aspect-video"
            >
              <ImageWithFallback
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111318]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">
            ¿Querés ver más de nuestro entrenamiento?
          </p>
          <a
            href="https://instagram.com/teamrayo31"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#22288A] hover:text-[#b81e31] transition-colors font-semibold"
          >
            Seguinos en @teamrayo31 →
          </a>
        </div>
      </div>
    </section>
  );
}