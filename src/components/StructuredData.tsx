import { Helmet } from 'react-helmet-async';
import { villas } from '@/data/villas';

const generateRealEstateStructuredData = () => {
  // Main Real Estate Agent/Company
  const realEstateAgent = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Skypearls Dream Villa",
    "description": "Luxury pre-selling villas in Siargao, Philippines featuring smart home technology and prime island location",
    "url": "https://skypearls-dream-villa.com",
    "logo": "https://skypearls-dream-villa.com/images/logo.png",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Del Carmen",
      "addressRegion": "Siargao Island",
      "addressCountry": "Philippines"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 9.8764,
      "longitude": 126.0641
    },
    "areaServed": {
      "@type": "Place",
      "name": "Siargao Island, Philippines"
    },
    "priceRange": "₱17M - ₱35M"
  };

  // Local Business for location-based SEO
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "RealEstateBusiness",
    "name": "Skypearls Dream Villa",
    "description": "Premium luxury villa development in Siargao's Del Carmen area, offering pre-selling smart villas near Cloud 9 surf break",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Del Carmen",
      "addressRegion": "Siargao Island, Surigao del Norte",
      "addressCountry": "PH"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 9.8764,
      "longitude": 126.0641
    },
    "telephone": "+63-XXX-XXX-XXXX",
    "openingHours": "Mo-Su 08:00-18:00",
    "priceRange": "₱₱₱₱",
    "servesCuisine": null,
    "areaServed": [
      "Siargao Island",
      "Del Carmen",
      "General Luna",
      "Dapa",
      "Surigao del Norte"
    ]
  };

  // Individual Villa Properties
  const villaProperties = villas.map(villa => ({
    "@context": "https://schema.org",
    "@type": "House",
    "name": villa.name,
    "description": `Luxury ${villa.name.toLowerCase()} in Siargao featuring ${villa.features.slice(0, 3).join(', ')}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Del Carmen",
      "addressRegion": "Siargao Island",
      "addressCountry": "Philippines"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 9.8764,
      "longitude": 126.0641
    },
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": parseInt(villa.floorArea.replace(/\D/g, '')),
      "unitCode": "MTK"
    },
    "numberOfRooms": villa.bedrooms,
    "numberOfBathroomsTotal": villa.baths,
    "amenityFeature": villa.features.map(feature => ({
      "@type": "LocationFeatureSpecification",
      "name": feature
    })),
    "offers": {
      "@type": "Offer",
      "price": villa.priceRange,
      "priceCurrency": "PHP",
      "priceValidUntil": "2025-12-31",
      "availability": villa.status === "Available" ? "InStock" : "PreOrder",
      "itemCondition": "NewCondition",
      "seller": {
        "@type": "RealEstateAgent",
        "name": "Skypearls Dream Villa"
      }
    },
    "photo": villa.images.map(image => ({
      "@type": "ImageObject",
      "url": `https://skypearls-dream-villa.com${image.url}`,
      "caption": image.description
    }))
  }));

  // Tourism/Resort context for Siargao
  const touristDestination = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "name": "Siargao Island",
    "description": "Philippines' premier surfing destination, home to world-famous Cloud 9 surf break",
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 9.8587,
      "longitude": 126.0947
    },
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "Surigao del Norte",
      "addressCountry": "Philippines"
    },
    "touristType": ["Surfer", "Beach lover", "Nature enthusiast", "Luxury traveler"],
    "includesAttraction": [
      {
        "@type": "TouristAttraction",
        "name": "Cloud 9 Surf Break",
        "description": "World-famous surfing spot"
      },
      {
        "@type": "TouristAttraction", 
        "name": "Magpupungko Rock Pools",
        "description": "Natural tide pools and rock formations"
      }
    ]
  };

  return {
    realEstateAgent,
    localBusiness,
    villaProperties,
    touristDestination
  };
};

export const StructuredData = () => {
  const structuredData = generateRealEstateStructuredData();

  return (
    <Helmet>
      {/* Real Estate Agent */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData.realEstateAgent)}
      </script>
      
      {/* Local Business */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData.localBusiness)}
      </script>
      
      {/* Villa Properties */}
      {structuredData.villaProperties.map((villa, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(villa)}
        </script>
      ))}
      
      {/* Tourist Destination Context */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData.touristDestination)}
      </script>
    </Helmet>
  );
};