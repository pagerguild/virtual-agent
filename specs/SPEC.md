# virtual-agent

## Goal

Automate booking logistics for performing artists who self-manage. Prevent overpaying on last-minute flights, optimize tour routing, generate riders, and handle hotel bookings — saving real money and time for artists who don't have dedicated management.

## Target User

Chic — a performing artist who books her own travel. Currently spends up to $3,000 on flights by booking the day before. Needs tour routing optimized, riders generated for promoters, and hotels booked near venues.

## User Stories

1. As an artist, I want to enter my upcoming gig cities and dates so that the system finds the cheapest flight combinations across the whole tour
2. As an artist, I want a rider document auto-generated from my preferences so that promoters can sign off without back-and-forth
3. As an artist, I want hotel recommendations near each venue sorted by price so I don't have to search manually
4. As an artist, I want to see total tour cost projections so I can budget before confirming bookings
5. As an artist, I want alerts when flight prices drop for my upcoming routes so I can book at the optimal time

## Features

### Core Features (MVP)
- [ ] Tour route optimizer: input cities + dates, output cheapest flight routing
- [ ] Rider document generator: template-based, outputs PDF
- [ ] Hotel search: by venue proximity, sorted by price
- [ ] Itinerary dashboard: all bookings in one view
- [ ] Budget tracker: projected vs actual spend per tour

### Extended Features
- [ ] Flight price monitoring and drop alerts
- [ ] Promoter communication templates (email/text)
- [ ] Calendar sync (Google Calendar, Apple Calendar)
- [ ] Historical cost analytics (spend over time, savings vs last-minute)
- [ ] Multi-artist support (manage a small roster)

## Technical Stack

### Frontend
- Framework: React + Next.js
- Styling: Tailwind CSS
- State: React Query for server state

### Backend
- Runtime: Bun
- Framework: Hono or Elysia
- Database: SQLite (via Drizzle ORM) for local dev, PostgreSQL for prod

### External Services
- Flight search: Google Flights API or Amadeus Self-Service API (https://developers.amadeus.com/)
- Hotel search: Booking.com Affiliate API or Amadeus Hotel Search
- Maps/routing: Google Maps Directions API
- PDF generation: Puppeteer or react-pdf
- Email: Resend or SendGrid

## Data Model

### Entities

**Artist**
```
- id: uuid
- name: string
- email: string
- preferences: json (dietary, tech requirements, travel preferences)
- rider_template: text (default rider content)
```

**Tour**
```
- id: uuid
- artist_id: uuid (FK)
- name: string
- start_date: date
- end_date: date
- budget: decimal
- status: enum (planning, confirmed, in_progress, completed)
```

**Gig**
```
- id: uuid
- tour_id: uuid (FK)
- venue_name: string
- city: string
- date: date
- promoter_name: string
- promoter_email: string
- fee: decimal
- rider_status: enum (draft, sent, signed)
```

**Booking**
```
- id: uuid
- gig_id: uuid (FK)
- type: enum (flight, hotel)
- provider: string
- confirmation_number: string
- cost: decimal
- check_in: datetime
- check_out: datetime
- details: json
```

**Rider**
```
- id: uuid
- gig_id: uuid (FK)
- content: json (sections: hospitality, technical, travel, misc)
- pdf_url: string
- status: enum (draft, sent, signed)
```

### Relationships
- Artist has many Tours
- Tour has many Gigs
- Gig has one Rider
- Gig has many Bookings (flights + hotels)

## API Endpoints

### Tours
- `GET /tours` - List artist's tours
- `POST /tours` - Create tour with gigs
- `GET /tours/:id` - Tour detail with all gigs and bookings
- `PUT /tours/:id` - Update tour

### Route Optimization
- `POST /tours/:id/optimize` - Find cheapest flight routing across all gigs
- `GET /tours/:id/flights` - Get flight options for each leg
- `POST /tours/:id/flights/:legId/book` - Confirm a flight selection

### Hotels
- `GET /gigs/:id/hotels` - Search hotels near venue
- `POST /gigs/:id/hotels/book` - Book a hotel

### Riders
- `POST /gigs/:id/rider` - Generate rider from template + gig details
- `GET /gigs/:id/rider/pdf` - Download rider PDF
- `POST /gigs/:id/rider/send` - Email rider to promoter

### Dashboard
- `GET /dashboard` - Upcoming gigs, pending riders, budget summary

## Success Criteria

- [ ] User can input 5+ cities and get optimized flight routing
- [ ] Route optimizer returns results cheaper than individual one-way searches
- [ ] Rider PDF generates with all required sections
- [ ] Hotel search returns results sorted by distance from venue
- [ ] Dashboard shows all upcoming bookings in chronological order
- [ ] Budget tracker shows projected vs actual within 5% accuracy
- [ ] Full tour planning flow completes in under 5 minutes

## Out of Scope

- Actual flight/hotel booking transactions (MVP shows options + links)
- Payment processing
- Multi-user auth system (single-artist MVP)
- Native mobile app (web-first)

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Flight API rate limits / cost | High | Cache results, use Amadeus free tier (500 calls/mo) |
| No single API for all airlines | Medium | Start with Amadeus, add Skyscanner as fallback |
| Route optimization is NP-hard at scale | Low | TSP heuristic is fine for <20 cities |
| Rider format varies by genre/venue | Medium | Template system with customizable sections |

## Questions for Interview

- What are Chic's typical tour sizes (number of cities)?
- Does she have airline preferences or loyalty programs?
- What's currently in her rider (hospitality, tech, travel)?
- Does she need ground transport (rental cars, Ubers) or just flights?
- What's her typical lead time for booking (how far in advance does she know dates)?

---

**Last Updated:** Feb 24, 2026
