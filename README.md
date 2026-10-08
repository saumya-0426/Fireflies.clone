# Fireflies Clone — Project Plan

A staged plan for building the meeting notes and transcription platform described in the Scaler full stack assignment. The focus is a polished, usable post-meeting workflow: browse meetings, inspect searchable transcripts, review summaries and action items, and manage meeting data.

> Stages 1–6 are complete. Stage 7's product polish, documentation, and deployment preparation are complete; publishing and live deployment are pending.

## Fireflies reference

- [Fireflies.ai public website](https://fireflies.ai/) — use only as a visual reference for UI direction, such as brand colors, typography, spacing, imagery, and overall polish.

The provided Word assignment is the source of truth for functionality, technical requirements, scope, and deliverables. Do not add product features solely because they appear on the public website. The implementation should reproduce the assignment requirements in an original interface inspired by the site's visual style, without copying its source code or assets.

## Product scope

### Required in the first complete release

- A meetings library with title, date, duration, and participants.
- Search, filters for title/date/participant, and recency sorting.
- A meeting detail view with transcript speakers and timestamps, a placeholder media player, and transcript search with highlighted matches.
- Selecting a transcript segment seeks the player to that timestamp; player position updates the active transcript segment.
- Meeting summary, key topics or chapters, and manageable action items.
- Create, edit, and delete meetings; edit meeting metadata; create, edit, and complete action items.
- Persistent meeting, transcript, summary, and action-item data.
- Seeded meetings with realistic transcripts, summaries, and action items.
- Fireflies-inspired navigation and layout, forms, modals, notifications, and settings placeholders.
- README documentation for setup, architecture, schema, API, and assumptions.

### Explicitly outside the core scope

Real-time meeting bots, actual speech-to-text, third-party integrations, team collaboration, and real authentication can be presented as placeholders. Transcription is not required: use seeded data or accept transcript text, VTT, or JSON files. Summary generation may be seeded or mocked; LLM integration is optional.

## Stages

### Stage 1 — Discovery, requirements, and UX blueprint — Complete

**What we did**

- Used the provided Word assignment as the authority for functionality, scope, stack, and deliverables.
- Reviewed the [Fireflies public website](https://fireflies.ai/) only for visual direction. Its public structure uses a clear top navigation, prominent headline and calls to action, and grouped feature sections with supporting visuals. These are visual hierarchy cues; its marketing features do not add to our app scope.
- Mapped required user flows and screen structure below. The wireframes are intentionally low-fidelity and describe layout and behavior, not copied assets or a pixel-perfect reproduction.
- Separated required work from optional bonuses and out-of-scope placeholders.

**Outcome**

- Requirements and acceptance checklist documented below.
- Core screen map, user flows, and responsive behavior agreed.
- Visual direction constrained to the public website; all app functionality remains tied to the assignment.

**Tech/tools used**

- Assignment Word document and browser for reference review.
- Markdown for this requirements and UX blueprint.
- No application framework or implementation code in this stage.

#### User flows

1. **Find and open a meeting:** open the meetings library → scan meeting title/date/duration/participants → search or filter by title, date, or participant → sort by recency → select a meeting.
2. **Review a meeting:** view meeting details → read summary and topics → search transcript and see highlighted matches → select a timestamped segment to seek the media placeholder → use playback position to follow the active transcript segment.
3. **Create a meeting:** start create flow → enter metadata and paste or upload transcript → save → see the new meeting in the library and its transcript in detail.
4. **Maintain meeting data:** open a meeting → edit title or participants, or delete with confirmation → see persisted changes in the library/detail view.
5. **Manage action items:** open a meeting → add or edit a task → mark it complete or incomplete → see the saved state reflected in the meeting.
6. **Handle unavailable features:** open a settings/profile or explicitly out-of-scope area → show a clear placeholder or “Coming Soon” message rather than implying a working integration or authentication flow.

#### Screen map and low-fidelity wireframes

**A. Meetings library**

```text
┌──────────────────────────────────────────────────────────────┐
│ App mark     Primary navigation                 Profile/menu │
├──────────────┬───────────────────────────────────────────────┤
│ Side nav     │ Meetings                         [+ New]      │
│              │ [Search meetings…] [Date] [Participant] [Sort]│
│              │                                               │
│              │ Meeting        Date       Duration Participants│
│              │ ───────────────────────────────────────────── │
│              │ Row            Row data              [Open]   │
│              │ Row            Row data              [Open]   │
└──────────────┴───────────────────────────────────────────────┘
```

Required behavior: library rows show title, date, duration, and participants; search/filter/sort update visible meetings; create/edit/delete actions have clear form, confirmation, and feedback states.

**B. Meeting detail**

```text
┌──────────────────────────────────────────────────────────────┐
│ App navigation / breadcrumb                 Meeting actions  │
├──────────────────────────────────────────────────────────────┤
│ Meeting title · date · duration · participants               │
├───────────────────────────────┬──────────────────────────────┤
│ Summary / notes               │ Transcript                   │
│ • Summary                     │ [Search transcript…]         │
│ • Topics / chapters            │ 00:00 Speaker: Segment text  │
│ • Action items                │ 00:14 Speaker: Segment text  │
│   [Add task] [Complete]       │ 01:02 Speaker: Segment text  │
├───────────────────────────────┴──────────────────────────────┤
│ Media placeholder: play/pause · seek bar · current time       │
└──────────────────────────────────────────────────────────────┘
```

Required behavior: transcript selection seeks to its timestamp; playback time selects the matching transcript segment; transcript search highlights matches. At narrower widths, panels stack and remain usable without horizontal overflow.

**C. Create/edit meeting flow**

```text
┌───────────────────────────────┐
│ New meeting / Edit meeting    │
│ Title                         │
│ Date and duration             │
│ Participants                  │
│ Transcript: paste / upload    │
│ [Cancel]              [Save]  │
└───────────────────────────────┘
```

Required behavior: validate required input, provide upload/paste support for transcript creation, preserve edits, and show success or error feedback. Deletion uses a separate confirmation dialog.

#### Acceptance checklist for core scope

- [x] Library displays title, date, duration, and participants for seeded meetings.
- [x] Search and filters support title, date, and participant; sorting supports recency.
- [x] Meeting detail contains speaker-labeled, timestamped transcript, summary, action items, topics/chapters, and media placeholder.
- [x] Transcript search highlights matching text.
- [x] Selecting a transcript segment seeks the player; player time updates the selected segment.
- [x] Users can create, edit, and delete meetings and create meetings from pasted/uploaded transcripts.
- [x] Users can add, edit, complete, and remove action items.
- [x] Meetings and related content persist across refreshes.
- [x] Several complete seeded meetings make the application usable immediately.
- [x] Navigation, forms, modals, notifications, and settings placeholders support the required workflows.
- [x] README documents setup, stack, architecture, schema, API, and assumptions.
- [ ] Public repository and deployed demo are available.

#### Optional and placeholder boundary

- **Optional after core:** transcript comments/highlights/soundbites, exports, global search, tags/topic filtering, meeting Q&A, dark mode.
- **Placeholder or out of scope:** live-call bot, real speech-to-text, Zoom/Meet/calendar/CRM integrations, team collaboration, real authentication.
- Do not add marketing-site features to the product scope unless independently required by the Word assignment.

#### Visual direction

- Use the public site's visual hierarchy as inspiration: simple primary navigation, a strong page heading, clear primary actions, and visually separated content groups.
- Apply the reference's brand palette, typography, spacing, and visual tone after direct visual inspection during UI implementation. This plan does not invent exact color values or font names.
- Keep the product screens focused on the assignment's meeting-library and post-meeting workflows. Use original layout details and assets.

### Stage 2 — Project foundation and design system — Complete

**What we did**

- Created separate `frontend/` and `backend/` applications.
- Scaffolded a Next.js App Router frontend with TypeScript, Tailwind CSS, and ESLint; added the meetings shell, navigation, responsive layout, and placeholder routes for meetings, meeting detail, and settings.
- Added an initial FastAPI service with a health endpoint and configurable local CORS origin.
- Added `.env.example`, root ignore rules, and local startup instructions below.
- Chose a small CSS variable set and reusable shell styles to establish spacing, colors, typography, and responsive behavior. The visual direction is informed by the public website; application functionality remains scoped to the assignment.

**Outcome**

- Frontend app scaffold and dependencies are installed in `frontend/`.
- Backend source and dependency manifest are in `backend/`; a local virtual environment is created and dependencies are installed there.
- The `/meetings`, `/meetings/[meetingId]`, and `/settings` routes have a shared navigation shell. At this stage, all routes were placeholders; Stage 4 replaced `/meetings` with the connected library, and Stage 5 implemented meeting detail.
- Backend health endpoint: `GET /api/health`.
- Frontend/backend local startup commands are documented below.

**Tech stack used**

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4, ESLint.
- Backend: Python 3.11, FastAPI, Uvicorn, CORS middleware.
- Tooling: Node.js 24/npm, Python virtual environment, Git.

### Stage 3 — Data model, database, API, and seed data — Complete

**What we did**

- Designed normalized SQLite tables for meetings, participants, meeting-participant links, transcript segments, one summary per meeting, topics/chapters, and action items.
- Added SQLAlchemy 2 models, session handling, SQLite foreign-key enforcement, and an Alembic migration for the schema.
- Implemented validated REST routes for meeting list/detail/create/update/delete, transcript and summary retrieval, and action-item create/update/delete.
- Added filtering and pagination to the meeting list and seeded three meetings with participants, ten transcript segments each, summaries, topics, and action items.

**Outcome**

- Persistent SQLite database at `backend/data/fireflies.db` (ignored by Git and reproducible from the migration and seed command).
- Migration history is in `backend/migrations/versions/`.
- Route details and database relationships are documented in the sections below.
- API data is seeded without external transcription or AI services.

**Tech stack used**

- Python 3.11, FastAPI, Uvicorn, SQLAlchemy 2, Alembic, Pydantic 2, SQLite.

### Stage 4 — Meetings library and meeting management — Complete

**What we did**

- Connected the meetings screen to the FastAPI API and SQLite data using the shared typed API helper.
- Added a meeting list with title, date/time, duration, and participants, plus server-backed title/participant search, date range filters, and newest/oldest sorting.
- Added create and edit dialogs for meeting metadata and participants, plus delete confirmation.
- Added transcript paste and local upload for `.txt`, `.vtt`, and `.json` files. Text/VTT and supported JSON segment structures are converted into timestamped transcript segments before saving.
- Added loading, empty, error/retry, success-toast, and responsive list states.

**Outcome**

- Users can browse, search, filter, create, edit, and delete meetings from the UI.
- Meeting metadata and transcript segments are sent to the API and persist in SQLite.
- The library displays the Stage 3 seed meetings; the meeting detail experience is implemented in Stage 5.

**Tech stack used**

- Next.js App Router, React, TypeScript, Tailwind CSS 4 plus CSS variables for the interface.
- Shared `apiFetch` helper, FastAPI routes, Pydantic validation, SQLAlchemy, and SQLite.
- Browser `File.text()` to read supported transcript files locally.

### Stage 5 — Meeting detail, transcript, and media interaction — Complete

**What we did**

- Replaced the meeting-detail placeholder with a responsive meeting workspace that loads the selected meeting and all related data from the existing detail API.
- Rendered timestamped transcript segments with speaker labels, transcript search, and highlighted matches.
- Added an interactive sample timeline with play/pause, seek, and skip controls. Selecting a transcript segment or topic moves the timeline; timeline position highlights the active transcript segment.
- Added loading, retry/error, not-found, empty-transcript, and no-search-match states.

**Outcome**

- Users can open a meeting, review its summary and topics, search transcript text/speakers, and navigate the transcript by timestamp.
- Transcript selection, topic selection, and the sample timeline stay synchronized.
- The player is a timeline preview only; no audio file or real playback is included.

**Tech stack used**

- Next.js App Router, React, TypeScript, and responsive CSS.
- Shared `apiFetch` helper and the existing FastAPI meeting-detail endpoint backed by SQLite.
- Accessible HTML buttons and range input for transcript navigation and the sample timeline.

### Stage 6 — Summary, topics, action items, and feedback — Complete

**What we did**

- Kept each meeting's seeded summary and topics visible alongside its transcript; topic timestamps seek the timeline.
- Added action-item creation, editing, completion/reopening, and removal using the existing persistent API.
- Added action-item validation, immediate local updates after API success, pending states, inline success/error feedback, and a removal confirmation.
- Added Groq chat-completion summaries for new meetings with transcript segments when `GROQ_API_KEY` is configured; explicitly supplied summaries remain unchanged.
- Added a local extractive mock fallback when the key is absent or a Groq request fails. Existing demo meetings keep their seeded summaries.

**Outcome**

- Meeting detail provides a complete post-meeting review experience.
- Action-item changes persist in SQLite and refresh into the meeting view.
- Users receive clear feedback for successful and failed operations.

**Tech stack used**

- Next.js App Router, React, TypeScript, and responsive CSS.
- Existing FastAPI action-item endpoints and SQLite persistence.
- Seeded summary/topic data; no external AI service.

### Stage 7 — Product polish, documentation, and deployment preparation — Ready to publish

**What we did**

- Added a keyboard skip link, consistent focus-visible outlines, and reduced-motion support; kept the meeting detail layout responsive through narrow widths.
- Confirmed settings, profile, and out-of-scope features are clearly represented as placeholders.
- Completed setup, stack, architecture, schema, API, and scope documentation in this README.
- Added a Render Blueprint for the API with a persistent SQLite disk, startup migrations/seeding, and a health check.
- Documented the Vercel frontend configuration and the deployment verification steps below.

**Outcome**

- The local project is documented and configured for a persistent-disk Render API and a Vercel Next.js frontend.
- Public GitHub publication and hosted URLs remain pending because this workspace has no Git repository remote or connected hosting account.

**Tech stack used**

- Existing frontend and backend stack.
- Render Blueprint, Python/FastAPI, SQLite on a persistent disk, and Vercel for Next.js.
- Environment variables for the frontend API URL and backend CORS origin.

## Database schema

The current SQLite schema is managed by Alembic and implemented in `backend/app/models.py`:

- **Meeting**: id, title, date/time, duration, created/updated timestamps.
- **Participant**: id, display name, optional unique email. `meeting_participants` is the many-to-many join table.
- **TranscriptSegment**: id, meeting id, start/end seconds, speaker label, text, and unique segment position per meeting.
- **MeetingSummary**: one summary per meeting, with overview text and update timestamp.
- **MeetingTopic**: id, meeting id, title, optional start time, and unique position per meeting.
- **ActionItem**: id, meeting id, description, optional assignee and due date, completion status, and timestamps.

Foreign keys and indexes support common library filters and meeting-to-content lookups.

## Architecture

- **Frontend (`frontend/`)**: Next.js App Router, React, and TypeScript. The meetings library and detail view call the backend through the shared `apiFetch` helper. The public browser variable `NEXT_PUBLIC_API_BASE_URL` is the API origin, such as `https://your-api.example.com`; request paths already include `/api`.
- **Backend (`backend/`)**: FastAPI exposes the REST API, Pydantic validates payloads, SQLAlchemy maps records, and Alembic applies schema migrations.
- **Persistence**: SQLite stores meetings and related records. Local development stores it at `backend/data/fireflies.db`. Production must point `DATABASE_URL` at persistent storage. The supplied Render Blueprint mounts `/var/data` and uses `/var/data/fireflies.db`.
- **Seed data**: `python -m app.seed` inserts sample meetings if they are missing and does not overwrite existing samples. New transcript summaries use Groq when configured and fall back to local mock logic.
- **Request flow**: browser page → `apiFetch` → FastAPI route → Pydantic schema → SQLAlchemy session → SQLite; responses return typed JSON used by the React view.

## Groq summaries

- New meetings with transcript segments get a Groq-generated summary when the backend has `GROQ_API_KEY` configured. The default model is `openai/gpt-oss-20b`; override it with `GROQ_MODEL` if needed.
- Add the key only to `backend/.env` for local use, or to the backend service's secret environment variables when hosted. Never put it in a `NEXT_PUBLIC_` variable or frontend code.
- If the key is missing or Groq returns an error, meeting creation continues with a local extractive mock summary. Existing seeded summaries are not regenerated.
- When enabled, transcript speaker labels and text are sent from the backend to Groq to produce the summary. Don't enable it for transcript data that you aren't allowed to send to the configured provider. See [Groq's Python client guide](https://console.groq.com/docs/libraries) and [supported models](https://console.groq.com/docs/models).

## API overview

All routes are under `/api`. FastAPI's interactive schema is available at `/docs` when the backend is running. Request and response schemas are defined in `backend/app/schemas.py`.

- `GET /api/health` — API availability.
- `GET /api/meetings?q=&date_from=&date_to=&participant=&sort=newest&limit=50&offset=0` — list/filter/sort meetings. `sort` accepts `newest` or `oldest`.
- `POST /api/meetings` — create a meeting with optional participants, transcript segments, summary, topics, and action items.
- `GET /api/meetings/{meeting_id}` — meeting metadata and all related detail content.
- `PATCH /api/meetings/{meeting_id}` — update title, date, duration, or participant list.
- `DELETE /api/meetings/{meeting_id}` — delete a meeting and cascade-delete its content.
- `GET /api/meetings/{meeting_id}/transcript` — timestamped transcript segments.
- `GET /api/meetings/{meeting_id}/summary` — meeting summary (nullable if absent).
- `POST /api/meetings/{meeting_id}/action-items` — create an action item.
- `PATCH /api/action-items/{action_item_id}` — edit an action item or update its completion state.
- `DELETE /api/action-items/{action_item_id}` — delete an action item.

Example `POST /api/meetings` body:

```json
{
  "title": "Design review",
  "started_at": "2026-10-08T10:00:00",
  "duration_seconds": 1800,
  "participants": [{ "name": "Alex Kim", "email": "alex@example.com" }],
  "transcript_segments": [
    { "position": 0, "start_seconds": 0, "end_seconds": 12, "speaker": "Alex Kim", "text": "Let's review the updated flow." }
  ],
  "summary": { "overview": "The team reviewed the updated flow and agreed on next steps." },
  "topics": [{ "position": 0, "title": "Updated flow", "start_seconds": 0 }],
  "action_items": [{ "description": "Share the revised mockups", "assignee": "Alex Kim", "is_completed": false }]
}
```

## Local development

Use two terminals from the repository root. The frontend starts at `http://localhost:3000`; the API starts at `http://localhost:8000` and exposes interactive API docs at `/docs`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

`frontend/.env.example` documents `NEXT_PUBLIC_API_BASE_URL`, the API base URL used by the shared request helper. Copy it to `.env.local` if you need to change the default.

### Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload --port 8000 --env-file .env
```

The migration command creates or upgrades `backend/data/fireflies.db`. The seed command is safe to rerun: it adds missing example meetings and leaves existing seeded meetings unchanged. The API health route is `http://localhost:8000/api/health`. Set `FRONTEND_ORIGIN` or `DATABASE_URL` in `backend/.env` to override defaults. To enable Groq summaries, add `GROQ_API_KEY` to `backend/.env`; `GROQ_MODEL` defaults to `openai/gpt-oss-20b`. Without a key, the API uses a local mock summary. The virtual environment and local SQLite database are excluded from version control.

## Deployment preparation

### API on Render

1. Push the project to a Git provider and create a Render Blueprint from the repository root. Render reads [`render.yaml`](render.yaml), whose service root is `backend/`.
2. The Blueprint creates a Python web service, attaches a persistent disk at `/var/data`, applies Alembic migrations, runs the idempotent seed command, and checks `/api/health`.
3. Set `FRONTEND_ORIGIN` to the deployed Vercel origin (for example, `https://your-app.vercel.app`, with no trailing slash). The API allows this exact origin through CORS. Add `GROQ_API_KEY` as a secret environment variable to enable generated summaries; optionally set `GROQ_MODEL` to another currently supported model.
4. Keep the service at one instance while using SQLite on a disk. Render disks are attached to one instance and are not available during build or pre-deploy commands; the Blueprint therefore runs migrations at service startup. See [Render Blueprint configuration](https://render.com/docs/blueprint-spec) and [persistent disk limitations](https://render.com/docs/disks).

### Frontend on Vercel

1. Import the repository into Vercel and set the project root directory to `frontend/`.
2. Add `NEXT_PUBLIC_API_BASE_URL` to the Production environment, with the Render service origin only (for example, `https://your-api.onrender.com`, no `/api` suffix).
3. Deploy or redeploy after setting the variable. Next.js inlines `NEXT_PUBLIC_` values into client bundles at build time, so the API URL must be correct for the build. See the [Next.js environment variable guide](https://nextjs.org/docs/app/guides/environment-variables).

### Hosted smoke-check checklist

- Open `https://<api-host>/api/health` and confirm the API reports `status: ok`.
- Open `https://<api-host>/docs` and confirm the OpenAPI page loads.
- Open the deployed frontend, confirm the seeded meeting library loads, then open a meeting and search its transcript.
- Create a meeting and action item, refresh, and confirm both remain; then remove the temporary records.
- Confirm the browser console has no failed API requests or CORS errors.

Hosted smoke checks have not yet been run because no hosting project or deployed URLs are available in this workspace.

## Assumptions and scope decisions

- The default logged-in user is assumed; authentication is not required.
- Transcripts and summaries can be supplied as seed data or uploaded/pasted. No real speech-to-text pipeline is required.
- The media player may use a placeholder or sample asset; the important requirement is timestamp interaction with transcript segments.
- Optional bonus features should be considered after the required user flows work end to end.
- UI fidelity is a core evaluation area, so visual research and refinement are part of the plan rather than a final coat of paint.
- Keep the work original and be prepared to explain every implementation decision.
- The assignment estimates approximately 24 hours. The exact submission deadline is communicated separately.

## Definition of done

The first complete release is ready when seeded meetings load, users can search and filter the library, open a meeting, search and navigate its transcript, review its summary and topics, manage action items and meeting metadata, and see all changes persist. The app should have a Fireflies-inspired responsive interface, documented setup and architecture, a public repository, and a working deployed demo.
