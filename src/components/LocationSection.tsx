import React from 'react';
import { nearbyLocations } from '@/data/locations';
import LocationCard from '@/components/ui/LocationCard';

const LocationSection = () => {
  return (
    <section id="location" className="section-padding bg-skypearl-dark text-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <span className="text-sm font-medium text-skypearl uppercase tracking-wider">Perfectly Positioned</span>
          <h2 className="section-title text-white">Life in Paradise</h2>
          <p className="text-xl text-white/80 mb-10 font-light leading-relaxed">
            Nestled in the serene Del Carmen area of Siargao, our luxury villas offer the perfect escape 
            from the ordinary. Just one minute from Sayak Airport and thirty minutes from the world-famous 
            Cloud 9 surf break, you'll enjoy the best of both worlds - tranquil island living with easy 
            access to Siargao's most coveted destinations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Keep YouTube video on the left */}
          <div className="lg:col-span-3 h-auto lg:h-[400px] rounded-lg overflow-hidden shadow-lg animate-fade-in">
            <div className="relative w-full aspect-video bg-skypearl-dark/50">
              <iframe
                className="absolute inset-0 w-full h-full rounded-lg"
                src="https://www.youtube.com/embed/lVsG-Xc0tSE"
                title="Siargao, Philippines - Nathaniel Polta"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <div className="mt-1 text-xs text-white/60 text-right px-2">
              Video by <a href="https://www.youtube.com/@nathanielpolta" target="_blank" rel="noopener noreferrer" className="underline hover:text-skypearl transition-colors">Nathaniel Polta</a> on <a href="https://www.youtube.com/watch?v=lVsG-Xc0tSE" target="_blank" rel="noopener noreferrer" className="underline hover:text-skypearl transition-colors">YouTube</a>
            </div>
          </div>

          {/* New Location List on the right */}
          <div className="lg:col-span-2 animate-fade-in">
            <h3 className="text-2xl font-playfair mb-6">Your Siargao Adventures Await</h3>

            {/* Responsive grid for locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nearbyLocations.map((location) => (
                <LocationCard key={location.name} location={location} />
              ))}
            </div>
            {/* Optional: Add a note about travel times if needed */}
            {/* <p className="text-xs text-white/50 mt-4 italic">Travel times are approximate and may vary.</p> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
