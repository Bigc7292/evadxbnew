# EVA DXB New Website - Project Documentation

## Project Overview
EVA Real Estate Dubai (@evaestate.eu) website rebuild using modern web technologies. The project transforms the existing real estate brokerage site into a premium, AI-powered, immersive luxury real estate platform.

## Tech Stack
- **Frontend Framework**: Next.js 15.5.21 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Animations**: Framer Motion v11
- **Internationalization**: next-intl (10 locales: en, ar, ru, zh, fr, de, es, hi, pt, tr)
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Maps**: Google Maps JavaScript API + Street View (fallback to Leaflet/MapLibre)
- **Hosting**: Vercel (free tier)
- **CMS**: Custom admin dashboard with live content editing

## Current Project State

### Completed Features

#### 1. Core Infrastructure
- Next.js 15 App Router with TypeScript
- Multi-language support (10 locales) with next-intl
- Supabase integration with TypeScript types
- Middleware for locale routing
- Responsive layout with custom fonts (Inter, Playfair Display, Cormorant Garamond)

#### 2. Navigation & Header
- Fixed green header with EVA branding (#154938 green, #C5A059 gold)
- Local logo integration (public/logo.jpg)
- Language selector dropdown with flag emojis
- Compact tabbed mobile menu (Properties, Company, Socials)
- Admin login link in mobile menu
- Desktop navigation links: Off-Plan Properties, Secondary Properties, Contact Us

#### 3. Hero Section (lib/components/HeroSection.tsx)
- **3D Cursor-Driven Parallax**: Mouse movement controls 3D tilt/pan of hero layers
- **Hero Layers**: Sky, Burj middle, foreground PNG assets with CSS 3D transforms
- **Animated Gold Particles**: 20 floating particles with infinite animation
- **Badge**: "Top 5 Real Estate Agency in Dubai" with pulsing gold indicator
- **Headline**: "Real Estate Agency In Dubai" with gold text-shadow glow
- **Slogan**: "WHERE VISION MEETS VALUE" in Cormorant Garamond with gradient-gold
- **Description**: Premium copy about exceptional properties across Dubai
- **Unified Search Panel**: Glass-morphism search bar with:
  - Search input with gold icon
  - Location selector (All Locations, Dubai Marina, Palm Jumeirah, Downtown Dubai, Business Bay)
  - Primary search CTA button
- **Quick Links**: Off-Plan Properties, Properties, Featured
- **CTA Buttons**: Explore properties + Contact us
- **Scroll Indicator**: Removed (was part of old scroll-based 3D effect)

#### 4. Pages Implemented
- Homepage (/) with hero, trust bar, stats
- Off-Plan Properties (/properties/off-plan) - 283 listings with infinite scroll
- Secondary Properties (/properties) - all listings
- Property Detail (/properties/[slug]) - full property view
- About Us, CEO, Team, Partners, Rewards pages
- Blog page
- Contact page
- Admin Dashboard (/admin) with:
  - Dashboard overview
  - Properties management
  - Agents management
  - Blog management
  - Login page

#### 5. Components
- Navigation.tsx - Main navigation header
- HeroSection.tsx - Hero with 3D parallax and search
- PropertyCard.tsx - Property listing card
- PropertyDetail.tsx - Full property view
- InfinitePropertyGrid.tsx - Infinite scroll grid
- ListingsGrid.tsx - Filterable listings grid
- MapComponents.tsx - Map integration
- CustomCursor.tsx - Custom cursor effect
- ErrorBoundary.tsx - Error handling

#### 6. Design System
- **Colors**: 
  - Primary Green: #154938 (logo-matched)
  - Gold Accent: #C5A059
  - Dark Surface: #030A07
  - Light Surface: #F8F6F0
- **Fonts**:
  - Inter (sans-serif, body)
  - Playfair Display (heading)
  - Cormorant Garamond (serif, accent)
- **Typography Scale**: 4 sizes in hero (badge, H1, slogan, body)
- **Animations**: Framer Motion with luxury easing curves

#### 7. Trust Bar & Stats
- "As seen in" marquee with partner logos
- Stats: 29K+ Clients, 30K+ Deals, 130+ Partners
- Animated counters with gradient-gold

### Skills Added

#### 1. firecrawl
- Web scraping and research capabilities
- Site mapping and crawling
- Content extraction from web pages
- Used for: Researching competitors, extracting property data, monitoring website changes

#### 2. agent-reach
- Multi-platform social media research
- 15 platforms supported (Instagram, Twitter/X, LinkedIn, etc.)
- Used for: Brand research, competitor analysis, lead generation

#### 3. kilo-config
- Kilo AI agent configuration management
- MCP server configuration
- Skill and permission management
- Used for: Managing AI coding agents, tool permissions

#### 4. webapp-testing
- Playwright-based browser automation
- UI testing and screenshot capture
- Form interaction and navigation testing
- Used for: Verifying UI changes, debugging layout issues, testing user flows

### Database Schema (Supabase)
- Properties table with geo coordinates
- Agents/Team members
- Blog posts
- Admin users with role-based access
- Content blocks for live editing

### Known Issues & Notes
- dmin.login translation keys missing in some locales (non-blocking build warnings)
- Google Maps/Street View API key needed for production
- Framer Motion v11 used (v12 requires React 19)
- Scroll-based 3D effect removed; cursor-only 3D remains

## Development Commands
- 
pm run dev - Start development server
- 
pm run build - Production build
- 
pm run lint - Lint code
- 
pm run type-check - TypeScript check

## Git Workflow Rules (Effective Immediately)
1. Every code change must be committed with a descriptive message
2. Documentation updates must be committed separately from code changes
3. Commit messages must follow format: 	ype(scope): description
   - Types: feat, fix, docs, style, refactor, test, chore
   - Scope: hero, navigation, properties, admin, i18n, etc.
4. No direct pushes to main/master without review
5. All commits must include updated documentation if behavior changes
6. Sensitive files (.env.local, API keys) must never be committed

## Next Steps
1. Complete Google Maps/Street View integration
2. Implement AI chatbot advisor
3. Add virtual tour support
4. Build admin live content editor
5. Integrate Goyzer CRM API
6. Add payment plan calculators
7. Implement ROI tools
8. Add referral program features
