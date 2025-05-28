import React from 'react';
import { cn } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { 
  Bed, 
  Bath, 
  Ruler, 
  CalendarClock, 
  Home, 
  CheckCircle2, 
  Construction, 
  CheckCircle, 
  Clock, 
  Sparkles,
  Handshake 
} from 'lucide-react';
import { Villa } from '@/data/villas';

interface VillaDetailsCardProps {
  villa: Villa;
  className?: string;
}

/**
 * StatusBadge component for displaying villa status with appropriate styling
 * Enhanced with hover states, accessibility, and microinteractions
 */
const StatusBadge: React.FC<{ status: Villa['status'] }> = ({ status }) => {
  const getStatusConfig = (status: Villa['status']) => {
    switch (status) {
      case 'Under Construction':
        return {
          color: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 hover:shadow-sm',
          focusColor: 'focus:ring-2 focus:ring-amber-300 focus:ring-opacity-50',
          icon: <Construction className="h-4 w-4" />,
          text: 'Under Construction',
          ariaLabel: 'Villa status: Under Construction'
        };
      case 'Available':
        return {
          color: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:shadow-sm',
          focusColor: 'focus:ring-2 focus:ring-green-300 focus:ring-opacity-50',
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Available',
          ariaLabel: 'Villa status: Available for purchase'
        };
      case 'Coming Soon':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 hover:shadow-sm',
          focusColor: 'focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50',
          icon: <Clock className="h-4 w-4" />,
          text: 'Coming Soon',
          ariaLabel: 'Villa status: Coming Soon'
        };
      case 'Completed':
        return {
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 hover:shadow-sm',
          focusColor: 'focus:ring-2 focus:ring-emerald-300 focus:ring-opacity-50',
          icon: <Sparkles className="h-4 w-4" />,
          text: 'Completed',
          ariaLabel: 'Villa status: Construction completed'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 hover:shadow-sm',
          focusColor: 'focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50',
          icon: null,
          text: status,
          ariaLabel: `Villa status: ${status}`
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border",
        "transition-all duration-300 ease-in-out transform hover:scale-105",
        "cursor-default select-none",
        config.color,
        config.focusColor
      )}
      role="status"
      aria-label={config.ariaLabel}
      tabIndex={0}
    >
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};

/**
 * Enhanced PricingSection component with improved mobile responsiveness and microinteractions
 */
const PricingSection: React.FC<{ villa: Villa }> = ({ villa }) => (
  <div className="space-y-4">
    {/* Villa Name and Status */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <h3 className="text-xl md:text-2xl font-playfair text-skypearl-dark leading-tight">
        {villa.name}
      </h3>
      <StatusBadge status={villa.status} />
    </div>
    
    {/* Pricing Information */}
    <div className="space-y-3">
      {/* Primary Pricing Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <div className="group">
          <p className="text-lg md:text-xl font-medium text-skypearl transition-colors duration-200 group-hover:text-skypearl/90">
            {villa.priceRange}
          </p>
          <span className="sr-only">Price range for {villa.name}</span>
        </div>
        
        {villa.isNegotiable && (
          <span 
            className={cn(
              "inline-flex items-center gap-1.5 text-xs bg-green-100 text-green-800",
              "px-2.5 py-1.5 rounded-full font-medium border border-green-200",
              "transition-all duration-300 ease-in-out",
              "hover:bg-green-200 hover:shadow-sm hover:scale-105",
              "animate-pulse hover:animate-none",
              "focus:ring-2 focus:ring-green-300 focus:ring-opacity-50"
            )}
            role="note"
            aria-label="Price is negotiable"
            tabIndex={0}
          >
            <Handshake className="h-3.5 w-3.5" />
            <span>Negotiable</span>
          </span>
        )}
      </div>
      
      {/* Secondary Pricing */}
      {villa.priceOptions && (
        <div className="pl-0 sm:pl-1">
          <p className="text-sm text-skypearl-dark/70 transition-colors duration-200 hover:text-skypearl-dark/80">
            <span className="font-medium">{villa.priceOptions.unfurnished}</span>
            <span className="ml-1 text-xs">(Unfurnished)</span>
          </p>
          <span className="sr-only">Unfurnished pricing option</span>
        </div>
      )}
      
      {/* Status-specific Notes */}
      {villa.status === 'Under Construction' && (
        <p className="text-xs text-skypearl-dark/60 font-medium tracking-wide">
          <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full mr-2 animate-pulse"></span>
          Estimated completion pricing
        </p>
      )}
      
      {/* Construction Note */}
      {villa.constructionNote && (
        <div 
          className={cn(
            "text-xs text-amber-700 bg-amber-50 border border-amber-200",
            "px-3 py-2 rounded-lg shadow-sm",
            "transition-all duration-300 hover:shadow-md hover:bg-amber-100",
            "border-l-4 border-l-amber-400"
          )}
          role="alert"
          aria-label="Construction timeline information"
        >
          <span className="font-medium">📅 {villa.constructionNote}</span>
        </div>
      )}
    </div>
  </div>
);

/**
 * VillaDetailsCard component displays villa specifications and features
 * Enhanced with Phase 3 UI/UX polish improvements
 */
const VillaDetailsCard: React.FC<VillaDetailsCardProps> = ({ villa, className }) => {
  const cardReveal = useScrollReveal<HTMLDivElement>({ delay: 200 });
  
  const specs = [
    { icon: <Bed className="h-5 w-5" />, label: 'Bedrooms', value: villa.bedrooms, ariaLabel: `${villa.bedrooms} bedrooms` },
    { icon: <Bath className="h-5 w-5" />, label: 'Bathrooms', value: villa.baths, ariaLabel: `${villa.baths} bathrooms` },
    { icon: <Ruler className="h-5 w-5" />, label: 'Lot Area', value: villa.lotArea, ariaLabel: `Lot area: ${villa.lotArea}` },
    { icon: <Home className="h-5 w-5" />, label: 'Floor Area', value: villa.floorArea, ariaLabel: `Floor area: ${villa.floorArea}` },
    { icon: <CalendarClock className="h-5 w-5" />, label: 'Turnover', value: villa.turnoverDate, ariaLabel: `Turnover date: ${villa.turnoverDate}` }
  ];

  const handleRequestInfo = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      ref={cardReveal.ref}
      className={cn(
        "bg-white rounded-xl shadow-lg p-6 md:p-8 opacity-0",
        "border border-skypearl-dark/5 h-full flex flex-col",
        "transition-all duration-300 hover:shadow-xl hover:border-skypearl-dark/10",
        "focus-within:ring-2 focus-within:ring-skypearl/20 focus-within:ring-opacity-50",
        className
      )}
      role="article"
      aria-label={`${villa.name} villa details`}
    >
      {/* Enhanced Pricing Section */}
      <PricingSection villa={villa} />
      
      {/* Specs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 my-6" role="list" aria-label="Villa specifications">
        {specs.map((spec, index) => (
          <div 
            key={index} 
            className={cn(
              "flex flex-col items-center md:items-start md:flex-row md:gap-3",
              "group cursor-default select-none",
              "transition-transform duration-200 hover:scale-105"
            )}
            role="listitem"
            aria-label={spec.ariaLabel}
            tabIndex={0}
          >
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full",
              "bg-skypearl/10 text-skypearl mb-2 md:mb-0",
              "transition-all duration-300 group-hover:bg-skypearl/20 group-hover:shadow-sm",
              "group-focus:ring-2 group-focus:ring-skypearl/30"
            )}>
              {spec.icon}
            </div>
            <div className="text-center md:text-left min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-skypearl-dark/60 font-medium">
                {spec.label}
              </p>
              <p className="font-semibold text-skypearl-dark mt-0.5 truncate">
                {spec.value}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Features List */}
      <div className="mt-auto space-y-4">
        <h4 className="text-lg font-medium text-skypearl-dark">Key Features</h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3" role="list" aria-label="Villa features">
          {villa.features.map((feature, index) => (
            <li 
              key={index} 
              className={cn(
                "flex items-start gap-3 group",
                "transition-transform duration-200 hover:translate-x-1"
              )}
              role="listitem"
            >
              <CheckCircle2 className={cn(
                "h-5 w-5 text-skypearl shrink-0 mt-0.5",
                "transition-all duration-300 group-hover:text-skypearl/80 group-hover:scale-110"
              )} />
              <span className="text-sm md:text-base text-skypearl-dark/80 leading-relaxed">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Enhanced CTA Button */}
      <div className="mt-6 pt-4 border-t border-skypearl-dark/5">
        <button 
          onClick={handleRequestInfo}
          className={cn(
            "w-full bg-skypearl text-white py-3.5 px-6 rounded-lg font-medium",
            "transition-all duration-300 ease-in-out",
            "hover:bg-skypearl/90 hover:shadow-lg hover:shadow-skypearl/25",
            "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
            "focus:outline-none focus:ring-2 focus:ring-skypearl focus:ring-opacity-50",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          )}
          aria-label={`Request information about ${villa.name}`}
        >
          Request Information
        </button>
      </div>
    </div>
  );
};

export default VillaDetailsCard; 