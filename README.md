# Chills & Vibes — Your Party Hub

A fully functional, responsive frontend for the **Chills & Vibes** event/party brand — built as a premium, frontend-only ticketing experience, with an original nightlife identity (near-black background, gold + violet glass accents, ticket-stub styling).

> **Frontend-only project.** There is no backend, database, or real Paystack integration. Payment and ticket flows are fully simulated for demonstration. See [Future Backend Integration](#future-backend-integration) below for exactly where to wire in real services later.

---

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — dev server & build tool
- **Tailwind CSS** — utility-first styling
- **Framer Motion** — animations & page transitions
- **React Icons** — icon set
- **React Router v6** — client-side routing
- **qrcode.react** — mock QR ticket generation

---

## Getting Started (VS Code)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18 or later
- VS Code (recommended extensions: *ES7+ React Snippets*, *Tailwind CSS IntelliSense*)

### 2. Install dependencies
Open the project folder in VS Code, open a terminal (`` Ctrl+` ``), and run:

```bash
npm install
```

### 3. Run the dev server

```bash
npm run dev
```

Visit the printed local URL (usually `http://localhost:5173`).

### 4. Build for production

```bash
npm run build
```

Output goes to the `dist/` folder. Preview the production build locally with:

```bash
npm run preview
```

---

## Project Structure

```
src/
  assets/
    images/            # logo.png, jersey-hero.avif + placeholder images
  components/           # Reusable UI building blocks
    Navbar.tsx
    Footer.tsx
    Hero.tsx
    Button.tsx
    SectionTitle.tsx
    EventCard.tsx
    EventFilter.tsx
    TicketCard.tsx
    QuantitySelector.tsx
    OrderSummary.tsx
    Gallery.tsx
    Lightbox.tsx
    ContactForm.tsx
    CheckoutForm.tsx
    SuccessScreen.tsx
    SocialButton.tsx
    EmptyState.tsx
  pages/                # One component per route
    Home.tsx
    Tickets.tsx
    About.tsx
    Contact.tsx
    Events.tsx
    EventDetail.tsx
    Checkout.tsx
    NotFound.tsx
  layouts/
    MainLayout.tsx       # Navbar + Footer wrapper, scroll-to-top on route change
  data/                  # Mock data — swap for API calls later
    events.ts
    tickets.ts
    gallery.ts
  hooks/
    useScrolled.ts        # Navbar blur-on-scroll
    useCheckout.tsx        # Shared cart/checkout state (React Context)
  utils/
    format.ts              # Currency formatting, mock payment reference generator
  types/
    index.ts                 # Shared TypeScript interfaces
  App.tsx                     # Routes + page transitions
  main.tsx
  index.css                    # Design tokens, glass/ticket-stub utilities
```

---

## How the Major Pieces Work

### Navigation
`Navbar.tsx` is a fixed, sticky header that turns translucent/blurred once you scroll past 20px (`useScrolled` hook). On mobile it collapses into a hamburger that opens an animated dropdown menu (Framer Motion `AnimatePresence`).

### Home Page & Hero
`Hero.tsx` uses the **Jersey Party flyer** as a full-bleed background with a parallax scroll effect (`useScroll` + `useTransform` from Framer Motion), a subtle zoom, gradient overlays for legibility, and floating gold/violet glow orbs.

### Tickets & Order Summary
`Tickets.tsx` renders three `TicketCard`s (Early Bird, Stand Stool, VIP Lounge), each with a fully working `QuantitySelector` (+/-, minimum of 1). Selecting a ticket and adjusting quantity updates a shared `useCheckout` context, which powers the `OrderSummary` — sticky on desktop, a floating expandable sheet on mobile — with a live-calculated subtotal/total.

### Checkout & Mock Payment
`Checkout.tsx` reads the selected ticket from context. Submitting `CheckoutForm` (with validation) triggers a **simulated** 2.2s "Processing payment..." loading state, then generates a mock payment reference and reveals `SuccessScreen` — a die-cut **ticket-stub styled** card (see the perforated edge in `index.css` → `.ticket-stub` / `.ticket-perf`) with a real scannable QR code (via `qrcode.react`) encoding the mock reference, and a **Download Ticket** button that exports the QR as an SVG file.

### Gallery & Lightbox
`Gallery.tsx` renders a responsive masonry-style grid with hover zoom/overlay captions. Clicking any image opens `Lightbox.tsx` — a fullscreen viewer with Previous/Next/Close controls and keyboard navigation (arrow keys, `Esc`).

### Upcoming Events & Filtering
`Events.tsx` filters the `events` data array by category (`All / Parties / Concerts / Special Events`) using an animated pill selector (`EventFilter.tsx`, Framer Motion `layoutId` for the sliding highlight). Each event links to its own detail page (`EventDetail.tsx`) via `/events/:slug`.

### Contact
`Contact.tsx` shows direct WhatsApp (opens `wa.me/2347042491149`) and TikTok (`@chillandvibesofficial`) buttons, plus a validated `ContactForm` that "submits" with a mock success confirmation.

### Error & Empty States
`EmptyState.tsx` is reused for: no events in a filter, no ticket selected at checkout, and a styled 404 page (`NotFound.tsx`). Form errors appear inline under each field with animated transitions.

---

## Future Backend Integration

Every mock integration point is marked with a `TODO(backend)` comment in the code. Summary:

| Feature | File | What to do |
|---|---|---|
| Event & ticket data | `src/data/events.ts`, `src/data/tickets.ts`, `src/data/gallery.ts` | Replace static arrays with `fetch`/API calls (e.g. `GET /api/events`) |
| Payment | `src/pages/Checkout.tsx` | Replace the `setTimeout` mock with a real Paystack checkout call; verify the reference server-side |
| Ticket QR / PDF | `src/components/SuccessScreen.tsx` | Generate signed QR/PDF tickets server-side instead of client-side SVG export |
| Contact form | `src/components/ContactForm.tsx` | POST to `/api/contact` or an email service instead of the mock success state |
| Auth / admin dashboard / ticket verification / customer DB | *(not yet built)* | Frontend was intentionally structured (context + typed data) to make these additions straightforward |

---

## Customization

- **Logo & hero image**: replace `src/assets/images/logo.png` and `src/assets/images/jersey-hero.avif` with your own files (keep the same filenames, or update the imports in `Navbar.tsx`, `Footer.tsx`, and `data/events.ts`).
- **Colors**: edit the `gold`, `violet`, and `ink` values in `tailwind.config.js`.
- **Fonts**: `Unbounded` (display) and `Plus Jakarta Sans` (body) are loaded via Google Fonts in `index.html` — swap the `<link>` and `fontFamily` config to change them.
- **Ticket prices/tiers**: edit `src/data/tickets.ts`.
- **Events**: edit `src/data/events.ts`.

---

## Deployment

### Vercel
1. Push this project to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. Deploy.

### Netlify
1. Push this project to a GitHub repo.
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
3. Build command: `npm run build`. Publish directory: `dist`.
4. Deploy.

> Both platforms auto-redeploy on every push to your main branch.
