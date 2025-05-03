
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Hero = () => {
  return (
    <div className="relative h-screen w-full bg-skypearl-dark overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-skypearl-dark/60 to-transparent" />
      
      <div className="relative h-full flex flex-col items-start justify-center container mx-auto px-4 md:px-12 z-10">
        <div className="max-w-xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white mb-4">
            Luxury Smart Villas
            <br />
            <span className="text-skypearl">in Paradise</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 font-light">
            Experience modern luxury living in Siargao's most exclusive 
            smart villa development. Where tropical beauty meets cutting-edge technology.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="#contact" 
              className={cn(
                "button-primary bg-skypearl flex items-center justify-center gap-2",
                "hover:bg-skypearl hover:bg-opacity-90"
              )}
            >
              Schedule a Private Viewing
              <ArrowRight className="w-4 h-4" />
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
    </div>
  );
};

export default Hero;
