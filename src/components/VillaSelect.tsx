import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { Villa } from '@/data/villas';

interface VillaSelectProps {
  villas: Villa[];
  currentVilla: number;
  onVillaChange: (index: number) => void;
  className?: string;
}

/**
 * VillaSelect component providing a native select dropdown for villa selection on mobile
 */
const VillaSelect: React.FC<VillaSelectProps> = ({
  villas,
  currentVilla,
  onVillaChange,
  className,
}) => {
  return (
    <div className={cn("relative", className)}>
      <select
        value={currentVilla}
        onChange={(e) => onVillaChange(parseInt(e.target.value))}
        className={cn(
          "w-full appearance-none border-b border-skypearl-dark/10 py-3 px-4 pr-10",
          "bg-transparent text-skypearl-dark font-medium focus:outline-none",
          "focus:border-skypearl focus:ring-1 focus:ring-skypearl rounded-md"
        )}
        aria-label="Select a villa"
      >
        {villas.map((villa, index) => (
          <option key={villa.id} value={index}>
            {villa.name}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown className="h-5 w-5 text-skypearl-dark/60" />
      </div>
    </div>
  );
};

export default VillaSelect; 