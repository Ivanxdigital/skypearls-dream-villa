
import React from 'react';

const LocationSection = () => {
  return (
    <section id="location" className="section-padding bg-skypearl-dark text-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
          <span className="text-sm font-medium text-skypearl uppercase tracking-wider">Prime Location</span>
          <h2 className="section-title text-white">Siargao, Philippines</h2>
          <p className="text-xl text-white/80 mb-10 font-light">
            Located in the heart of the surfing capital of the Philippines, Skypearls Villas
            offers the perfect blend of convenience and natural beauty.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-3 h-[400px] rounded-lg overflow-hidden shadow-lg animate-fade-in">
            {/* Google Maps embed would go here */}
            <div className="w-full h-full bg-skypearl-dark/50 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
                alt="Siargao Island" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="lg:col-span-2 animate-fade-in">
            <h3 className="text-2xl font-playfair mb-6">Nearby Attractions</h3>
            
            <div className="space-y-4">
              <div className="flex items-center border-b border-white/20 pb-4">
                <div className="w-12 h-12 bg-skypearl flex items-center justify-center rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Cloud 9 Surf Break</h4>
                  <p className="text-white/70">10 minutes drive</p>
                </div>
              </div>
              
              <div className="flex items-center border-b border-white/20 pb-4">
                <div className="w-12 h-12 bg-skypearl flex items-center justify-center rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Sayak Airport</h4>
                  <p className="text-white/70">5 minutes drive</p>
                </div>
              </div>
              
              <div className="flex items-center border-b border-white/20 pb-4">
                <div className="w-12 h-12 bg-skypearl flex items-center justify-center rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium mb-1">General Luna Town</h4>
                  <p className="text-white/70">15 minutes drive</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-skypearl flex items-center justify-center rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Sugba Lagoon</h4>
                  <p className="text-white/70">30 minutes drive + boat</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
