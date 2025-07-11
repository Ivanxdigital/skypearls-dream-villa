import React from 'react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

const AmenitiesSection = () => {
  // Scroll reveal for section intro and image
  const introReveal = useScrollReveal<HTMLDivElement>({ delay: 0 });
  const imageReveal = useScrollReveal<HTMLDivElement>({ delay: 300 });
  // Staggered amenities
  const amenity1Reveal = useScrollReveal<HTMLDivElement>({ delay: 100 });
  const amenity2Reveal = useScrollReveal<HTMLDivElement>({ delay: 200 });
  const amenity3Reveal = useScrollReveal<HTMLDivElement>({ delay: 300 });
  const amenity4Reveal = useScrollReveal<HTMLDivElement>({ delay: 400 });

  return (
    <section id="amenities" className="section-padding bg-skypearl-white relative">
      {/* Decorative element */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-skypearl opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="container mx-auto px-4">
        <div ref={introReveal.ref} className="text-center max-w-2xl mx-auto mb-16 opacity-0">
          <span className="text-sm font-medium text-skypearl uppercase tracking-wider">Luxury Living</span>
          <h2 className="section-title">Premium Amenities</h2>
          <p className="section-subtitle">
            Skypearls Villas offers an array of premium amenities designed for comfort, relaxation, and entertainment.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
          <div className="grid grid-cols-1 gap-6">
            <div ref={amenity1Reveal.ref} className="flex items-start gap-4 opacity-0">
              <div className="bg-skypearl p-3 rounded-full text-white hover:animate-pulse transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-playfair mb-2">Private Infinity Pool</h3>
                <p className="text-skypearl-dark/70">
                  Each villa features its own infinity-edge pool with stunning views of the surrounding landscape.
                </p>
              </div>
            </div>
            <div ref={amenity2Reveal.ref} className="flex items-start gap-4 opacity-0">
              <div className="bg-skypearl p-3 rounded-full text-white hover:animate-pulse transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-playfair mb-2">Dedicated Guest House</h3>
                <p className="text-skypearl-dark/70">
                  A separate guest house provides privacy for visitors while maintaining access to all villa amenities.
                </p>
              </div>
            </div>
            <div ref={amenity3Reveal.ref} className="flex items-start gap-4 opacity-0">
              <div className="bg-skypearl p-3 rounded-full text-white hover:animate-pulse transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-playfair mb-2">Outdoor Kitchen</h3>
                <p className="text-skypearl-dark/70">
                  Entertain in style with a fully-equipped outdoor kitchen and dining area perfect for tropical evenings.
                </p>
              </div>
            </div>
            <div ref={amenity4Reveal.ref} className="flex items-start gap-4 opacity-0">
              <div className="bg-skypearl p-3 rounded-full text-white hover:animate-pulse transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-playfair mb-2">Backup Generator</h3>
                <p className="text-skypearl-dark/70">
                  Ensure uninterrupted power with our automatic backup generator system for peace of mind.
                </p>
              </div>
            </div>
          </div>
          
          <div ref={imageReveal.ref} className="relative opacity-0">
            <img 
              src="/images/amenities/pool.png" 
              alt="Private infinity pool with tropical landscaping at luxury Siargao villa, featuring crystal clear water and modern poolside design" 
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
            <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded shadow-lg max-w-[200px]">
              <p className="font-playfair text-lg mb-1">Built for</p>
              <p className="text-3xl font-bold text-skypearl-dark">Luxury Living</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AmenitiesSection;
