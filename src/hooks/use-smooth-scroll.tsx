import { useEffect } from 'react';

/**
 * Custom hook for smooth scrolling to anchor links
 * Handles navigation links and updates URL without triggering page refresh
 */
export const useSmoothScroll = (offset: number = 80) => {
  useEffect(() => {
    const handleAnchorClick = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Check if the clicked element is an anchor or a child of an anchor
      let anchor = target.closest('a') as HTMLAnchorElement;
      
      if (anchor && anchor.hash && anchor.hash.startsWith('#')) {
        e.preventDefault();
        e.stopPropagation();
        
        const targetId = anchor.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Update URL without scrolling
          if (window.history && window.history.pushState) {
            window.history.pushState(null, '', anchor.hash);
          }
        }
      }
    };
    
    // Use document instead of document.body for better event capture
    document.addEventListener('click', handleAnchorClick, true); // Use capture phase
    
    return () => {
      document.removeEventListener('click', handleAnchorClick, true);
    };
  }, [offset]);
};

/**
 * Programmatic smooth scroll to a section by ID
 */
export const scrollToSection = (sectionId: string, offset: number = 80) => {
  const targetElement = document.getElementById(sectionId);
  
  if (targetElement) {
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    
    // Update URL
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', `#${sectionId}`);
    }
  }
}; 