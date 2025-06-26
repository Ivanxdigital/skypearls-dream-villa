import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import BrandLogo from './BrandLogo';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Instagram, MessageSquareText, Phone, MapPin } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);
  
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

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [mobileMenuOpen]);

  // Mobile menu animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren"
      }
    },
    exit: { // Added exit for backdrop consistency
      opacity: 0,
      transition: {
        duration: 0.3,
        when: "afterChildren" // Ensure drawer animates out first
      }
    }
  };

  const menuDrawerVariants = {
    hidden: { x: "100%", opacity: 0.8 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.45, // Slightly adjusted for feel
        ease: [0.32, 0.72, 0, 1],
        when: "beforeChildren"
      }
    },
    exit: {
      x: "100%",
      opacity: 0.8,
      transition: {
        duration: 0.35, // Slightly adjusted
        ease: [0.32, 0.72, 0, 1] // Consistent easing for exit
      }
    }
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.15 + 0.05 * custom, // Base delay + stagger (adjusted base delay)
        duration: 0.35,
        ease: "easeOut"
      }
    })
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav 
        className={cn(
          'fixed w-full z-50 border-b transition-all duration-300',
          (scrolled || mobileMenuOpen)
            ? 'bg-white/90 backdrop-blur-sm shadow-sm border-skypearl/30 py-4' 
            : 'bg-transparent border-transparent py-6'
        )}
      >
        <div className="container mx-auto flex justify-between items-center px-4">
          <a href="#" className="flex items-center">
            <BrandLogo className={scrolled || mobileMenuOpen ? 'text-skypearl-dark' : 'text-white drop-shadow-sm'} />
          </a>
          
          <div className="hidden md:flex space-x-8 items-center">
            <NavLink href="#about" scrolled={scrolled}>About</NavLink>
            <NavLink href="#features" scrolled={scrolled}>Smart Features</NavLink>
            <NavLink href="#amenities" scrolled={scrolled}>Amenities</NavLink>
            <NavLink href="#gallery" scrolled={scrolled}>Gallery</NavLink>
            <NavLink href="/property-for-sale-siargao" scrolled={scrolled}>Property for Sale</NavLink>
            <NavLink href="#investment" scrolled={scrolled}>Investment</NavLink>
            <a 
              href="#contact" 
              className={cn(
                "button-primary relative overflow-hidden group hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out",
                scrolled 
                  ? "bg-skypearl" 
                  : "bg-skypearl/90"
              )}
            >
              <span className="relative z-10">Contact Us</span>
              {/* Gold shimmer effect */}
              <div className="absolute inset-0 w-3 -left-10 bg-gradient-to-r from-transparent via-[#D4B883] to-transparent group-hover:animate-shimmer" />
            </a>
          </div>
          
          <button 
            className={cn(
              "md:hidden flex items-center justify-center z-[101] p-2 rounded-full transition-colors duration-300",
              mobileMenuOpen 
                ? "text-white bg-skypearl hover:bg-skypearl/90" 
                : (scrolled ? "text-nav-text-dark hover:bg-gray-200" : "text-white hover:bg-white/20 drop-shadow-sm")
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <AnimatePresence initial={false} mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="x"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>
      
      {/* Mobile menu overlay - separate from nav for better z-index control */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[99]" // Updated backdrop
            initial="hidden"
            animate="visible"
            exit="exit" // Use "exit" key from variants
            variants={overlayVariants}
            onClick={closeMobileMenu} // Close when clicking backdrop
          >
            <motion.div 
              className="fixed top-0 right-0 h-full w-[80vw] max-w-sm bg-gradient-to-b from-white to-[#F5F2EE] shadow-2xl flex flex-col" // skypearl-light placeholder #F5F2EE
              variants={menuDrawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit" // Use "exit" key from variants
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside the menu from closing it
            >
              {/* Animated Accent Line */}
              <motion.div
                className="absolute top-6 left-6 h-1 w-12 bg-skypearl" // 48px width
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1, transition: { delay: 0.3, duration: 0.4, ease: "easeOut" } }}
                exit={{ scaleX: 0, originX: 0, transition: { duration: 0.2, ease: "easeIn" } }}
              />
              
              <div className="flex flex-col pt-20 px-6 space-y-7 overflow-y-auto flex-grow"> {/* Added pt, px, overflow */}
                <motion.a 
                  custom={0} // 0-indexed for new variants
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  href="#about" 
                  className="text-nav-text-dark hover:text-skypearl transition-colors text-lg font-medium"
                  onClick={closeMobileMenu}
                >
                  About
                </motion.a>
                <motion.a 
                  custom={1}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  href="#features" 
                  className="text-nav-text-dark hover:text-skypearl transition-colors text-lg font-medium"
                  onClick={closeMobileMenu}
                >
                  Smart Features
                </motion.a>
                <motion.a 
                  custom={2}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  href="#amenities" 
                  className="text-nav-text-dark hover:text-skypearl transition-colors text-lg font-medium"
                  onClick={closeMobileMenu}
                >
                  Amenities
                </motion.a>
                <motion.a 
                  custom={3}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  href="#gallery" 
                  className="text-nav-text-dark hover:text-skypearl transition-colors text-lg font-medium"
                  onClick={closeMobileMenu}
                >
                  Gallery
                </motion.a>
                <motion.a 
                  custom={4}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  href="/property-for-sale-siargao" 
                  className="text-nav-text-dark hover:text-skypearl transition-colors text-lg font-medium"
                  onClick={closeMobileMenu}
                >
                  Property for Sale
                </motion.a>
                <motion.a 
                  custom={5}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  href="#investment" 
                  className="text-nav-text-dark hover:text-skypearl transition-colors text-lg font-medium"
                  onClick={closeMobileMenu}
                >
                  Investment
                </motion.a>
                <motion.a 
                  custom={6}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  href="#contact" 
                  className="button-primary bg-skypearl px-8 py-3 text-center text-lg relative overflow-hidden group w-full" // Adjusted for consistency
                  onClick={closeMobileMenu}
                >
                  <span className="relative z-10">Contact Us</span>
                  <div className="absolute inset-0 w-3 -left-10 bg-gradient-to-r from-transparent via-[#D4B883] to-transparent group-hover:animate-shimmer" />
                </motion.a>
              </div>

              {/* Contact Info and Social Links */}
              <div className="mt-auto p-6 space-y-5 border-t border-skypearl/20">
                <motion.div 
                  custom={7}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-1 text-sm text-gray-700"
                >
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-skypearl" />
                    <span>Siargao, Philippines</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className="text-skypearl" />
                    {/* Replace with actual phone number */}
                    <a href="tel:+639993702550" className="hover:text-skypearl transition-colors">+63 999 370 2550</a>
                  </div>
                </motion.div>
                <motion.div 
                  custom={8}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex space-x-4 items-center"
                >
                  <a href="https://instagram.com/@skypearls.ph" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-skypearl transition-colors">
                    <Instagram size={24} />
                  </a>
                  {/* Replace YOUR_NUMBER with actual WhatsApp number e.g. 639123456789 */}
                  <a href="https://wa.me/639993702550" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-skypearl transition-colors">
                    <MessageSquareText size={24} />
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Extract NavLink as a component for cleaner code
const NavLink = ({ href, scrolled, children }: { href: string; scrolled: boolean; children: React.ReactNode }) => (
  <a 
    href={href} 
    className={cn(
      "transition-colors relative group",
      "before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:origin-right before:scale-x-0 before:bg-skypearl before:transition-transform duration-300 hover:before:origin-left hover:before:scale-x-100",
      scrolled 
        ? "text-nav-text-dark hover:text-skypearl" 
        : "text-white hover:text-skypearl/90"
    )}
  >
    <span className={scrolled ? "" : "drop-shadow-sm"}>
      {children}
    </span>
  </a>
);

export default Navbar;
