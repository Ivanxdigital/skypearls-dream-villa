
# Skypearls Villas - Project Brief

## Project Overview

Skypearls Villas is a luxury real estate project website for high-end smart villas located in Siargao, Philippines. The website targets foreign investors, digital nomads, and high-net-worth individuals looking to purchase or invest in luxury properties in a tropical island location.

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui component library
- **Routing**: React Router DOM
- **Data Fetching**: TanStack Query (formerly React Query)
- **Animation**: CSS animation utilities via Tailwind config
- **Icons**: Lucide React

## Project Structure

- `/src`: Main source code directory
  - `/components`: Reusable UI components
    - `/ui`: Base UI components from shadcn/ui
  - `/pages`: Page components that serve as route endpoints
  - `/lib`: Utility functions and shared logic
  - `/hooks`: Custom React hooks

## Key Design Features

1. **Design System**
   - **Color Palette**: Off-white, sand, charcoal, and subtle gold accents
     - Primary color: Skypearl gold (#D4B883)
     - Dark: #2C2C2C
     - Light: #E5DDD0
     - White: #F8F8F5
   - **Typography**:
     - Headings: Playfair Display (serif)
     - Body: Montserrat (sans-serif)
   - **Animations**: Subtle fade-ins, smooth scrolling, hover effects

2. **Responsive Design**
   - Mobile-first approach
   - Flexible grid layouts using Tailwind CSS
   - Adaptive components that respond to different screen sizes

## Content Sections

1. **Hero Section**: Full-screen image with overlay gradient and CTA
2. **About Section**: Introduction to Skypearls Villas concept
3. **Smart Features**: Highlighting technological aspects of the villas
4. **Amenities**: Showcase of luxury facilities and services
5. **Location**: Geographic position and nearby attractions
6. **Gallery**: High-resolution images of the property
7. **Investment Section**: Financial benefits and investment opportunities
8. **Contact Section**: Form and contact information with WhatsApp integration

## Component Architecture

The website follows a modular component architecture:

- **Layout Components**: Handle the overall structure
- **Section Components**: Represent major content blocks
- **UI Components**: Basic building blocks from shadcn/ui
- **Interactive Components**: Handle user interactions like forms, galleries, etc.

### Key Components

- `Hero.tsx`: Full-screen landing section with background image and gradient overlay
- `Navbar.tsx`: Navigation menu with responsive behavior
- `AboutSection.tsx`: Company and project introduction
- `FeaturesSection.tsx`: Grid display of smart home features
- `AmenitiesSection.tsx`: List of property amenities with icons
- `LocationSection.tsx`: Map integration and location highlights
- `GallerySection.tsx`: Image gallery with navigation
- `InvestmentSection.tsx`: Financial information and ROI potential
- `ContactSection.tsx`: Contact form with WhatsApp integration
- `Footer.tsx`: Site footer with links and legal information

## User Experience

1. **Navigation**: 
   - Smooth scrolling to sections
   - Fixed header with navigation links
   - Mobile-responsive hamburger menu

2. **Animations**:
   - Elements fade in as they enter the viewport
   - Subtle hover effects on interactive elements
   - Gradual transitions between states

3. **Performance Optimizations**:
   - Image optimization
   - Component lazy loading
   - Efficient styling via Tailwind utility classes

## Development Guidelines

1. **Component Creation**:
   - Create focused components in separate files
   - Avoid large monolithic components
   - Use TypeScript types for props

2. **Styling Approach**:
   - Use Tailwind utility classes for most styling
   - Define reusable utility classes in the global CSS
   - Maintain consistent spacing and alignment

3. **Best Practices**:
   - Follow React hooks rules
   - Use functional components with hooks
   - Implement responsive design for all screen sizes
   - Ensure accessibility compliance

## Deployment

The application is built and deployed using modern web hosting platforms that support static site deployment with optional serverless functions.

## Future Enhancements

1. **Multi-language Support**: Adding language switching capability for international buyers
2. **Virtual Tours**: 3D walkthroughs of the villas
3. **Booking System**: Direct booking functionality for property viewings
4. **User Authentication**: Secure area for registered investors

## Project Context

This luxury real estate website aims to showcase the premium quality and unique selling points of the Skypearls Villas development, emphasizing:

1. **Smart Home Technology**: Advanced features that set these villas apart
2. **Prime Location**: Proximity to key attractions in Siargao
3. **Luxury Lifestyle**: High-end amenities and design
4. **Investment Potential**: ROI and appreciation opportunities

The visual design and content structure work together to create an aspirational, premium, and trustworthy online presence that reflects the sophisticated tropical lifestyle the villas offer.
