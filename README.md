# Fireflies Clone

A meeting notes and transcript workspace built for the Scaler full-stack assignment. The interface is inspired by [Fireflies.ai](https://fireflies.ai/).

## Introduction

This app lets users manage meetings, add transcripts, review transcript segments, search transcript text, view summaries and topics, and manage action items. Meeting data is stored in SQLite.

Real speech-to-text and real audio playback are outside the project scope. The media area provides an interactive timeline placeholder that follows transcript and topic selections.

## Tech Stack

- **Frontend:** Next.js App Router, React, TypeScript, Tailwind CSS
- **Backend:** Python, FastAPI, Pydantic, SQLAlchemy, Alembic
- **Database:** SQLite
- **AI summaries:** Groq Python SDK, with a local mock fallback

## Steps to Run Locally

### 1. Start the backend

In a terminal:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
If you already have a backend/.env file, keep it and skip the Copy-Item command. Add your Groq API key to the backend environment file if you want Groq-generated summaries.
Then run the database migrations, seed the sample meetings, and start the API:

alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload


The backend runs at http://localhost:8000. Its interactive API documentation is at http://localhost:8000/docs.
```
```2. Start the frontend
Open a second terminal:
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev

The frontend runs at http://localhost:3000. Open that address in your browser.
If frontend/.env.local already exists, keep it and skip the Copy-Item command.
3. Check the app
- Open the Meetings page and confirm the seeded meetings appear.
- Create a meeting and confirm it appears in the list.
- Open a meeting, add or upload a transcript, and check its transcript segments.
- Check the summary, topics, and action items.
- Refresh the page and confirm saved data remains available.
```
```Results
The app provides:
- A meeting list with search, date filters, participant filters, and sorting.
- Meeting creation, editing, and deletion.
- Transcript entry by pasting text or uploading TXT, VTT, or JSON files.
- Transcript review with speakers, timestamps, search, and highlights.
- Meeting summaries, topics, and action items.
- Groq-generated summaries when a backend API key is configured; otherwise, a local mock summary is used.
- SQLite storage and seeded sample meetings.
```
```Conclusion
This project demonstrates a meeting transcript and notes workflow using Next.js, FastAPI, and SQLite. It supports optional AI summaries through Groq. Real-time meeting bots, speech-to-text, integrations, authentication, and real audio playback are outside its current scope.
```


