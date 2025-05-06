import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import BrandLogo from './BrandLogo';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation variants for the mobile menu
  const drawerVariants = {
    closed: { x: "100%" },
    open: { x: 0 }
  };

  const fadeInVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.05 * custom,
        duration: 0.5
      }
    })
  };

  return (
    <nav 
      className={cn(
        'fixed w-full z-50 transition-all duration-300',
        (scrolled || mobileMenuOpen)
          ? 'bg-white shadow-lg border-b border-gray-200 py-4' 
          : 'bg-gradient-to-b from-[#E5DDD0]/50 to-transparent backdrop-blur-sm py-6'
      )}
    >
      <div className="container mx-auto flex justify-between items-center px-4">
        <a href="#" className="flex items-center">
          <BrandLogo className={scrolled ? 'text-skypearl-dark' : 'text-nav-text-light'} />
        </a>
        
        <div className="hidden md:flex space-x-8 items-center">
          <a 
            href="#about" 
            className={cn(
              "transition-colors relative before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:scale-x-0 before:origin-left hover:before:scale-x-100 before:bg-skypearl before:transition-transform duration-300",
              scrolled 
                ? "text-nav-text-dark hover:text-skypearl" 
                : "text-nav-text-light hover:text-skypearl"
            )}
          >
            About
          </a>
          <a 
            href="#features" 
            className={cn(
              "transition-colors relative before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:scale-x-0 before:origin-left hover:before:scale-x-100 before:bg-skypearl before:transition-transform duration-300",
              scrolled 
                ? "text-nav-text-dark hover:text-skypearl" 
                : "text-nav-text-light hover:text-skypearl"
            )}
          >
            Smart Features
          </a>
          <a 
            href="#amenities" 
            className={cn(
              "transition-colors relative before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:scale-x-0 before:origin-left hover:before:scale-x-100 before:bg-skypearl before:transition-transform duration-300",
              scrolled 
                ? "text-nav-text-dark hover:text-skypearl" 
                : "text-nav-text-light hover:text-skypearl"
            )}
          >
            Amenities
          </a>
          <a 
            href="#gallery" 
            className={cn(
              "transition-colors relative before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:scale-x-0 before:origin-left hover:before:scale-x-100 before:bg-skypearl before:transition-transform duration-300",
              scrolled 
                ? "text-nav-text-dark hover:text-skypearl" 
                : "text-nav-text-light hover:text-skypearl"
            )}
          >
            Gallery
          </a>
          <a 
            href="#investment" 
            className={cn(
              "transition-colors relative before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:scale-x-0 before:origin-left hover:before:scale-x-100 before:bg-skypearl before:transition-transform duration-300",
              scrolled 
                ? "text-nav-text-dark hover:text-skypearl" 
                : "text-nav-text-light hover:text-skypearl"
            )}
          >
            Investment
          </a>
          <a 
            href="#contact" 
            className={cn(
              "button-primary transition-colors",
              scrolled 
                ? "bg-skypearl" 
                : "bg-skypearl/90"
            )}
          >
            Contact Us
          </a>
        </div>
        
        <button 
          className={cn(
            "md:hidden transition-colors flex items-center justify-center z-50",
            scrolled ? "text-nav-text-dark" : "text-nav-text-light",
            mobileMenuOpen && "text-nav-text-dark"
          )}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden fixed inset-0 bg-white shadow-xl z-60 flex flex-col p-6 pt-24"
            initial="closed"
            animate="open"
            exit="closed"
            variants={drawerVariants}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            <div className="flex flex-col space-y-6">
              <motion.a 
                custom={1}
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                href="#about" 
                className="text-nav-text-dark hover:text-skypearl transition-colors text-xl font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </motion.a>
              <motion.a 
                custom={2}
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                href="#features" 
                className="text-nav-text-dark hover:text-skypearl transition-colors text-xl font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Smart Features
              </motion.a>
              <motion.a 
                custom={3}
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                href="#amenities" 
                className="text-nav-text-dark hover:text-skypearl transition-colors text-xl font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Amenities
              </motion.a>
              <motion.a 
                custom={4}
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                href="#gallery" 
                className="text-nav-text-dark hover:text-skypearl transition-colors text-xl font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Gallery
              </motion.a>
              <motion.a 
                custom={5}
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                href="#investment" 
                className="text-nav-text-dark hover:text-skypearl transition-colors text-xl font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Investment
              </motion.a>
              <motion.a 
                custom={6}
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                href="#contact" 
                className="button-primary bg-skypearl inline-block text-center mt-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
