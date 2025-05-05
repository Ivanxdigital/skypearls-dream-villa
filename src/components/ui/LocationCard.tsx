import React from 'react';
import type { LocationData } from '@/data/locations';

interface LocationCardProps {
  location: LocationData;
}

// Minimal map pin icon
const MapPinIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="h-5 w-5 text-skypearl"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const LocationCard: React.FC<LocationCardProps> = ({ location }) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg transition-colors hover:bg-white/10">
      <div className="flex-shrink-0">
        <MapPinIcon />
      </div>
      <div>
        <h4 className="font-medium text-white">{location.name}</h4>
        <p className="text-sm text-white/70">{location.time}</p>
      </div>
    </div>
  );
};

export default LocationCard; 