import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

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

  return (
    <nav 
      className={cn(
        'fixed w-full z-50 transition-all duration-300',
        scrolled 
          ? 'bg-white shadow-md py-4' 
          : 'bg-nav-scrim backdrop-blur-md shadow-sm py-6'
      )}
    >
      <div className="container mx-auto flex justify-between items-center px-4">
        <a href="#" className={cn(
          "text-2xl font-playfair font-bold transition-colors",
          scrolled ? "text-skypearl-dark" : "text-nav-text-light"
        )}>
          SkyPearls<span className="text-skypearl">.</span>
        </a>
        
        <div className="hidden md:flex space-x-8 items-center">
          <a 
            href="#about" 
            className={cn(
              "transition-colors",
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
              "transition-colors",
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
              "transition-colors",
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
              "transition-colors",
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
              "transition-colors",
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
            "md:hidden transition-colors",
            scrolled ? "text-nav-text-dark" : "text-nav-text-light"
          )}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            className="w-6 h-6"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
            />
          </svg>
        </button>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden bg-white w-full py-4 px-4 shadow-lg">
          <div className="flex flex-col space-y-4">
            <a 
              href="#about" 
              className="text-nav-text-dark hover:text-skypearl transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
            <a 
              href="#features" 
              className="text-nav-text-dark hover:text-skypearl transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Smart Features
            </a>
            <a 
              href="#amenities" 
              className="text-nav-text-dark hover:text-skypearl transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Amenities
            </a>
            <a 
              href="#gallery" 
              className="text-nav-text-dark hover:text-skypearl transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gallery
            </a>
            <a 
              href="#investment" 
              className="text-nav-text-dark hover:text-skypearl transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Investment
            </a>
            <a 
              href="#contact" 
              className="button-primary bg-skypearl inline-block text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
