import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import FeaturesSection from '@/components/FeaturesSection';
import AmenitiesSection from '@/components/AmenitiesSection';
import LocationSection from '@/components/LocationSection';
import GallerySection from '@/components/GallerySection';
import InvestmentSection from '@/components/InvestmentSection';
import FAQSection from '@/components/FAQSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';
import { SEOHead } from '@/components/SEOHead';
import { StructuredData } from '@/components/StructuredData';

const Index = () => {
  // Initialize smooth scrolling with 80px offset for fixed navbar
  useSmoothScroll(80);
  
  return (
    <div className="min-h-screen bg-skypearl-white overflow-x-hidden">
      <SEOHead />
      <StructuredData />
      <Navbar />
      <Hero />
      <AboutSection />
      <FeaturesSection />
      <AmenitiesSection />
      <LocationSection />
      <GallerySection />
      <InvestmentSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
