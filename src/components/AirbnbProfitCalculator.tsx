import React, { useState } from 'react';

const AirbnbProfitCalculator: React.FC = () => {
  // State for inputs
  const [nightlyRate, setNightlyRate] = useState<number>(8500);
  const [isDynamicPricing, setIsDynamicPricing] = useState<boolean>(false);
  const [minNightlyRate, setMinNightlyRate] = useState<number>(7500);
  const [maxNightlyRate, setMaxNightlyRate] = useState<number>(9500);
  const [cleaningFee, setCleaningFee] = useState<number>(1500);
  const [utilities, setUtilities] = useState<number>(3000);
  const [daysBooked, setDaysBooked] = useState<number>(24);
  
  // Tooltip states
  const [showUtilitiesTooltip, setShowUtilitiesTooltip] = useState<boolean>(false);
  const [showDynamicPricingTooltip, setShowDynamicPricingTooltip] = useState<boolean>(false);
  
  // Calculate results
  const calculateResults = () => {
    // If dynamic pricing, use average of min and max for calculations
    const effectiveNightlyRate = isDynamicPricing 
      ? (minNightlyRate + maxNightlyRate) / 2 
      : nightlyRate;
    
    const grossRevenue = effectiveNightlyRate * daysBooked;
    const expenses = (cleaningFee * daysBooked) + utilities;
    const netMonthlyProfit = grossRevenue - expenses;
    const annualProfit = netMonthlyProfit * 12;
    
    return {
      grossRevenue,
      expenses,
      netMonthlyProfit,
      annualProfit
    };
  };
  
  const results = calculateResults();
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 animate-fade-in">
      <div className="p-6 md:p-8">
        <h3 className="text-2xl font-playfair mb-6 text-skypearl-dark">Airbnb Profit Calculator</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs Section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-skypearl-dark">Pricing Model</label>
                <div className="relative">
                  <button
                    type="button"
                    className="text-xs text-skypearl-dark/70 hover:text-skypearl-dark"
                    onMouseEnter={() => setShowDynamicPricingTooltip(true)}
                    onMouseLeave={() => setShowDynamicPricingTooltip(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  {showDynamicPricingTooltip && (
                    <div className="absolute right-0 bottom-full w-56 bg-white p-2 rounded-md shadow-lg text-xs text-skypearl-dark/80 z-10">
                      Dynamic pricing adapts rates based on season and demand, optimizing occupancy and revenue.
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDynamicPricing(false)}
                  className={`px-4 py-2 text-sm rounded-md transition-all ${!isDynamicPricing ? 'bg-skypearl text-white' : 'bg-gray-100 text-skypearl-dark/70'}`}
                >
                  Fixed Rate
                </button>
                <button
                  type="button"
                  onClick={() => setIsDynamicPricing(true)}
                  className={`px-4 py-2 text-sm rounded-md transition-all ${isDynamicPricing ? 'bg-skypearl text-white' : 'bg-gray-100 text-skypearl-dark/70'}`}
                >
                  Dynamic Range
                </button>
              </div>
            </div>
            
            {/* Nightly Rate Input */}
            {!isDynamicPricing ? (
              <div>
                <label htmlFor="nightlyRate" className="block text-sm font-medium text-skypearl-dark mb-1">
                  Nightly Rate (₱)
                </label>
                <input
                  type="number"
                  id="nightlyRate"
                  value={nightlyRate}
                  onChange={(e) => setNightlyRate(Math.max(0, Number(e.target.value)))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-skypearl/50 transition-all"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="minNightlyRate" className="block text-sm font-medium text-skypearl-dark mb-1">
                    Minimum Nightly Rate (₱)
                  </label>
                  <input
                    type="number"
                    id="minNightlyRate"
                    value={minNightlyRate}
                    onChange={(e) => setMinNightlyRate(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-skypearl/50 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="maxNightlyRate" className="block text-sm font-medium text-skypearl-dark mb-1">
                    Maximum Nightly Rate (₱)
                  </label>
                  <input
                    type="number"
                    id="maxNightlyRate"
                    value={maxNightlyRate}
                    onChange={(e) => setMaxNightlyRate(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-skypearl/50 transition-all"
                  />
                </div>
              </div>
            )}
            
            {/* Cleaning Fee Input */}
            <div>
              <label htmlFor="cleaningFee" className="block text-sm font-medium text-skypearl-dark mb-1">
                Cleaning Fee per Booking (₱)
              </label>
              <input
                type="number"
                id="cleaningFee"
                value={cleaningFee}
                onChange={(e) => setCleaningFee(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-skypearl/50 transition-all"
              />
            </div>
            
            {/* Utilities Input */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="utilities" className="block text-sm font-medium text-skypearl-dark mb-1">
                  Estimated Monthly Utilities (₱)
                </label>
                <div className="relative">
                  <button
                    type="button"
                    className="text-xs text-skypearl-dark/70 hover:text-skypearl-dark"
                    onMouseEnter={() => setShowUtilitiesTooltip(true)}
                    onMouseLeave={() => setShowUtilitiesTooltip(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  {showUtilitiesTooltip && (
                    <div className="absolute right-0 bottom-full w-56 bg-white p-2 rounded-md shadow-lg text-xs text-skypearl-dark/80 z-10">
                      Villas have solar panels + generator. Siaralco is used only as backup, reducing costs significantly.
                    </div>
                  )}
                </div>
              </div>
              <input
                type="number"
                id="utilities"
                value={utilities}
                onChange={(e) => setUtilities(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-skypearl/50 transition-all"
              />
            </div>
            
            {/* Days Booked Input */}
            <div>
              <label htmlFor="daysBooked" className="block text-sm font-medium text-skypearl-dark mb-1">
                Days Booked per Month ({daysBooked})
              </label>
              <input
                type="range"
                id="daysBooked"
                min="0"
                max="31"
                value={daysBooked}
                onChange={(e) => setDaysBooked(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-skypearl"
              />
              <div className="flex justify-between text-xs text-skypearl-dark/70 mt-1">
                <span>0</span>
                <span>31</span>
              </div>
            </div>
          </div>
          
          {/* Results Section */}
          <div className="bg-skypearl-light/30 p-6 rounded-lg space-y-6">
            <h4 className="text-xl font-playfair mb-4 text-skypearl-dark">Projected Returns</h4>
            
            <div className="space-y-4">
              <div className="border-b border-skypearl-dark/10 pb-4">
                <p className="text-sm text-skypearl-dark/70">Gross Monthly Revenue</p>
                <p className="text-2xl font-playfair text-skypearl-dark transition-all duration-300">
                  {formatCurrency(results.grossRevenue)}
                </p>
              </div>
              
              <div className="border-b border-skypearl-dark/10 pb-4">
                <p className="text-sm text-skypearl-dark/70">Monthly Expenses</p>
                <p className="text-2xl font-playfair text-skypearl-dark transition-all duration-300">
                  {formatCurrency(results.expenses)}
                </p>
              </div>
              
              <div className="border-b border-skypearl-dark/10 pb-4">
                <p className="text-sm text-skypearl-dark/70">Net Monthly Profit</p>
                <p className="text-2xl font-playfair text-skypearl-dark transition-all duration-300">
                  {formatCurrency(results.netMonthlyProfit)}
                </p>
              </div>
              
              <div className="bg-skypearl/10 p-4 rounded-lg">
                <p className="text-sm text-skypearl-dark/70">Estimated Annual Profit</p>
                <p className="text-3xl font-playfair text-skypearl-dark font-bold transition-all duration-300">
                  {formatCurrency(results.annualProfit)}
                </p>
              </div>
            </div>
            
            <div className="text-xs text-skypearl-dark/60 mt-4">
              <p>* These estimates are based on current market conditions and may vary.</p>
              <p>* Siargao's luxury villa market maintains approximately 85% occupancy rate year-round.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirbnbProfitCalculator; 