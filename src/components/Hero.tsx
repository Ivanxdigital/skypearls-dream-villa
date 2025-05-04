import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const Hero = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      if (position > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background image with parallax zoom effect */}
      <div 
        data-scroll={scrolled ? "on" : "off"}
        className="absolute inset-0 transform scale-100 data-[scroll=on]:scale-105 transition-transform duration-[7000ms]"
      >
        <img
          src="/hero-section-villa.jpg"
          alt="Luxury villa in Siargao"
          className="w-full h-full object-cover object-center"
        />
      </div>
      
      {/* Global dim overlay */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Nav-scrim overlay for improved navbar text contrast */}
      <div className="absolute top-0 inset-x-0 h-24 bg-nav-scrim z-10 pointer-events-none" />
      
      {/* Warm sand overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#E5DDD0]/70 to-transparent" />
      
      {/* Content container */}
      <div className="relative z-10 flex h-full items-center container mx-auto px-6">
        <div className="max-w-xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white mb-4 drop-shadow-lg">
            Luxury Smart Villas
            <br />
            <span className="text-skypearl">in Paradise</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 font-light drop-shadow-sm">
            Experience modern luxury living in Siargao's most exclusive 
            smart villa development. Where tropical beauty meets cutting-edge technology.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="#contact" 
              className={cn(
                "button-primary bg-skypearl flex items-center justify-center gap-2 relative overflow-hidden",
                "hover:bg-skypearl hover:bg-opacity-90 group"
              )}
            >
              <span className="relative z-10">Schedule a Private Viewing</span>
              <ArrowRight className="w-4 h-4 relative z-10" />
              {/* Gold shimmer effect */}
              <div className="absolute inset-0 w-3 -left-10 bg-gradient-to-r from-transparent via-[#D4B883] to-transparent group-hover:animate-shimmer" />
            </a>
            <a 
              href="#gallery"
              className="px-6 py-3 border border-white/30 text-white hover:bg-white/10 transition-all text-center"
            >
              View Gallery
            </a>
          </div>
        </div>
      </div>

      {/* Animated scroll cue */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center">
        <p className="text-white text-sm mb-2 opacity-80 drop-shadow-sm">Scroll to explore</p>
        <div className="animate-bounce">
          <ChevronDown className="w-6 h-6 text-white opacity-80" />
        </div>
      </div>
    </div>
  );
};

export default Hero;
