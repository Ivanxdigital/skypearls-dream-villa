import React from 'react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

const CommercialAreaSection = () => {
  const commercialAreas = [
    {
      title: "Café & Restaurant",
      description: "Enjoy gourmet dining and artisanal coffee without leaving your villa community. Our on-site café offers fresh, locally-sourced meals and specialty beverages.",
      image: "/images/commercial/cafe.WEBP",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
      )
    },
    {
      title: "Fitness Center",
      description: "Stay fit and healthy with our state-of-the-art gym facility featuring modern equipment and tropical views to enhance your workout experience.",
      image: "/images/commercial/gym.WEBP",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    },
    {
      title: "Ice Bath & Wellness",
      description: "Rejuvenate your body and mind with our dedicated wellness area featuring ice baths, perfect for recovery and enhancing your tropical lifestyle.",
      image: "/images/commercial/icebath.WEBP",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    }
  ];

  // Scroll reveal for section intro
  const introReveal = useScrollReveal<HTMLDivElement>({ delay: 0 });
  const statsReveal = useScrollReveal<HTMLDivElement>({ delay: 400 });

  return (
    <section id="commercial" className="section-padding bg-gradient-to-b from-skypearl-light/20 to-white">
      <div className="container mx-auto px-4">
        <div ref={introReveal.ref} className="text-center max-w-2xl mx-auto mb-8 md:mb-16 opacity-0">
          <span className="text-xs sm:text-sm font-medium text-skypearl uppercase tracking-wider">Commercial Amenities</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-semibold text-skypearl-dark mb-4 md:mb-6">Lifestyle Commercial Hub</h2>
          <p className="text-lg sm:text-xl font-playfair text-skypearl-dark/90 mb-6 md:mb-10">
            On-site amenities designed for convenience and wellness, all within your private villa community.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 md:mb-16">
          {commercialAreas.map((area, index) => {
            const cardReveal = useScrollReveal<HTMLDivElement>({ delay: 100 + index * 100 });
            return (
              <div 
                key={index}
                ref={cardReveal.ref}
                className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] md:hover:translate-y-[-5px] opacity-0 overflow-hidden"
              >
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={area.image} 
                    alt={`${area.title} - Premium commercial amenity at Skypearls Dream Villa Siargao`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="p-4 md:p-6">
                  <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                    <div className="text-skypearl">
                      {React.cloneElement(area.icon, { className: 'h-6 w-6 md:h-8 md:w-8 hover:animate-wiggle transition-all duration-300' })}
                    </div>
                    <h3 className="text-lg md:text-xl font-playfair font-medium">{area.title}</h3>
                  </div>
                  <p className="text-sm md:text-base text-skypearl-dark/70 leading-relaxed">{area.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Property Stats Section */}
        <div ref={statsReveal.ref} className="text-center opacity-0">
          <div className="bg-skypearl-dark text-white rounded-lg p-6 md:p-8 max-w-3xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-playfair mb-4 md:mb-6">Property Development Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-playfair font-bold text-skypearl mb-2">1,000</p>
                <p className="text-xs sm:text-sm text-white/80 uppercase tracking-wider">Total Lot Area (sqm)</p>
              </div>
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-playfair font-bold text-skypearl mb-2">300</p>
                <p className="text-xs sm:text-sm text-white/80 uppercase tracking-wider">Commercial Area (sqm)</p>
              </div>
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-playfair font-bold text-skypearl mb-2">700</p>
                <p className="text-xs sm:text-sm text-white/80 uppercase tracking-wider">Residential Area (sqm)</p>
              </div>
            </div>
            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/20">
              <p className="text-sm md:text-base text-white/90 leading-relaxed">
                Our carefully planned development maximizes both private living space and community amenities, 
                creating the perfect balance of luxury and convenience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommercialAreaSection;