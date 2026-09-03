import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Coach } from './components/Coach';
import { Plans } from './components/Plans';
import { Gallery } from './components/Gallery';
import { Schedule } from './components/Schedule';
import { FAQ } from './components/FAQ';
import { Location } from './components/Location';
import { Footer } from './components/Footer';
import { FloatingButtons } from './components/FloatingButtons';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-pulso-red focus:text-[#16040A] focus:px-4 focus:py-2 focus:rounded-xl focus:font-bold"
      >
        Saltar al contenido principal
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <Coach />
        <Plans />
        <Gallery />
        <Schedule />
        <FAQ />
        <Location />
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}
