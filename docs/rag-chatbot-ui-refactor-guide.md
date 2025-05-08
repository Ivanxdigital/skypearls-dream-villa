# RAG ChatBot UI Refactor Guide v2

> **Purpose**  Ensure *both* interaction surfaces — **LeadForm** *and* **ChatPanel** — appear docked just above the floating toggle button (bottom‑right) **without** a fullscreen dark overlay, while keeping Radix accessibility features.

---

## 1 Scope & Goals

* **Primary goal** : Dock `ChatPanel` ✅ *and now* `LeadForm` ✅ 40 px above the FAB.
* **Secondary goals** :

  1. Remove opaque overlay from all docked dialogs for a lightweight widget feel.
  2. Preserve ESC‑to‑close, focus‑trap, and responsive behaviour.

---

## 2 Affected Files & Status

| File                           | Status       | Key Change                             |
| ------------------------------ | ------------ | -------------------------------------- |
| `src/components/ChatPanel.tsx` | ✅ Done       | Uses `dock-chat` + transparent overlay |
| `src/components/LeadForm.tsx`  | ✅ Done      | Added `dock-chat`, transparent overlay |
| `src/index.css`                | ✅ Done       | Contains `.dock-chat` utility          |

---

## 3 Implementation Steps

### 3.1 `dock-chat` Utility (already exists)

```css
.dock-chat[data-state="open"]{
  position:fixed;
  bottom:6rem; /* 56 px FAB + 40 px gap */
  right:1rem;
  left:auto; top:auto;
  transform:none;
}
```

### 3.2 Dock **ChatPanel** (done — reference)

```tsx
<DialogContent className="dock-chat … z-60" />
<DialogOverlay className="bg-transparent pointer-events-none" />
```

### 3.3 Dock **LeadForm** (✅ Done)

1. **Add** `dock-chat` class & higher z‑index:

   ```tsx
   <DialogContent
     className="dock-chat sm:max-w-[425px] md:max-w-[550px] max-h-[80vh] bg-skypearl-white border-skypearl-light shadow-xl z-60 animate-in fade-in data-[state=open]:duration-150"
   >
   ```
2. **Make overlay transparent & click‑through**:

    ```tsx
    <DialogOverlay className="bg-transparent pointer-events-none" />
    ```
3. **Optional fade‑in animation** (same as ChatPanel):
   Append `animate-in fade-in data-[state=open]:duration-150` to the className.

### 3.4 Mobile considerations (unchanged)

* Works at all breakpoints; future: switch to Radix `Sheet` on `<640 px`.

---

## 4 QA Checklist

* [x] **ChatPanel** docks correctly.
* [x] **LeadForm** docks in identical position.
* [x] No opaque overlay; page remains interactive behind docked dialogs.
* [x] ESC key & click‑outside close still work.
* [ ] No layout overlap (320–1920 px) (needs testing).

---

## 5 Commit Messages

1. `feat(leadform): dock LeadForm above floating toggle`
2. `style(dialog): transparent overlay for all docked dialogs`
3. `style(components): standardize z-index for docked dialogs`

---

## 6 Next Steps

* Implement mobile‑first `Sheet` if UX testing shows need.
* Consider saving user preference for panel visibility.

---

### End of Guide

All implementation steps are now complete! Test across different device sizes, then commit with messages above. 🚀
