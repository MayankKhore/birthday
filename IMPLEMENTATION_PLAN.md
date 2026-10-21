# Birthday Experience Platform - Implementation Plan

## Project Overview
Build a production-quality birthday experience platform with Astro + TypeScript, static output, featuring:
- Personalized birthday wish generator
- Interactive birthday microsite creator
- Theme system with photo personalization
- Preview & sharing workflow
- Free/premium tier simulation
- Service interfaces for future backend integration

---

## Phase 1: Project Foundation & Configuration

### 1.1 Initialize Astro Project
- `package.json` with Astro, TypeScript, React (for editor), Tailwind CSS
- `astro.config.mjs` with static output, integrations
- `tsconfig.json` with strict mode
- `tailwind.config.mjs` with custom design tokens
- `.gitignore`, `.editorconfig`, `.prettierrc`

### 1.2 Design System & Tokens
- `src/styles/tokens.css` - CSS custom properties for colors, spacing, typography, shadows, transitions
- `src/styles/global.css` - Base styles, reset, reduced-motion support
- `tailwind.config.mjs` - Map tokens to Tailwind utilities

### 1.3 Service Interfaces (Architecture for Future)
- `src/services/interfaces/` - TypeScript interfaces for:
  - `AuthService` - authentication
  - `ProjectService` - birthday project CRUD
  - `ImageService` - image upload/storage
  - `SubscriptionService` - tier entitlements
- `src/services/adapters/local/` - Demo implementations using localStorage, IndexedDB, FileReader API

---

## Phase 2: Core UI Components & Layout

### 2.1 Layout Components
- `src/components/layout/Header.astro` - Navigation, logo, CTA
- `src/components/layout/Footer.astro` - Links, copyright
- `src/components/layout/MainLayout.astro` - Base layout with slots

### 2.2 UI Primitive Components (Astro)
- `src/components/ui/Button.astro` - Variants, sizes, states
- `src/components/ui/Input.astro` - Text, textarea, validation
- `src/components/ui/Select.astro` - Theme/tier selection
- `src/components/ui/Card.astro` - Content containers
- `src/components/ui/Modal.astro` - Dialogs, previews
- `src/components/ui/Toast.astro` - Notifications
- `src/components/ui/Spinner.astro` - Loading states

### 2.3 Theme System
- `src/lib/themes/` - Theme definitions (colors, gradients, backgrounds, accents)
- `src/components/theme/ThemeSelector.astro` - Visual theme picker
- `src/components/theme/ThemePreview.astro` - Live theme preview

---

## Phase 3: Birthday Wish Generator

### 3.1 Wish Generation Logic
- `src/lib/wishes/` - Message templates by category (heartfelt, funny, milestone, short, religious, belated)
- `src/lib/wishes/generator.ts` - Logic to generate personalized wishes
- `src/components/wishes/WishGenerator.astro` - Interactive generator UI
- `src/components/wishes/WishCard.astro` - Display generated wish with copy/share

### 3.2 Wish Categories & Templates
- Original prewritten templates (50+ messages across 6 categories)
- Variable substitution: `{name}`, `{age}`, `{relationship}`, `{customMessage}`

---

## Phase 4: Birthday Microsite Creator (Editor)

### 4.1 Editor State Management
- `src/lib/editor/state.ts` - Editor state types, default values
- `src/lib/editor/storage.ts` - localStorage draft persistence
- `src/components/editor/EditorProvider.tsx` - React context for editor (complex interactive state)

### 4.2 Editor Steps (Multi-step Wizard)
- `src/components/editor/steps/Step1Basics.tsx` - Name, age, relationship, occasion
- `src/components/editor/steps/Step2Message.tsx` - Wish selection, custom message
- `src/components/editor/steps/Step3Theme.tsx` - Theme selection, color customization
- `src/components/editor/steps/Step4Photos.tsx` - Photo upload, arrangement, captions
- `src/components/editor/steps/Step5Preview.tsx` - Full preview before publish

### 4.3 Photo Handling
- `src/components/editor/PhotoUploader.tsx` - Drag-drop, preview, reorder, delete
- `src/lib/images/client.ts` - Client-side image compression, preview generation

### 4.4 Editor Layout
- `src/pages/create.astro` - Main editor page with progress indicator
- `src/components/editor/EditorShell.tsx` - Step navigation, save draft, publish

---

## Phase 5: Preview & Share Pages

### 5.1 Public Birthday Page (SSR/Static)
- `src/pages/share/[slug].astro` - Public shareable birthday page
- `src/components/share/BirthdayPage.tsx` - Interactive birthday experience
- `src/components/share/PhotoGallery.tsx` - Swipeable photo carousel
- `src/components/share/WishDisplay.tsx` - Animated wish reveal
- `src/components/share/Confetti.tsx` - Celebration animation (reduced-motion aware)

### 5.2 Preview Page (Authenticated)
- `src/pages/preview/[id].astro` - Preview before publishing
- `src/components/preview/PreviewShell.astro` - Preview wrapper with edit button

### 5.3 SEO & Meta
- Dynamic Open Graph tags per birthday page
- Twitter Card support
- JSON-LD structured data

---

## Phase 6: Landing & Marketing Pages

### 6.1 Landing Page (`/`)
- Hero with value proposition
- Feature highlights
- Template gallery preview
- CTA to start creating
- Premium tier teaser

### 6.2 Template Gallery (`/templates`)
- Filterable grid of theme/category combinations
- Quick-start from template

### 6.3 Pricing Page (`/pricing`)
- Free vs Premium comparison
- Simulated upgrade flow

### 6.4 About/Help Pages
- `/how-it-works` - Step-by-step guide
- `/faq` - Common questions

---

## Phase 7: Dashboard & Project Management

### 7.1 User Dashboard (`/dashboard`)
- List of created projects (from localStorage)
- Edit, preview, duplicate, delete actions
- Draft vs published status

### 7.2 Project Actions
- Publish flow (generate slug, save to "published" store)
- Share modal (copy link, social share buttons)
- Download as HTML (future enhancement)

---

## Phase 8: Polish & Quality

### 8.1 Accessibility Audit
- Semantic HTML throughout
- ARIA labels, roles, live regions
- Focus management in modals/wizard
- Color contrast verification
- Keyboard navigation testing

### 8.2 Performance Optimization
- Image optimization (Sharp integration)
- Font optimization (self-hosted, preload)
- Critical CSS inlining
- Minimal JS - only hydrate interactive islands

### 8.3 Cross-browser Testing
- Mobile Safari, Chrome, Firefox, Edge
- Viewport testing (320px - 1440px+)

### 8.4 Build & Deploy Configuration
- `netlify.toml`, `wrangler.toml` (Cloudflare), GitHub Actions workflow
- Static adapter configuration
- Redirect rules for SPA-style routes

---

## File Structure Overview

```
src/
├── components/
│   ├── layout/          # Header, Footer, MainLayout
│   ├── ui/              # Button, Input, Select, Card, Modal, Toast, Spinner
│   ├── theme/           # ThemeSelector, ThemePreview
│   ├── wishes/          # WishGenerator, WishCard
│   ├── editor/          # EditorProvider, steps/, PhotoUploader, EditorShell
│   ├── share/           # BirthdayPage, PhotoGallery, WishDisplay, Confetti
│   └── preview/         # PreviewShell
├── pages/
│   ├── index.astro      # Landing
│   ├── create.astro     # Editor entry
│   ├── preview/[id].astro
│   ├── share/[slug].astro
│   ├── templates.astro
│   ├── pricing.astro
│   ├── dashboard.astro
│   └── api/             # Future API routes
├── lib/
│   ├── themes/          # Theme definitions
│   ├── wishes/          # Templates, generator
│   ├── editor/          # State, storage
│   ├── images/          # Client-side image handling
│   └── utils/           # Helpers (slugify, date, etc.)
├── services/
│   ├── interfaces/      # Service contracts
│   └── adapters/local/  # Demo implementations
├── styles/
│   ├── tokens.css
│   └── global.css
├── types/               # Global TypeScript types
└── content/             # Content collections (future)
```

---

## Implementation Sequence

1. **Foundation** (Phase 1) - Config, tokens, service interfaces
2. **UI Primitives** (Phase 2.1-2.2) - Reusable components
3. **Theme System** (Phase 2.3) - Core visual identity
4. **Wish Generator** (Phase 3) - Standalone feature, drives editor
5. **Editor** (Phase 4) - Most complex, React-based
6. **Share/Preview Pages** (Phase 5) - Public-facing experience
7. **Landing/Pages** (Phase 6) - Marketing
8. **Dashboard** (Phase 7) - Project management
9. **Polish** (Phase 8) - A11y, performance, deploy config

---

## Success Criteria per Phase

Each phase must:
- [ ] Build without TypeScript errors (`npm run build`)
- [ ] Pass lint (`npm run lint`)
- [ ] Render correctly in browser (manual verification)
- [ ] Have no console errors
- [ ] Work on mobile and desktop viewports
- [ ] Respect `prefers-reduced-motion`

---

## Next Steps

Begin with **Phase 1: Project Foundation & Configuration**. This establishes the project structure, design tokens, and service architecture that all subsequent phases depend on.