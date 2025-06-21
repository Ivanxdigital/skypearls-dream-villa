import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.23, 1, 0.32, 1]
      }
    }
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      {/* Background image with optimized parallax */}
      <motion.div 
        className="absolute inset-0"
        initial={{ scale: 1.05 }}
        animate={{ scale: scrolled ? 1.08 : 1.05 }}
        transition={{ duration: 6, ease: "easeOut" }}
      >
        <img
          src="/hero-section-villa.jpg"
          alt="Pre-selling luxury smart villa with infinity pool in Siargao island paradise"
          className="w-full h-full object-cover object-center"
        />
      </motion.div>
      
      {/* Simplified overlay system for mobile clarity */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/40" />
      
      {/* Top gradient for navbar integration */}
      <div className="absolute top-0 inset-x-0 h-32 sm:h-40 bg-gradient-to-b from-black/50 to-transparent z-10 pointer-events-none" />
      
      {/* Responsive luxury content container */}
      <div className="relative z-10 flex h-full items-center justify-center lg:justify-start px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="w-full max-w-lg sm:max-w-2xl lg:max-w-5xl xl:max-w-6xl lg:w-2/3">
          {/* Enhanced glass morphism backdrop for luxury feel */}
          <div className="hidden sm:block lg:hidden absolute inset-0 -mx-8 -my-12 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10" />
          <div className="hidden lg:block absolute inset-0 -mx-12 -my-16 bg-white/8 backdrop-blur-md rounded-3xl border border-white/15" />
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 text-center lg:text-left"
          >
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-playfair font-bold text-white mb-4 sm:mb-6 lg:mb-8 leading-tight tracking-wide drop-shadow-lg"
            >
              Your Dream Villa Awaits
              <br />
              <span className="text-skypearl">in Siargao</span>
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl xl:text-2xl text-white/90 mb-8 sm:mb-10 lg:mb-12 font-light leading-relaxed drop-shadow-md max-w-2xl lg:max-w-3xl"
            >
              Discover exclusive pre-selling luxury villas in the heart of Siargao's paradise. 
              Modern smart homes with infinity pools, just 30 minutes from world-famous Cloud 9.
            </motion.p>
          
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <motion.a 
                href="#contact" 
                className={cn(
                  "w-full sm:w-auto py-3 px-6 lg:py-3.5 lg:px-8 bg-skypearl text-white font-semibold text-base",
                  "flex items-center justify-center gap-2 relative overflow-hidden min-h-[44px]",
                  "hover:bg-skypearl/90 group hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out",
                  "rounded-md shadow-lg hover:shadow-xl"
                )}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">Schedule a Private Viewing</span>
                <ArrowRight className="w-5 h-5 relative z-10" />
                {/* Gold shimmer effect */}
                <div className="absolute inset-0 w-3 -left-10 bg-gradient-to-r from-transparent via-[#D4B883] to-transparent group-hover:animate-shimmer" />
              </motion.a>
              
              <motion.a 
                href="#gallery"
                className={cn(
                  "w-full sm:w-auto py-3 px-6 lg:py-3.5 lg:px-8 text-base font-medium min-h-[44px]",
                  "border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60",
                  "transition-all text-center relative overflow-hidden group rounded-md",
                  "backdrop-blur-sm hover:backdrop-blur-md"
                )}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">View Gallery</span>
                {/* Subtle shimmer on hover */}
                <div className="absolute inset-0 w-3 -left-10 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bulletproof centered scroll indicator */}
      <div className="absolute bottom-6 sm:bottom-8 inset-x-0 z-10 flex justify-center">
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <motion.p 
            className="text-white text-sm mb-3 opacity-90 drop-shadow-sm font-light whitespace-nowrap"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Scroll to explore
          </motion.p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
          >
            <ChevronDown className="w-5 h-5 text-white" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
