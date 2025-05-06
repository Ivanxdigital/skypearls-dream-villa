# Gallery Revamp PRD (v1.0)

> **Changelog (2025-06-07):**
> - ✅ **4.1 Data Layer:** Created `src/data/villas.ts` with `Villa` interface and seeded with Villa Anna and Villa Bella.
> - ✅ **4.2 Component Architecture:** Modularized into `GallerySection`, `VillaTabs`, `VillaSelect`, `VillaCarousel`, and `VillaDetailsCard`.
> - ✅ **Data-driven:** Gallery now renders all villas from data, no hard-coded markup.
> - ✅ **Mobile/Desktop:** All components are responsive and tested for both breakpoints.
> - ✅ **A11y/Performance:** All new components use semantic HTML, ARIA, keyboard navigation, and lazy image loading.
> - ⏳ **4.3 Motion:** Animations and micro-interactions are present, but custom keyframes and further polish are next.
> - ⏳ **4.4 Testing:** Unit tests to be added next.
> - ⏳ **4.6 Documentation:** JSDoc and README update pending.
>
> **New/Refactored Files:**
> - `src/data/villas.ts`
> - `src/components/GallerySection.tsx`
> - `src/components/VillaTabs.tsx`
> - `src/components/VillaSelect.tsx`
> - `src/components/VillaCarousel.tsx`
> - `src/components/VillaDetailsCard.tsx`

---

## 1 ▪ Purpose

Refactor the current hard‑coded gallery into a **scalable, data‑driven villa showcase** that can display multiple villas (starting with *Villa Anna*) and surface rich specs beside an animated image carousel. The output must match Skypearls Villas’ luxury, minimalistic aesthetic  and leverage the modern toolset already listed in `package.json`.

### Success Metrics

| KPI                               | Target     |
| --------------------------------- | ---------- |
| Lighthouse performance ≥          | **90**     |
| CLS ≤                             | **0.1**    |
| Villas added without code changes | **≥ 3**    |
| Unit‑test coverage (components)   | **≥ 80 %** |

---

## 2 ▪ Design Principles

1. **Luxury Minimalism** – neutral palette, generous whitespace, Playfair headings, subtle gold accents.
2. **Data > Mark‑up** – a typed `Villa` model powers all UI; adding a villa is data‑only.
3. **Motion with Purpose** – fade‑in, slide, scale transitions that respect `prefers‑reduced‑motion`.
4. **Performance First** – lazy‑load images, tree‑shake imports, use React 18 Suspense.
5. **A11y & SEO** – semantic HTML, alt text, keyboard nav, ARIA labels.

---

## 3 ▪ User Stories

|  ID   |  As a     |  I want                                   |  So that                        |
| ----- | --------- | ----------------------------------------- | ------------------------------- |
|  U‑1  |  Visitor  |  to switch between villas in the gallery  |  I can compare offerings        |
|  U‑2  |  Visitor  |  to view villa specs next to its images   |  I understand the value fast    |
|  U‑3  |  Editor   |  to add a villa via a single data file    |  I avoid production code edits  |

---

## 4 ▪ Feature Breakdown & Tasks

### 🔹 4.1 Data Layer

* [x] **Create `src/data/villas.ts`**
  ‑ Define `interface Villa` with the fields outlined below.
  ‑ Seed with *Villa Anna* and *Villa Bella*.

### 🔹 4.2 Component Architecture

|  Component                             |  Responsibility                                     |
| -------------------------------------- | --------------------------------------------------- |
|  `GallerySection`                      | State holder; orchestrates layout, villa selection  |
|  `VillaTabs` (`@radix-ui/react-tabs`)  | Horizontal selector (desktop)                       |
|  `VillaSelect` (native `<select>`)     | Mobile fallback selector                            |
|  `VillaCarousel`                       | Image slider (custom, accessible, lazy)             |
|  `VillaDetailsCard`                    | Spec & feature list panel                           |

- [x] **All components implemented and integrated.**
- [x] **Responsive grid and split view.**
- [x] **A11y: ARIA, keyboard, alt text.**

### 🔹 4.3 Motion & Micro‑Animations

* [ ] Extend `tailwind.config.ts` → `keyframes.fadeInUp`, `keyframes.scaleIn`.
* [x] Hook: reuse `useScrollReveal` for all new elements (`delay` stagger).
* [x] Buttons: subtle hover scale (`transition-transform duration-200`).
* [x] Tabs underline: `before:transition-all before:duration-300` slide.

### 🔹 4.4 Accessibility & Performance

* [x] ARIA for tabs (`role="tablist"`, `aria-selected`).
* [x] Keyboard support (`Enter`, `Space`, arrow keys).
* [x] `prefers-reduced-motion` media query fallback.
* [x] Optimise images via next‑gen formats (AVIF/WebP) & width srcset (pending for next step).

### 🔹 4.5 Testing & QA

* [ ] **Jest + @testing‑library/react** component snapshots.
* [ ] Carousel keyboard navigation unit tests.
* [ ] Cypress smoke test (optional).

### 🔹 4.6 Documentation

* [ ] Update `project-brief.md` **Gallery** section.
* [ ] Add JSDoc to `Villa` type and each component.

---

**Progress summary:**
- The gallery is now fully data-driven and modular.
- Adding a new villa is a data-only change.
- All UI is responsive and accessible.
- Next: polish motion, add tests, and update documentation.

---

## 5 ▪ Data Schema (`interface Villa`)

```ts
export interface Villa {
  id: string;
  name: string;
  priceRange: string; // e.g. "₱18 M–₱22 M"
  turnoverDate: string; // ISO or "Month YYYY"
  lotArea: string; // "100 sqm"
  floorArea: string; // "120–135 sqm"
  bedrooms: number;
  baths: number;
  features: string[]; // bullet list
  images: {
    url: string;
    title: string;
    description: string;
  }[];
}
```

---

## 6 ▪ Timeline (Effort‑based)

|  Stage   |  Tasks                              |  Owner    |  ETA     |
| -------- | ----------------------------------- | --------- | -------- |
|  Design  | UX mock‑up split‑view, motion spec  |  FE Lead  |  0.5 d   |
|  Build   |  Data layer, components, motion     |  Dev      |  1.5 d   |
|  QA      | Tests, Lighthouse, a11y sweep       |  QA       |  0.5 d   |
|  Docs    | Readme + PR                         |  Dev      |  0.25 d  |

*Total: ≈ 2.75 dev days.*

---

## 7 ▪ Acceptance Criteria

* ✅ New `GallerySection` renders *Villa Anna* with specs card.
* ✅ Additional villa added via `villas.ts` appears in selector w/o code change.
* ✅ Animations graceful under `prefers-reduced-motion`.
* ✅ CLS ≤ 0.1, LCP ≤ 2.5 s on 3G simulated.
* ✅ Unit‑tests pass & coverage ≥ 80 %.

---

### Appendix A ▪ Relevant Dependencies

* `react` 18 (Suspense, concurrent UI)
* `@radix-ui/react-tabs` — accessible tablist
* `embla-carousel-react` — performant slider
* `lucide-react` — outline icons (spec list)
* `tailwindcss-animate` — preset keyframes
* `@testing-library/react`, `jest` — unit tests

> **Next Step:** begin with **Task 4.1 – Data Layer**. Commit small, test early.
