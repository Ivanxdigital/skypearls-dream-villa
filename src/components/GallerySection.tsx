import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { villas } from '@/data/villas';
import VillaTabs from './VillaTabs';
import VillaSelect from './VillaSelect';
import VillaCarousel from './VillaCarousel';
import VillaDetailsCard from './VillaDetailsCard';

/**
 * GallerySection component
 * A data-driven gallery that showcases multiple villas with specs and an image carousel
 */
const GallerySection: React.FC = () => {
  const [currentVillaIndex, setCurrentVillaIndex] = useState(0);
  const currentVilla = villas[currentVillaIndex];
  
  // Scroll reveal for section intro
  const introReveal = useScrollReveal<HTMLDivElement>({ delay: 0 });

  return (
    <section id="gallery" className="section-padding bg-skypearl-dark/5">
      <div className="container mx-auto px-4">
        {/* Section Introduction */}
        <div ref={introReveal.ref} className="text-center max-w-2xl mx-auto mb-12 md:mb-16 opacity-0">
          <span className="text-sm font-medium text-skypearl uppercase tracking-wider">Gallery</span>
          <h2 className="section-title">Experience Our Villas</h2>
          <p className="section-subtitle">
            Take a virtual tour of our meticulously designed villas and explore their features.
          </p>
        </div>
        
        {/* Villa Selection */}
        <div className="mb-8">
          {/* Desktop - Tabs */}
          <div className="hidden md:block">
            <VillaTabs 
              villas={villas} 
              currentVilla={currentVillaIndex} 
              onVillaChange={setCurrentVillaIndex} 
            />
          </div>
          
          {/* Mobile - Dropdown Select */}
          <div className="block md:hidden">
            <VillaSelect 
              villas={villas} 
              currentVilla={currentVillaIndex} 
              onVillaChange={setCurrentVillaIndex} 
            />
          </div>
        </div>
        
        {/* Villa Content - Split View on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Carousel Side */}
          <VillaCarousel images={currentVilla.images} />
          
          {/* Details Side */}
          <VillaDetailsCard villa={currentVilla} />
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
