import React from 'react';
import { SEOHead } from '@/components/SEOHead';
import { StructuredData } from '@/components/StructuredData';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { scrollToSection } from '@/hooks/use-smooth-scroll';
import VillaCarousel from '@/components/VillaCarousel';
import { ChatGate } from '@/components/ChatGate';
import { villas } from '@/data/villas';
import { 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Shield, 
  Wifi, 
  Car,
  Bed,
  Bath,
  Ruler,
  Home,
  CalendarClock,
  CheckCircle2,
  MessageCircle,
  Phone,
  Mail,
  Star,
  Award,
  Zap
} from 'lucide-react';

const PropertyForSaleSiargao: React.FC = () => {
  // Get Villa Anna data
  const villaAnna = villas.find(villa => villa.id === 'villa-anna')!;

  // Scroll reveal animations
  const heroReveal = useScrollReveal<HTMLDivElement>({ delay: 0 });
  const propertyReveal = useScrollReveal<HTMLDivElement>({ delay: 200 });
  const investmentReveal = useScrollReveal<HTMLDivElement>({ delay: 300 });
  const locationReveal = useScrollReveal<HTMLDivElement>({ delay: 400 });
  const chatReveal = useScrollReveal<HTMLDivElement>({ delay: 500 });

  const handleContactClick = () => {
    scrollToSection('contact', 80);
  };

  const specs = [
    { icon: <Bed className="h-5 w-5" />, label: 'Bedrooms', value: villaAnna.bedrooms },
    { icon: <Bath className="h-5 w-5" />, label: 'Bathrooms', value: villaAnna.baths },
    { icon: <Ruler className="h-5 w-5" />, label: 'Lot Area', value: villaAnna.lotArea },
    { icon: <Home className="h-5 w-5" />, label: 'Floor Area', value: villaAnna.floorArea },
    { icon: <CalendarClock className="h-5 w-5" />, label: 'Completion', value: villaAnna.turnoverDate }
  ];

  const investmentHighlights = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "High ROI Potential",
      description: "Siargao tourism growth of 511% creates excellent rental opportunities with 8-12% annual returns"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Prime Location",
      description: "1 minute from Sayak Airport, 30 minutes to Cloud 9 - perfect for both convenience and investment"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Luxury Amenities",
      description: "Smart home automation, infinity pool, solar power, and premium SMEG appliances included"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Pre-Selling Advantage",
      description: "Secure your luxury villa at today's prices before market appreciation and completion"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Luxury Property for Sale in Siargao | Villa Anna - ₱15M | Skypearls"
        description="Exclusive luxury property for sale in Siargao. Villa Anna features smart home technology, infinity pool, and prime location. Pre-selling at ₱15M-₱23M. Chat with AI assistant for instant info."
        keywords="property for sale in Siargao, luxury villa for sale Siargao, Siargao real estate, Villa Anna Siargao, pre-selling villa Siargao, smart villa Philippines"
        url="https://skypearls-dream-villa.com/property-for-sale-siargao"
      />
      
      <StructuredData />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-skypearl-dark to-skypearl min-h-screen flex items-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div ref={heroReveal.ref} className="max-w-4xl mx-auto text-center text-white opacity-0">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium">Premium Property for Sale</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-playfair font-bold mb-6 leading-tight">
              Luxury Property for Sale<br />
              <span className="text-yellow-400">in Siargao</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Villa Anna - Your gateway to luxury living in the Philippines' premier surfing destination. 
              Smart home technology meets tropical paradise.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/20">
                <span className="text-2xl md:text-3xl font-bold text-yellow-400">₱15M - ₱23M</span>
                <p className="text-sm text-white/80">Pre-selling Price</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/20">
                <span className="text-2xl md:text-3xl font-bold text-green-400">Mid Aug 2025</span>
                <p className="text-sm text-white/80">Ready for Occupancy</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleContactClick}
                className="bg-yellow-400 text-skypearl-dark px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="h-5 w-5" />
                Schedule Viewing
              </button>
              <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat with AI Assistant
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Property Showcase */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div ref={propertyReveal.ref} className="max-w-6xl mx-auto opacity-0">
            <div className="text-center mb-12">
              <span className="text-skypearl text-sm font-medium uppercase tracking-wider">Featured Property</span>
              <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900 mb-4">
                Villa Anna - Premium Smart Villa
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Experience the pinnacle of modern tropical living with cutting-edge smart home technology, 
                infinity pool, and sustainable solar power system.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Villa Gallery */}
              <div>
                <VillaCarousel images={villaAnna.images} />
              </div>

              {/* Villa Details */}
              <div className="space-y-8">
                {/* Pricing */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-4">Investment Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pre-selling Price:</span>
                      <span className="text-2xl font-bold text-skypearl">₱15M - ₱23M</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                        Under Construction
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Negotiable:</span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Yes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Property Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {specs.map((spec, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="bg-skypearl/10 text-skypearl p-2 rounded-full">
                          {spec.icon}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">{spec.label}</p>
                          <p className="font-semibold text-gray-900">{spec.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Features */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Premium Features</h3>
                  <div className="grid gap-3">
                    {villaAnna.features.slice(0, 6).map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-skypearl mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Highlights */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div ref={investmentReveal.ref} className="max-w-6xl mx-auto opacity-0">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900 mb-4">
                Why Invest in Villa Anna?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover the compelling reasons why Villa Anna represents the perfect 
                property investment opportunity in Siargao's booming real estate market.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {investmentHighlights.map((highlight, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-skypearl/10 text-skypearl p-3 rounded-full w-fit mb-4">
                    {highlight.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{highlight.title}</h3>
                  <p className="text-gray-600">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Location Benefits */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div ref={locationReveal.ref} className="max-w-6xl mx-auto opacity-0">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900 mb-6">
                  Prime Siargao Location
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Villa Anna is strategically located in Del Carmen, offering the perfect balance 
                  of convenience and tranquility. Easy access to Siargao's famous attractions 
                  while maintaining a peaceful retreat atmosphere.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-skypearl/10 text-skypearl p-2 rounded-full">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Sayak Airport</p>
                      <p className="text-gray-600">1 minute drive</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-skypearl/10 text-skypearl p-2 rounded-full">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Cloud 9 Surf Break</p>
                      <p className="text-gray-600">30 minutes drive</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-skypearl/10 text-skypearl p-2 rounded-full">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">General Luna Town</p>
                      <p className="text-gray-600">30 minutes drive</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <img 
                  src="/images/location-maps/main-property-location.png" 
                  alt="Villa Anna property location map in Del Carmen, Siargao near Sayak Airport and Cloud 9"
                  className="w-full h-96 object-cover rounded-xl shadow-lg"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-lg">
                  <p className="font-playfair text-lg text-skypearl">Perfect Location</p>
                  <p className="text-2xl font-bold text-gray-900">Del Carmen</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chatbot Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-skypearl/5 to-skypearl/10">
        <div className="container mx-auto px-4">
          <div ref={chatReveal.ref} className="max-w-4xl mx-auto text-center opacity-0">
            <div className="mb-12">
              <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900 mb-4">
                Get Instant Property Information
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Chat with our AI assistant to get immediate answers about Villa Anna, 
                pricing, financing options, and the buying process. Available 24/7.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="bg-skypearl/10 text-skypearl p-3 rounded-full">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">AI Property Assistant</h3>
              </div>
              
              <ChatGate />
              
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-600">Ask about:</p>
                  <p className="font-medium text-gray-900">Villa Anna Pricing</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-600">Get info on:</p>
                  <p className="font-medium text-gray-900">Financing Options</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-600">Schedule:</p>
                  <p className="font-medium text-gray-900">Property Viewing</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-600">Learn about:</p>
                  <p className="font-medium text-gray-900">Investment ROI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-skypearl text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-playfair font-bold mb-6">
            Ready to Own Your Piece of Paradise?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Don't miss this opportunity to invest in Siargao's premier luxury property. 
            Villa Anna won't be available at these pre-selling prices for long.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleContactClick}
              className="bg-white text-skypearl px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="h-5 w-5" />
              Contact Sales Team
            </button>
            <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
              <Mail className="h-5 w-5" />
              Request Brochure
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PropertyForSaleSiargao;