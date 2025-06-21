export interface Villa {
  id: string;
  name: string;
  priceRange: string;
  priceOptions?: {
    furnished: string;
    unfurnished: string;
  };
  status: 'Available' | 'Under Construction' | 'Completed' | 'Coming Soon';
  isNegotiable?: boolean;
  constructionNote?: string;
  turnoverDate: string;
  lotArea: string;
  floorArea: string;
  bedrooms: string;
  baths: string;
  features: string[];
  images: {
    url: string;
    title: string;
    description: string;
  }[];
}

// Villa data
export const villas: Villa[] = [
  {
    id: "villa-anna",
    name: "Villa Anna",
    priceRange: "₱15M - ₱23M",
    status: "Under Construction",
    isNegotiable: true,
    constructionNote: "Expected completion Mid August 2025",
    turnoverDate: "Mid August 2025",
    lotArea: "100 sqm",
    floorArea: "135 sqm",
    bedrooms: "1-2",
    baths: "2-3",
    features: [
      "Smart home automation with voice control and mobile app integration",
      "Solar-powered energy system with battery backup for sustainable living",
      "Infinity edge private pool overlooking Siargao's tropical landscape",
      "Spacious outdoor lounge and garden area perfect for entertaining",
      "High-ceiling living spaces with natural ventilation and abundant light",
      "Open-plan gourmet kitchen featuring premium SMEG appliances",
      "Flexible home office/studio space ideal for remote work or creative pursuits",
      "Custom-designed integrated storage solutions throughout",
      "Private outdoor shower area surrounded by lush tropical gardens",
      "Dedicated parking space with electric vehicle charging capability",
      "24/7 Security system with professional monitoring",
    ],
    images: [
              {
          url: "/images/villas/villa-anna-rendering-backside.png",
          title: "Private Poolside Retreat",
          description: "Tranquil evening ambiance featuring a cozy lounge area, a serene pool, and soft warm lighting."
        },
              {
          url: "/images/villas/villa-anna-rendering-bedroom.png",
          title: "Serene Master Bedroom",
          description: "Earth-toned interiors with ambient lighting and lush garden views for restful nights."
        },
        {
          url: "/images/villas/villa-anna-rendering-front.png",
          title: "Modern Desert-Inspired Façade",
          description: "Iconic front elevation blending minimal curves, natural textures, and a tropical backdrop."
        },
        {
          url: "/images/villas/villa-anna-rendering-kitchen.png",
          title: "Open-Air Mediterranean Kitchen",
          description: "Chic SMEG fridge, soft arches, and natural light for a perfect blend of style and function."
        },
        {
          url: "/images/villas/villa-anna-rendering-livingroom.png",
          title: "Warm Contemporary Living Room",
          description: "A cozy gathering space with built-in seating, arched windows, and golden hour lighting."
        }
    ]
  },
  {
    id: "villa-perles",
    name: "Villa Perles",
    priceRange: "₱28M–₱35M",
    status: "Available",
    turnoverDate: "TBD",
    lotArea: "100 sqm",
    floorArea: "135 sqm",
    bedrooms: "2-4",
    baths: "2-4",
    features: [
      "Distinctive double-curved architectural façade inspired by modern tropical design",
      "Floor-to-ceiling panoramic glass windows showcasing Siargao's natural beauty",
      "Integrated biophilic planter niches bringing nature indoors",
      "Open-air gourmet kitchen with stunning views of the infinity pool and Sayak runway",
      "Luxurious freestanding bathtub positioned for immersive jungle and palm tree views",
      "Dedicated carport with convenient scooter and surfboard storage alcove",
      "Elevated second-level lounge terrace with private seating for sunset viewing",
      "Advanced smart home automation system with solar-ready sustainable energy",
      "Private infinity swimming pool perfect for tropical relaxation"
    ],
          images: [
        {
          url: "/images/villas/villa-perls-front.png",
          title: "Modern Curved Façade & Carport",
          description: "Distinctive double-curved exterior with integrated planters, carport, and scooter storage."
        },
        {
          url: "/images/villas/villa-perls-bedroom.png",
          title: "Minimalist Master Bedroom",
          description: "Warm neutral tones, custom lighting, and a seamless connection to the surrounding greenery."
        },
        {
          url: "/images/villas/villa-perls-bedroom-view.png",
          title: "Panoramic Jungle & Runway Views",
          description: "Sweeping curved glass framing lush palms and dramatic runway vistas."
        },
        {
          url: "/images/villas/villa-perls-bathroom-view.png",
          title: "Spa-Style Freestanding Tub",
          description: "Elegant sloped tub set against a backdrop of swaying palms for a serene retreat."
        },
        {
          url: "/images/villas/villa-perls-kitchen-view.jpeg",
          title: "Open-Air Kitchen & Pool Lounge",
          description: "Sleek island layout opening directly onto the infinity pool and tropical lounging deck."
        },
        {
          url: "/images/villas/villa-perls-backyard.png",
          title: "Poolside Terrace & Garden Oasis",
          description: "Sunny pool deck with loungers, umbrella, and a lush garden backdrop—perfect for sunset relaxation."
        }
      ]
  }
]; 