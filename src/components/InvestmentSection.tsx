import React from 'react';
import AirbnbProfitCalculator from './AirbnbProfitCalculator';

const InvestmentSection = () => {
  return (
    <section id="investment" className="section-padding bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
          <span className="text-sm font-medium text-skypearl uppercase tracking-wider">Investment</span>
          <h2 className="section-title">A Premium Opportunity</h2>
          <p className="section-subtitle">
            Skypearls Villas offers not just a luxury lifestyle, but a sound investment with exceptional returns.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 animate-fade-in">
            <h3 className="text-2xl font-playfair mb-6">Pre-Selling Advantage</h3>
            <p className="text-lg text-skypearl-dark/80 mb-6">
              As a pre-selling development, Skypearls Villas offers early investors the opportunity to secure units at 
              below-market rates, with projected appreciation of 30-40% upon completion.
            </p>
            
            <div className="bg-skypearl-light/30 p-6 rounded-lg mb-6">
              <h4 className="font-medium mb-2">Rental Income Potential</h4>
              <p className="text-skypearl-dark/80 mb-4">
                Siargao's growing tourism market offers excellent rental income potential, with luxury villas commanding premium rates.
              </p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-3xl font-playfair text-skypearl-dark font-bold">15-20%</p>
                  <p className="text-sm text-skypearl-dark/70">Annual ROI</p>
                </div>
                <div>
                  <p className="text-3xl font-playfair text-skypearl-dark font-bold">85%</p>
                  <p className="text-sm text-skypearl-dark/70">Occupancy Rate</p>
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl font-playfair mb-6">Payment Options</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-skypearl p-3 rounded-full text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">30/70 Payment Scheme</h4>
                  <p className="text-skypearl-dark/70">30% downpayment, 70% upon turnover</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-skypearl p-3 rounded-full text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">50/50 Payment Scheme</h4>
                  <p className="text-skypearl-dark/70">50% downpayment, 50% upon turnover</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-skypearl p-3 rounded-full text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Full Cash Payment</h4>
                  <p className="text-skypearl-dark/70">With 10% discount on total contract price</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 md:order-2 animate-fade-in">
            <AirbnbProfitCalculator />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InvestmentSection;
