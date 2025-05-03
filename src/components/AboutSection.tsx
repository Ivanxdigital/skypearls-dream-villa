
import React from 'react';

const AboutSection = () => {
  return (
    <section id="about" className="section-padding bg-skypearl-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in">
            <span className="text-sm font-medium text-skypearl uppercase tracking-wider">About</span>
            <h2 className="section-title">Welcome to Skypearls Villas</h2>
            <p className="text-lg text-skypearl-dark/80 mb-6">
              Situated in the pristine shores of Siargao Island, Philippines, Skypearls Villas represents
              the pinnacle of modern tropical luxury living. Each villa is thoughtfully designed to blend seamlessly
              with the natural beauty of the island while offering the convenience of smart-home technology.
            </p>
            <p className="text-lg text-skypearl-dark/80 mb-6">
              Our airport-facing location offers both convenience and breathtaking views, making Skypearls
              the perfect investment for those seeking a tranquil escape or lucrative rental opportunity.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="text-center p-6 bg-white shadow-sm">
                <h3 className="font-playfair text-xl mb-2">Smart Living</h3>
                <p className="text-skypearl-dark/70">Cutting-edge technology integrated throughout</p>
              </div>
              <div className="text-center p-6 bg-white shadow-sm">
                <h3 className="font-playfair text-xl mb-2">Prime Location</h3>
                <p className="text-skypearl-dark/70">Minutes from airport and famous surf spots</p>
              </div>
              <div className="text-center p-6 bg-white shadow-sm">
                <h3 className="font-playfair text-xl mb-2">Sustainable</h3>
                <p className="text-skypearl-dark/70">Solar-powered with eco-friendly design elements</p>
              </div>
            </div>
          </div>
          <div className="relative h-full min-h-[400px] animate-fade-in">
            <img 
              src="https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80" 
              alt="Skypearls Villa Exterior" 
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
            <div className="absolute -bottom-6 -right-6 bg-skypearl p-6 rounded-lg shadow-lg">
              <p className="text-white font-playfair text-lg">Pre-selling units available now</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
