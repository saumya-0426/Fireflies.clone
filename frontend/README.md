# Frontend

Next.js App Router application for the Fireflies clone. The root [`README.md`](../README.md) contains the complete project plan and local setup instructions.

## Current routes

- `/meetings` — connected meeting library with search, filters, sorting, and meeting create/edit/delete flows.
- `/meetings/[meetingId]` — placeholder for the later transcript and meeting detail workflow.
- `/settings` — settings placeholder; real authentication and account management are outside the assignment's core scope.

## Development

```powershell
npm install
npm run dev
```

The app runs at `http://localhost:3000`. Copy `.env.example` to `.env.local` to configure `NEXT_PUBLIC_API_BASE_URL`. API calls should use the shared helper in `src/lib/api.ts`.
