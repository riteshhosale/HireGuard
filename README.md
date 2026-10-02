## Stack

- Frontend: React + Vite
- Backend: Node.js + Express + TypeScript
- Database: MongoDB
- AI: Google Gemini
- Browser automation: Playwright

## Features

- User authentication and authorization
- Website scan orchestration
- Risk analysis and findings generation
- Evidence collection and reporting
- AI-assisted insights for suspicious patterns

## Project structure

- `frontend/` — React client app
- `backend/` — Express API and scanner workers
- `docker-compose.yml` — local multi-service setup
- `postman/` — API examples and collection files

## Prerequisites

- Node.js 18+
- npm
- MongoDB running locally or via Docker
- Gemini API key

## Local setup

### 1. Install dependencies

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2. Configure environment variables

Copy the example file:

```bash
cp backend/.env.example backend/.env
```

Update the values in `backend/.env` with your actual configuration.

### 3. Start the app

For the frontend:

```bash
cd frontend
npm run dev
```

This starts the frontend dev server.

For the backend:

```bash
cd backend
npm run dev
```

### 4. Run with Docker

```bash
docker compose up --build
```

## Backend scripts

```bash
cd backend
npm run dev
npm run build
npm run typecheck
npm run test:api
```

## Frontend scripts

```bash
cd frontend
npm run dev
npm run build
npm run preview
```

## Notes

- The backend requires a valid MongoDB URI and JWT secrets.
- The scanner service depends on Docker and Playwright runtime support.
- Do not commit real `.env` files to the repository.

## License

This project is currently licensed under the ISC license in the backend package configuration.

## SEO and production hardening

The frontend includes clean URL handling, a custom 404 route, per-route page titles and descriptions, canonical URLs, robots.txt, sitemap.xml, llms.txt, Open Graph/Twitter share metadata, a branded share image, structured data, breadcrumb markup, route-based code splitting, disabled production source maps, and security response headers.

Set `VITE_SITE_URL` to the final custom domain when the domain is connected in Vercel. The current value points to the existing HireGuard AI Vercel deployment and can be changed without editing source code.

## Launch-readiness updates

The current frontend includes privacy and terms pages, cookie consent with opt-in analytics, responsive/mobile navigation, custom 404 handling, SEO metadata, sitemap/robots/llms files, social metadata, accessible focus states, client-side form validation, error/success feedback, clickable support contacts, and mobile overflow protection.

The backend includes request body limits, configured CORS, Helmet security headers, authentication/scan rate limiting, and a honeypot-based basic bot/spam check. Production secrets remain server-side; only Vite `VITE_*` values intended for browser use belong in the frontend environment.

## JobGuard Community

Authenticated users can publish factual job-scam experiences, attach their own HireGuard AI scan results, comment, like, bookmark, and report community posts. Public sharing is opt-in and the UI warns users to remove personal information from evidence.

Community API base: `/api/v1/community`
