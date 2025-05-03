
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
          : 'bg-transparent py-6'
      )}
    >
      <div className="container mx-auto flex justify-between items-center px-4">
        <a href="#" className="text-2xl font-playfair font-bold text-skypearl-dark">
          SkyPearls<span className="text-skypearl">.</span>
        </a>
        
        <div className="hidden md:flex space-x-8 items-center">
          <a 
            href="#about" 
            className="text-skypearl-dark hover:text-skypearl transition-colors"
          >
            About
          </a>
          <a 
            href="#features" 
            className="text-skypearl-dark hover:text-skypearl transition-colors"
          >
            Smart Features
          </a>
          <a 
            href="#amenities" 
            className="text-skypearl-dark hover:text-skypearl transition-colors"
          >
            Amenities
          </a>
          <a 
            href="#gallery" 
            className="text-skypearl-dark hover:text-skypearl transition-colors"
          >
            Gallery
          </a>
          <a 
            href="#investment" 
            className="text-skypearl-dark hover:text-skypearl transition-colors"
          >
            Investment
          </a>
          <a 
            href="#contact" 
            className="button-primary"
          >
            Contact Us
          </a>
        </div>
        
        <button 
          className="md:hidden text-skypearl-dark"
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
              className="text-skypearl-dark hover:text-skypearl transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
            <a 
              href="#features" 
              className="text-skypearl-dark hover:text-skypearl transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Smart Features
            </a>
            <a 
              href="#amenities" 
              className="text-skypearl-dark hover:text-skypearl transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Amenities
            </a>
            <a 
              href="#gallery" 
              className="text-skypearl-dark hover:text-skypearl transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gallery
            </a>
            <a 
              href="#investment" 
              className="text-skypearl-dark hover:text-skypearl transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Investment
            </a>
            <a 
              href="#contact" 
              className="button-primary inline-block text-center"
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
