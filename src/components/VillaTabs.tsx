import * as React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
import { Villa } from '@/data/villas';

interface VillaTabsProps {
  villas: Villa[];
  currentVilla: number;
  onVillaChange: (index: number) => void;
  className?: string;
}

/**
 * VillaTabs component using Radix UI Tabs for horizontal villa selection
 * Provides an accessible tabbed interface with smooth transitions
 */
const VillaTabs: React.FC<VillaTabsProps> = ({
  villas,
  currentVilla,
  onVillaChange,
  className,
}) => {
  return (
    <Tabs.Root
      value={currentVilla.toString()}
      onValueChange={(value) => onVillaChange(parseInt(value))}
      className={cn("w-full", className)}
    >
      <Tabs.List 
        className="flex relative border-b border-skypearl-dark/10 w-full overflow-x-auto hide-scrollbar"
        aria-label="Select a villa"
      >
        {villas.map((villa, index) => (
          <Tabs.Trigger
            key={villa.id}
            value={index.toString()}
            className={cn(
              "group px-6 py-3 text-base transition-all duration-300 whitespace-nowrap",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-skypearl",
              "data-[state=active]:text-skypearl-dark data-[state=inactive]:text-skypearl-dark/60",
              "hover:text-skypearl-dark font-medium relative"
            )}
          >
            {villa.name}
            <span 
              className={cn(
                "absolute bottom-0 left-0 w-full h-0.5 bg-skypearl scale-x-0 group-data-[state=active]:scale-x-100",
                "transition-transform duration-300 origin-left"
              )} 
            />
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
};

export default VillaTabs; 