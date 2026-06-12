import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Coach } from './components/Coach';
import { Plans } from './components/Plans';
import { Gallery } from './components/Gallery';
import { Schedule } from './components/Schedule';
import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';
import { Location } from './components/Location';
import { Footer } from './components/Footer';
import { FloatingButtons } from './components/FloatingButtons';

export default function App() {
  return (
    <div className="min-h-screen bg-[#111318]">{/* MARKER-MAKE-KIT-INVOKED */}
      <Navbar />
      <Hero />
      <Coach />
      <Plans />
      <Gallery />
      <Schedule />
      <Testimonials />
      <FAQ />
      <Location />
      <Footer />
      <FloatingButtons />
    </div>
  );
}
