# Fast Pace — Local Business Lead Generation & Sales OS

Fast Pace is a local-business lead discovery, business intelligence, opportunity detection, outreach CRM, and proposal generator built specifically for freelance full-stack developers and digital agencies selling software solutions (websites, booking engines, WhatsApp automations, custom CRMs, internal dashboards, and direct ordering systems).

---

## Key Features

1. **Local Business Discovery (OpenStreetMap / Overpass / Nominatim)**
   - Search by address or browser geolocation with radius filtering (1 to 15 km).
   - Search presets: *Local Business Prospects*, *Website Prospects*, *Automation Prospects*, *High-Ticket Prospects*, *Ice Distribution Prospects*.
   - Multi-category selection across Food, Health, Hospitality, Professional Services, Beauty, Education, Automotive, Retail, Events, and Fitness.
   - Built-in deduplication (OSM object IDs & normalized name + coordinate hashing).
   - In-memory request caching and exponential retry backoff to respect public API limits without scraping restrictions.

2. **Interactive OpenStreetMap with Leaflet**
   - Dynamic client-side Leaflet mapping with search center pin, radius circle indicator, and interactive business markers with one-click navigation to Lead 360 profiles.

3. **Lead Intelligence & 0–100 Heuristic Scoring**
   - **Estimated Lead Score (0–100)**: Based on verified direct phone, established web presence, high-value industry tier, proximity within 3 km, and local rating.
   - **Estimated Opportunity Score (0–100)**: Quantifies likelihood of a software problem (e.g. +30 for no website, +20 for weak/outdated site, +20 for missing appointment booking in clinics/salons, +15 for missing direct ordering in food outlets, +15 for missing WhatsApp hooks).

4. **Digital Opportunity Audit Center**
   - Non-intrusive public website heuristic analyzer checking SSL/HTTPS, mobile viewport responsiveness, direct contact availability, WhatsApp hooks, online booking, and SEO title/description signals.

5. **Personalized Outreach Generator**
   - Generates human-reviewed, non-spammy conversation starters tailored to each business's specific opportunity and location.
   - Multi-tone generator: **WhatsApp (Conversational)**, **Phone Call Talking Points Track**, **Professional Email Draft**, **Friendly Coffee Pitch**, **Short & Punchy**, and **Follow-up Nudge**.
   - 1-click **Launch WhatsApp Web** (`https://wa.me/...`) and **Open Email Draft** (`mailto:...`).

6. **Full Sales Lifecycle CRM & Visual Kanban Pipeline**
   - Track leads across stages: *New*, *Researched*, *Contacted*, *WhatsApp Sent*, *Called*, *Interested*, *Discovery Scheduled*, *Discovery Completed*, *Proposal Sent*, *Negotiating*, *Won*, *Lost*, and *Follow Up Needed*.
   - Dedicated Follow-ups Desk tracking *Due Today*, *Overdue*, and *Upcoming* scheduled tasks.

7. **Client Discovery Session & Solution Scoping Studio**
   - Structured intake questions covering business volume, current spreadsheets/tools, operational bottlenecks, enquiry leakage, and customer complaints.
   - Instant heuristic synthesizer generating the core problem statement, recommended MVP scope, Phase 2 expansion, and expected qualitative benefits.

8. **Interactive Proposal Builder & PDF/Print Export**
   - Turn discovery findings into formal client proposals with scope feature checklists, milestone payment breakdowns (50% Kickoff / 30% UAT / 20% Live Launch), and print/PDF export styling.

9. **Clients & Project Delivery Tracker**
   - Convert closed won leads directly into Clients and manage active software delivery milestones (Discovery, Design, Development, Testing, Deployment, Maintenance).

10. **Multi-Sheet Excel Export (ExcelJS)**
    - Formatted `.xlsx` workbook export with 6 dedicated sheets: *Leads*, *Business Intelligence*, *CRM Pipeline*, *Discovery*, *Summary*, and *Settings*.

11. **Ice Mode & Custom Configuration**
    - Built-in Settings center with developer agency profile configuration and an optional **Ice Distribution Mode** supporting commercial ice requirements (daily kg volume, ice types, supplier notes).

---

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Primitives, Lucide Icons, Glassmorphism palette
- **Mapping**: Leaflet, React-Leaflet, OpenStreetMap CartoDB Tiles
- **Database & ORM**: SQLite with Prisma ORM
- **Exporting**: ExcelJS (.xlsx multi-sheet generation)
- **Data APIs**: OpenStreetMap Overpass QL API, Nominatim Geocoding

---

## Quick Start & Local Installation

### 1. Prerequisites
- Node.js 18+ or 20+
- Yarn (`npm install -g yarn`)

### 2. Install Dependencies
```bash
yarn install
```

### 3. Initialize Database & Seed Demo Data
```bash
# Push schema to SQLite database (dev.db)
npx prisma db push

# Populate rich Bangalore & HSR Layout prospect seed dataset
yarn seed
```

### 4. Start Development Server
```bash
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build

To test and compile the optimized production bundle:
```bash
yarn build
yarn start
```

---

## Ethical, Legal & API Compliance

- **No Scraping**: Fast Pace strictly avoids scraping HTML from Google Maps or using headless browser automation to bypass anti-bot protections.
- **OpenStreetMap Attribution**: Map data is sourced under the Open Database License (ODbL).
- **Rate-Limit Respect**: Nominatim and Overpass API queries are cached in-memory and rate-limited.
- **Human-Reviewed Outreach**: The platform generates drafts and 1-click links for human review to prevent automated bulk spam.
