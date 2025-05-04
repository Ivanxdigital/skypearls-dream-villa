import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * BrandLogo component: shows the Skypearls logo stamp and text with luxury entry animation.
 * - Logo fades in
 * - Text slides in from left after logo fade-in
 * - Animation plays only once on mount
 */
export const BrandLogo: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  const [showText, setShowText] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);

  // Fade-in duration for logo (ms)
  const logoFadeInDuration = 500;
  // Delay before text slides in (ms)
  const textSlideInDelay = 100; // after logo fade-in

  useEffect(() => {
    // Start text animation after logo fade-in completes
    const timer = setTimeout(() => setShowText(true), logoFadeInDuration + textSlideInDelay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        'flex items-center gap-2 select-none',
        className
      )}
      {...props}
    >
      {/* Logo Stamp */}
      <img
        ref={logoRef}
        src="/skypearls-logo-stamp.png"
        alt="SkyPearls Logo Stamp"
        className={cn(
          'h-10 w-auto object-contain',
          'opacity-0 animate-skypearl-logo-fade-in'
        )}
        style={{ animationDuration: `${logoFadeInDuration}ms`, animationFillMode: 'forwards' }}
        draggable={false}
      />
      {/* Brand Text */}
      <span
        className={cn(
          'text-2xl font-playfair font-bold whitespace-nowrap',
          'transition-colors',
          showText ? 'opacity-100 animate-skypearl-text-slide-in' : 'opacity-0',
          className
        )}
        style={{ animationDelay: showText ? '0ms' : '9999s', animationDuration: '500ms', animationFillMode: 'forwards' }}
      >
        SkyPearls<span className="text-skypearl">.</span>
      </span>
    </div>
  );
};

export default BrandLogo; 