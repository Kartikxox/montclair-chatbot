# Montclair Chatbot

Standalone AI chatbot for Montclair (monclair.in), built on the same stack as the Indoarab chatbot:
Node.js/Express + Supabase + Google Gemini, with an embeddable vanilla JS widget.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - Supabase URL + **pooler** service key (IPv4, port 6543 — not the direct/IPv6 connection)
   - Gemini API key
   - Shopify Admin API token (for order tracking + future stock sync)
3. Run `schema.sql` in the Supabase SQL editor to create `brands`, `products`, `knowledge_base` tables and seed the Montclair brand row.
4. Add product rows and FAQ entries for Montclair to `products` and `knowledge_base`.
5. `npm start` — server runs on `PORT` (default 3000).
6. Open `http://localhost:3000/test.html` to try the widget locally.

## Endpoints

- `GET /api/health` — health check (for uptime pinger to prevent Render cold-start / Supabase auto-pause)
- `POST /api/ask` — `{ question, history }` → Gemini-powered Q&A grounded in brand/product/FAQ context
- `POST /api/track-order` — `{ orderNumber, email }` → Shopify order + fulfillment/tracking lookup

## Deployment (same pattern as Indoarab)

- Deploy to Render (or Railway), bind `0.0.0.0`, use `process.env.PORT`
- Set up an uptime pinger against `/api/health` to keep Render + Supabase free tiers warm
- Production embed: add `<script src="https://your-deploy-url/widget.js" data-brand-id="montclair"></script>` into the Shopify theme.liquid
- `test.html` is dev-only — never deployed to the live store

## Not yet built

- Stock sync cron job pulling live Shopify inventory into Supabase (`stock_qty`, `in_stock`) — filtering logic in `lib/brandData.js` is ready for it
- Per-brand Shopify credentials in Supabase (currently just env vars — fine for a single-tenant demo, but should move to the `brands` table columns to match the multi-tenant platform's pattern before productionizing)
