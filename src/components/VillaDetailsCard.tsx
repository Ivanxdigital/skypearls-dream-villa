import React from 'react';
import { cn } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { Bed, Bath, Ruler, CalendarClock, Home, CheckCircle2 } from 'lucide-react';
import { Villa } from '@/data/villas';

interface VillaDetailsCardProps {
  villa: Villa;
  className?: string;
}

/**
 * VillaDetailsCard component displays villa specifications and features
 * Includes a grid of specs with icons and a feature list
 */
const VillaDetailsCard: React.FC<VillaDetailsCardProps> = ({ villa, className }) => {
  const cardReveal = useScrollReveal<HTMLDivElement>({ delay: 200 });
  
  const specs = [
    { icon: <Bed className="h-5 w-5" />, label: 'Bedrooms', value: villa.bedrooms },
    { icon: <Bath className="h-5 w-5" />, label: 'Bathrooms', value: villa.baths },
    { icon: <Ruler className="h-5 w-5" />, label: 'Lot Area', value: villa.lotArea },
    { icon: <Home className="h-5 w-5" />, label: 'Floor Area', value: villa.floorArea },
    { icon: <CalendarClock className="h-5 w-5" />, label: 'Turnover', value: villa.turnoverDate }
  ];

  return (
    <div 
      ref={cardReveal.ref}
      className={cn(
        "bg-white rounded-lg shadow-md p-6 md:p-8 opacity-0",
        "border border-skypearl-dark/5 h-full flex flex-col",
        className
      )}
    >
      <div className="mb-4">
        <h3 className="text-xl md:text-2xl font-playfair text-skypearl-dark mb-2">{villa.name}</h3>
        <p className="text-lg md:text-xl font-medium text-skypearl mb-4">{villa.priceRange}</p>
      </div>
      
      {/* Specs Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-3">
        {specs.map((spec, index) => (
          <div key={index} className="flex flex-col items-center md:items-start md:flex-row md:gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-skypearl/10 text-skypearl mb-2 md:mb-0">
              {spec.icon}
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs uppercase tracking-wider text-skypearl-dark/60">{spec.label}</p>
              <p className="font-medium text-skypearl-dark">{spec.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Features List */}
      <div className="mt-auto">
        <h4 className="text-lg font-medium text-skypearl-dark mb-3">Key Features</h4>
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {villa.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-skypearl shrink-0 mt-0.5" />
              <span className="text-sm md:text-base text-skypearl-dark/80">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* CTA Button */}
      <div className="mt-6">
        <button 
          className="w-full bg-skypearl hover:bg-skypearl/90 text-white py-3 px-6 rounded-md font-medium transition-colors
          hover:scale-[1.02] active:scale-[0.98] duration-300"
        >
          Request Information
        </button>
      </div>
    </div>
  );
};

export default VillaDetailsCard; 