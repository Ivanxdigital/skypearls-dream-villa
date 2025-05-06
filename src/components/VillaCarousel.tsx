import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

interface VillaImage {
  url: string;
  title: string;
  description: string;
}

interface VillaCarouselProps {
  images: VillaImage[];
  className?: string;
}

/**
 * VillaCarousel component for displaying an interactive image carousel
 * Features keyboard navigation, thumbnail selection, and smooth transitions
 */
const VillaCarousel: React.FC<VillaCarouselProps> = ({ images, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Scroll reveal animations
  const carouselReveal = useScrollReveal<HTMLDivElement>({ delay: 120 });
  const thumbsReveal = useScrollReveal<HTMLDivElement>({ delay: 240 });

  // Navigation handlers
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!images.length) return null;

  return (
    <div className={cn("space-y-4", className)}>
      <div ref={carouselReveal.ref} className="relative h-[400px] md:h-[500px] w-full rounded-lg overflow-hidden shadow-xl opacity-0">
        {images.map((image, index) => (
          <div 
            key={index}
            className={cn(
              "absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out",
              index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            aria-hidden={index !== currentIndex}
          >
            <div className="w-full h-full flex items-center justify-center rounded-lg overflow-hidden bg-skypearl-dark/5">
              <img 
                src={image.url} 
                alt={image.title} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-playfair text-white mb-2">{image.title}</h3>
              <p className="text-white/80 text-sm md:text-base">{image.description}</p>
            </div>
          </div>
        ))}
        
        <button 
          onClick={prevSlide}
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/20 hover:bg-white/40 transition-colors p-2 rounded-full text-white backdrop-blur-sm hover:scale-105 active:scale-95 duration-300"
          aria-label="Previous image"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        
        <button 
          onClick={nextSlide}
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/20 hover:bg-white/40 transition-colors p-2 rounded-full text-white backdrop-blur-sm hover:scale-105 active:scale-95 duration-300"
          aria-label="Next image"
        >
          <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        
        {/* Pagination dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors hover:scale-110 active:scale-95 duration-200",
                index === currentIndex ? "bg-white" : "bg-white/40"
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? "true" : "false"}
            />
          ))}
        </div>
      </div>
      
      {/* Thumbnails */}
      <div 
        ref={thumbsReveal.ref} 
        className="grid grid-cols-4 md:grid-cols-5 gap-2 opacity-0"
        role="tablist"
        aria-label="Image thumbnails"
      >
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "h-16 md:h-20 overflow-hidden rounded-md transition-all hover:scale-105 active:scale-95 duration-300",
              index === currentIndex ? "ring-2 ring-skypearl" : "opacity-70 hover:opacity-100"
            )}
            role="tab"
            aria-selected={index === currentIndex}
            aria-controls={`slide-${index}`}
            tabIndex={index === currentIndex ? 0 : -1}
          >
            <div className="w-full h-full overflow-hidden">
              <img 
                src={image.url} 
                alt={`Thumbnail for ${image.title}`}
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VillaCarousel; 