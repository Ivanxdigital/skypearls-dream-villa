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
  bedrooms: number;
  baths: number;
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
    priceRange: "₱18M - ₱23M",
    priceOptions: {
      furnished: "₱18M - ₱23M",
      unfurnished: "₱17M - ₱20M"
    },
    status: "Under Construction",
    isNegotiable: true,
    constructionNote: "Expected completion July 2025",
    turnoverDate: "July 2025",
    lotArea: "100 sqm",
    floorArea: "135 sqm",
    bedrooms: 2,
    baths: 2,
    features: [
      "Smart home automation system",
      "Solar-powered energy solution",
      "Infinity edge private pool",
      "Outdoor lounge and garden area",
      "High-ceiling living spaces",
      "Open-plan kitchen with SMEG appliances",
      "Home office/studio space",
      "Integrated storage solutions",
      "Outdoor shower area by the swimming pool",
      "Private parking space",
      "24/7 Security",
    ],
    images: [
      {
        url: "/villa-anna-rendering-backside.png",
        title: "Private Poolside Retreat",
        description: "Tranquil evening ambiance featuring a cozy lounge area, a serene pool, and soft warm lighting."
      },
      {
        url: "/villa-anna-rendering-bedroom.png",
        title: "Serene Master Bedroom",
        description: "Earth-toned interiors with ambient lighting and lush garden views for restful nights."
      },
      {
        url: "/villa-anna-rendering-front.png",
        title: "Modern Desert-Inspired Façade",
        description: "Iconic front elevation blending minimal curves, natural textures, and a tropical backdrop."
      },
      {
        url: "/villa-anna-rendering-kitchen.png",
        title: "Open-Air Mediterranean Kitchen",
        description: "Chic SMEG fridge, soft arches, and natural light for a perfect blend of style and function."
      },
      {
        url: "/villa-anna-rendering-livingroom.png",
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
    bedrooms: 2,
    baths: 2,
    features: [
      "Iconic double-curved architectural façade",
      "Floor-to-ceiling panoramic glass windows",
      "Integrated biophilic planter niches",
      "Open-air gourmet kitchen overlooking pool and runway",
      "Freestanding bathtub with immersive jungle views",
      "Dedicated carport & scooter/surfboard alcove",
      "Second-level lounge terrace with private seating",
      "Smart home automation & solar-ready energy system",
      "Private Swimming Pool"
    ],
    images: [
      {
        url: "/villa-perls-front.png",
        title: "Modern Curved Façade & Carport",
        description: "Distinctive double-curved exterior with integrated planters, carport, and scooter storage."
      },
      {
        url: "/villa-perls-bedroom.png",
        title: "Minimalist Master Bedroom",
        description: "Warm neutral tones, custom lighting, and a seamless connection to the surrounding greenery."
      },
      {
        url: "/villa-perls-bedroom-view.png",
        title: "Panoramic Jungle & Runway Views",
        description: "Sweeping curved glass framing lush palms and dramatic runway vistas."
      },
      {
        url: "/villa-perls-bathroom-view.png",
        title: "Spa-Style Freestanding Tub",
        description: "Elegant sloped tub set against a backdrop of swaying palms for a serene retreat."
      },
      {
        url: "/villa-perls-kitchen-view.jpeg",
        title: "Open-Air Kitchen & Pool Lounge",
        description: "Sleek island layout opening directly onto the infinity pool and tropical lounging deck."
      },
      {
        url: "/villa-perls-backyard.png",
        title: "Poolside Terrace & Garden Oasis",
        description: "Sunny pool deck with loungers, umbrella, and a lush garden backdrop—perfect for sunset relaxation."
      }
    ]
  }
]; 