import { ImageWithFallback } from "./figma/ImageWithFallback";
import image1 from "/assets/gallery-image1.webp"
import image2 from "/assets/gallery-image2.webp"
import image3 from "/assets/gallery-image3.webp"
import image4 from "/assets/gallery-image4.webp"

export function Gallery() {
  const images = [
    {
      url: image1,
      alt: "Sparring en el ring",
    },
    {
      url: image2,
      alt: "Entrenamiento con guantes",
    },
    {
      url: image3,
      alt: "Trabajo en bolsa pesada",
    },
    {
      url: image4,
      alt: "Atleta entrenando",
    },
  ];

  return (
    <section id="gallery" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-foreground mb-4 tracking-tight">
          Así <span className="text-pulso-red">entrenamos</span>
        </h2>
        <p className="font-mono text-pulso-red uppercase text-xs tracking-[.16em] text-center mb-16">GALERÍA</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-2xl aspect-video"
            >
              <ImageWithFallback
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pulso-bg/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            ¿Querés ver más de nuestro entrenamiento?
          </p>
          <a
            href="https://instagram.com/teamrayo31"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-pulso-indigo hover:text-pulso-indigo/80 transition-colors font-semibold"
          >
            Seguinos en @teamrayo31 →
          </a>
        </div>
      </div>
    </section>
  );
}
