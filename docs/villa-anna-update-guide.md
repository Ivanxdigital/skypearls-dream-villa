# Villa Anna Information Update - AI Coding Agent Guide

## 🎯 Project Overview
Update Villa Anna's information in the Skypearls Villas website to reflect:
- Under construction status
- Flexible pricing (furnished vs unfurnished)
- Updated turnover timeline
- Negotiable pricing indication

## 📋 Task Manager Checklist

### ✅ Phase 1: Data Structure Updates - COMPLETED
- [x] **Task 1.1**: Update Villa interface in `src/data/villas.ts`
- [x] **Task 1.2**: Update Villa Anna data with new pricing and status
- [x] **Task 1.3**: Verify Villa Perles data compatibility

### Phase 2: Component Enhancements  
- [ ] **Task 2.1**: Enhance VillaDetailsCard component
- [ ] **Task 2.2**: Add status badge styling
- [ ] **Task 2.3**: Implement two-tier pricing display
- [ ] **Task 2.4**: Add negotiable indicator

### Phase 3: UI/UX Polish
- [ ] **Task 3.1**: Update Tailwind classes for new elements
- [ ] **Task 3.2**: Add hover states and microinteractions
- [ ] **Task 3.3**: Ensure mobile responsiveness
- [ ] **Task 3.4**: Test accessibility compliance

### Phase 4: Testing & Validation
- [ ] **Task 4.1**: Test villa switching functionality
- [ ] **Task 4.2**: Verify visual consistency across breakpoints
- [ ] **Task 4.3**: Check animation timing with scroll reveals

---

## ✅ Phase 1 Implementation Summary

### Changes Made to `src/data/villas.ts`

**Villa Interface Updates:**
```typescript
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
}
```

**Villa Anna Data Updates:**
- ✅ **Price Range**: Updated from "₱23M" to "₱18M - ₱21M"
- ✅ **Price Options**: Added furnished (₱18M - ₱21M) and unfurnished (₱16M - ₱19M) pricing
- ✅ **Status**: Set to "Under Construction"
- ✅ **Negotiable Flag**: Added `isNegotiable: true`
- ✅ **Construction Note**: Added "Expected completion July 2025"
- ✅ **Turnover Date**: Updated from "June 2025" to "July 2025"

**Villa Perles Compatibility:**
- ✅ **Status**: Added `status: "Available"` to maintain interface compliance
- ✅ **Existing Data**: All current features and pricing preserved

**Validation:**
- ✅ **TypeScript**: No type errors, strict mode compliance
- ✅ **Build**: Project builds successfully with new data structure
- ✅ **Data Integrity**: Both villas maintain backward compatibility

### Next Steps: Phase 2 Ready
With the data structure updates complete, the project is now ready for Phase 2: Component Enhancements. The VillaDetailsCard component can now access:
- `villa.status` for status badges
- `villa.priceOptions` for two-tier pricing display  
- `villa.isNegotiable` for negotiable indicators
- `villa.constructionNote` for additional context

---

## 🔧 Implementation Details

### Task 1.1: Update Villa Interface

**File**: `src/data/villas.ts`

**Changes Required**:
```typescript
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
}
```

### Task 1.2: Update Villa Anna Data

**File**: `src/data/villas.ts`

**Villa Anna Updates**:
```typescript
{
  id: "villa-anna",
  name: "Villa Anna",
  priceRange: "₱18M - ₱21M",
  priceOptions: {
    furnished: "₱18M - ₱21M",
    unfurnished: "₱16M - ₱19M"
  },
  status: "Under Construction",
  isNegotiable: true,
  constructionNote: "Expected completion July 2025",
  turnoverDate: "July 2025",
}
```

### Task 2.1: Enhance VillaDetailsCard Component

**File**: `src/components/VillaDetailsCard.tsx`

**New Elements to Add**:

1. **Status Badge Component**:
```jsx
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Under Construction':
        return {
          color: 'bg-amber-100 text-amber-800',
          icon: <Construction className="h-4 w-4" />,
          text: 'Under Construction'
        };
      // ... other cases
    }
  };
  // Implementation details
};
```

2. **Enhanced Pricing Display**:
```jsx
const PricingSection = ({ villa }) => (
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-2">
      <h3 className="text-xl md:text-2xl font-playfair text-skypearl-dark">
        {villa.name}
      </h3>
      <StatusBadge status={villa.status} />
    </div>
    
    <div className="space-y-1">
      <p className="text-lg md:text-xl font-medium text-skypearl">
        {villa.priceRange}
        {villa.isNegotiable && (
          <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Negotiable
          </span>
        )}
      </p>
      
      {villa.priceOptions && (
        <p className="text-sm text-skypearl-dark/70">
          {villa.priceOptions.unfurnished} (Unfurnished)
        </p>
      )}
      
      <p className="text-xs text-skypearl-dark/60">
        Estimated completion pricing
      </p>
    </div>
  </div>
);
```

### Task 2.2: Status Badge Styling

**Tailwind Classes to Add**:
- Construction status: `bg-amber-100 text-amber-800 border-amber-200`
- Available status: `bg-green-100 text-green-800 border-green-200`
- Coming Soon status: `bg-blue-100 text-blue-800 border-blue-200`

**Badge Structure**:
```jsx
<div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border">
  {icon}
  <span>{text}</span>
</div>
```

### Task 2.3: Two-Tier Pricing Layout

**Design Specifications**:
- Primary pricing: Larger, bold, main color
- Secondary pricing: Smaller, muted, with label
- Negotiable indicator: Small pill badge
- Spacing: Consistent with existing design system

### Task 2.4: Negotiable Indicator

**Implementation**:
- Small badge with handshake icon
- Hover tooltip explaining price flexibility
- Green color scheme to indicate positive/flexible

---

## 🎨 Design System Compliance

### Colors to Use
- **Construction status**: Amber (`amber-100`, `amber-800`)
- **Negotiable badge**: Green (`green-100`, `green-800`)  
- **Secondary text**: `skypearl-dark/70` for unfurnished pricing
- **Muted text**: `skypearl-dark/60` for notes

### Typography Hierarchy
- Villa name: `text-xl md:text-2xl font-playfair`
- Primary price: `text-lg md:text-xl font-medium text-skypearl`
- Secondary price: `text-sm text-skypearl-dark/70`
- Price notes: `text-xs text-skypearl-dark/60`

### Icons to Import
Add to existing imports in VillaDetailsCard.tsx:
```typescript
import { 
  // ... existing icons
  Construction, 
  Handshake, 
  Info 
} from 'lucide-react';
```

---

## 🧪 Testing Checklist

### Functional Tests
- [ ] Villa switching maintains correct data display
- [ ] Status badges appear correctly for each villa
- [ ] Pricing information displays properly on all screen sizes
- [ ] Negotiable indicator shows/hides appropriately

### Visual Tests
- [ ] Status badge colors match design system
- [ ] Pricing hierarchy is clear and readable
- [ ] Mobile layout doesn't break with new elements
- [ ] Hover states work smoothly

### Accessibility Tests
- [ ] Status badges have proper ARIA labels
- [ ] Color contrast meets WCAG standards
- [ ] Screen readers can interpret pricing structure
- [ ] Keyboard navigation works with new elements

---

## 📱 Mobile Considerations

### Responsive Adjustments
- Stack pricing vertically on mobile
- Reduce badge sizes for smaller screens
- Ensure touch targets are adequate (min 44px)
- Test text truncation on very small screens

### Breakpoint Specific Changes
- `sm:` Adjust spacing and font sizes
- `md:` Full desktop layout
- `lg:` Maintain current large screen optimizations

---

## 🚀 Final Validation

Before marking complete, verify:
1. All tasks in checklist are completed
2. No console errors or warnings
3. Design matches luxury/minimalist aesthetic
4. Performance isn't impacted by changes
5. Other villas still display correctly

---

## 📝 Notes for AI Agent

- Maintain existing scroll reveal animations
- Don't break Villa Perles data structure
- Keep luxury brand aesthetic throughout
- Use existing utility classes where possible
- Test changes incrementally (one task at a time)
- Preserve accessibility features from original components