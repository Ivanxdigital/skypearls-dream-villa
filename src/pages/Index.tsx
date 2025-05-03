
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import FeaturesSection from '@/components/FeaturesSection';
import AmenitiesSection from '@/components/AmenitiesSection';
import LocationSection from '@/components/LocationSection';
import GallerySection from '@/components/GallerySection';
import InvestmentSection from '@/components/InvestmentSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

const Index = () => {
  useEffect(() => {
    // Smooth scroll functionality for anchor links
    const handleAnchorClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      
      if (target.tagName === 'A' && target.hash && target.hash.startsWith('#')) {
        e.preventDefault();
        
        const targetElement = document.querySelector(target.hash);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.getBoundingClientRect().top + window.pageYOffset - 80,
            behavior: 'smooth'
          });
          
          // Update URL but without scrolling
          history.pushState(null, '', target.hash);
        }
      }
    };
    
    document.body.addEventListener('click', handleAnchorClick);
    
    return () => {
      document.body.removeEventListener('click', handleAnchorClick);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-skypearl-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <AboutSection />
      <FeaturesSection />
      <AmenitiesSection />
      <LocationSection />
      <GallerySection />
      <InvestmentSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
