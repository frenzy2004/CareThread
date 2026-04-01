# CareThread — Track Your Health Journey

> A decision-support companion for people managing chronic and autoimmune conditions.

CareThread helps you take control of your health story. Whether you're juggling multiple specialists, trying to identify symptom triggers, or just want to walk into your next appointment with real data — CareThread gives you the tools to track, understand, and communicate your health clearly.

Built for patients who are tired of starting from scratch at every doctor's visit.

## Who It's For

- People living with **autoimmune or chronic conditions** (lupus, MS, IBD, fibromyalgia, etc.)
- Anyone seeing **multiple providers** who don't always talk to each other
- Patients who want to **spot patterns** between symptoms, medications, diet, and mood
- Anyone who wants a **private, local-first** health log without handing data to a corporation

## Features

- **Daily Check-ins** — Log mood and energy each day; build streaks to stay consistent.
- **Symptom Tracking** — Record symptoms with severity, body area, and notes.
- **Medication Management** — Track active medications, daily compliance, and rate effectiveness over time.
- **AI-Powered Insights** — After enough data, CareThread surfaces correlations and patterns automatically.
- **Timeline View** — See your full health history in one scrollable feed.
- **PDF Export** — Generate shareable reports for doctor visits.
- **Weekly Summaries** — At-a-glance overview of your past week.
- **Privacy-First** — Health data is stored locally on your device.

## Live Demo

[carethread.vercel.app](https://carethread.vercel.app)

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — dev server and bundler
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **Framer Motion** — animations
- **Supabase** — authentication
- **React Router** — client-side routing
- **TanStack React Query** — async state management
- **Recharts** — data visualization
- **jsPDF** — PDF export

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests |
| `npm run lint` | Lint the codebase |

## Project Structure

```
src/
├── components/       # Reusable UI and feature components
│   └── ui/           # shadcn/ui primitives
├── contexts/         # React context providers (Auth, HealthData)
├── hooks/            # Custom hooks (health data, insights, local storage)
├── integrations/     # Third-party service clients (Supabase)
├── lib/              # Utilities, constants, PDF export logic
├── pages/            # Route-level page components
├── test/             # Test setup and specs
└── types/            # TypeScript type definitions
```
