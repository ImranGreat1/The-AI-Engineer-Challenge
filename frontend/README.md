### Mindful Coach Frontend

A one-page Next.js chat UI for the FastAPI backend in `/api/index.py`.

## What you get

- A calm, high-contrast chat experience
- Streaming replies from `POST /api/chat`
- Starter prompts to help you begin quickly
- Local development via a Next.js rewrite to `http://localhost:8000`

## Prerequisites

1. Backend dependencies installed from the project root:

```bash
uv sync
```

2. A Gemini API key in the project root `.env`:

```bash
GEMINI_API_KEY=your-key-here
```

3. Node.js 20+ and npm

## Run locally

Open two terminals.

**Terminal 1 — backend**

From the project root:

```bash
uv run uvicorn api.index:app --reload
```

The API should be available at `http://localhost:8000`.

**Terminal 2 — frontend**

From this directory:

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The frontend sends requests to `/api/chat`, and Next.js proxies them to the FastAPI server using `API_URL` from `.env.local`.

## Production note

When you deploy the frontend separately from the backend, set `API_URL` in your hosting environment to your deployed FastAPI URL, or update the rewrite/proxy strategy to match your Vercel setup.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — run the production build locally
