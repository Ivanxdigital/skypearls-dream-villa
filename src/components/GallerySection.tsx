import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

const GallerySection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const images = [
    {
      url: "/villa-anna-rendering-backside.png",
      title: "Private Poolside Retreat",
      description: "Tranquil evening ambiance featuring a cozy lounge area, a serene pool, and soft warm lighting."
    },
    {
      url: "/villa-anna-rendering-bedroom.png",
      title: "Serene Master Bedroom",
      description: "Earth-toned interiors with ambient lighting and lush garden views for restful nights."
    },
    {
      url: "/villa-anna-rendering-front.png",
      title: "Modern Desert-Inspired Façade",
      description: "Iconic front elevation blending minimal curves, natural textures, and a tropical backdrop."
    },
    {
      url: "/villa-anna-rendering-kitchen.png",
      title: "Open-Air Mediterranean Kitchen",
      description: "Chic SMEG fridge, soft arches, and natural light for a perfect blend of style and function."
    },
    {
      url: "/villa-anna-rendering-livingroom.png",
      title: "Warm Contemporary Living Room",
      description: "A cozy gathering space with built-in seating, arched windows, and golden hour lighting."
    }
  ];

  // Scroll reveal for section intro, carousel, and thumbnails
  const introReveal = useScrollReveal<HTMLDivElement>({ delay: 0 });
  const carouselReveal = useScrollReveal<HTMLDivElement>({ delay: 120 });
  const thumbsReveal = useScrollReveal<HTMLDivElement>({ delay: 240 });

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  return (
    <section id="gallery" className="section-padding bg-skypearl-dark/5">
      <div className="container mx-auto px-4">
        <div ref={introReveal.ref} className="text-center max-w-2xl mx-auto mb-16 opacity-0">
          <span className="text-sm font-medium text-skypearl uppercase tracking-wider">Gallery</span>
          <h2 className="section-title">Experience The Beauty</h2>
          <p className="section-subtitle">
            Take a virtual tour of our meticulously designed villas and their stunning surroundings.
          </p>
        </div>
        
        <div ref={carouselReveal.ref} className="relative h-[500px] md:h-[600px] w-full rounded-lg overflow-hidden shadow-xl opacity-0">
          {images.map((image, index) => (
            <div 
              key={index}
              className={cn(
                "absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out",
                index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <img 
                src={image.url} 
                alt={image.title} 
                className="w-full h-full object-contain bg-black"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                <h3 className="text-2xl font-playfair text-white mb-2">{image.title}</h3>
                <p className="text-white/80">{image.description}</p>
              </div>
            </div>
          ))}
          
          <button 
            onClick={prevSlide}
            className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/20 hover:bg-white/40 transition-colors p-2 rounded-full text-white backdrop-blur-sm hover:scale-105 active:scale-95 duration-300"
            aria-label="Previous image"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/20 hover:bg-white/40 transition-colors p-2 rounded-full text-white backdrop-blur-sm hover:scale-105 active:scale-95 duration-300"
            aria-label="Next image"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-colors hover:scale-110 active:scale-95 duration-200",
                  index === currentIndex ? "bg-white" : "bg-white/40"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        <div ref={thumbsReveal.ref} className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 opacity-0">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "h-24 overflow-hidden rounded-md transition-opacity hover:scale-105 active:scale-95 duration-300",
                index === currentIndex ? "ring-2 ring-skypearl" : "opacity-70 hover:opacity-100"
              )}
            >
              <img 
                src={image.url} 
                alt={image.title} 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
