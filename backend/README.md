# PASUGO Backend Foundation

This is the Phase 2A backend foundation for PASUGO.

## Purpose

This backend provides the initial Express + TypeScript foundation, MySQL connectivity, graceful shutdown handling, security middleware, and a health-check endpoint at `/api/health`.

## Environment

Copy `.env.example` to `.env` and set the values for your local machine.

```bash
cp .env.example .env
```

## Scripts

```bash
npm install
npm run dev
```

Then open:

- http://localhost:3000/api/health

## Notes

- Authentication is not implemented yet.
- Firebase is not implemented yet.
- Booking, GPS, messaging, notifications, and payment features are intentionally not included in Phase 2A.
