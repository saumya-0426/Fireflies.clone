"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Meeting } from "@/lib/meetings";

function formatHomeDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(value));
}

export default function HomePage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    apiFetch<Meeting[]>("/api/meetings?sort=newest&limit=5", { signal: controller.signal })
      .then(setMeetings)
      .catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load your meetings."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return (
    <div className="page-wrap home-page">
      <section className="home-welcome">
        <div><span className="eyebrow muted-eyebrow">MEETING WORKSPACE</span><h1>Welcome back, Saumya.</h1><p>Your conversations, notes, and next steps are together in one place.</p></div>
        <div className="home-welcome-art" aria-hidden="true"><span>✳</span><i /><i /><i /></div>
      </section>

      <section className="home-quick-start" aria-labelledby="home-quick-title">
        <div className="home-section-heading"><div><span className="eyebrow muted-eyebrow">GET STARTED</span><h2 id="home-quick-title">Quick start</h2></div><p>Pick up where you left off.</p></div>
        <div className="home-action-grid">
          <Link href="/meetings" className="home-action-card home-action-purple"><span aria-hidden="true">＋</span><strong>Manage meetings</strong><small>Create a meeting or add a transcript</small></Link>
          <Link href="/tasks" className="home-action-card home-action-green"><span aria-hidden="true">✓</span><strong>Review action items</strong><small>See and update meeting next steps</small></Link>
          <Link href="/integrations" className="home-action-card home-action-plum"><span aria-hidden="true">✧</span><strong>Explore integrations</strong><small>View available workspace connections</small></Link>
        </div>
      </section>

      <section className="home-recent" aria-labelledby="recent-meetings-title">
        <div className="home-section-heading"><div><span className="eyebrow muted-eyebrow">YOUR WORKSPACE</span><h2 id="recent-meetings-title">Recent meetings <span className="home-count">{loading ? "…" : meetings.length}</span></h2></div><Link className="home-view-all" href="/meetings">View all meetings <span aria-hidden="true">→</span></Link></div>
        {error ? <p className="home-state home-error" role="alert">Could not load meetings. Check the backend connection and refresh this page.</p> : loading ? <p className="home-state" role="status">Loading recent meetings…</p> : meetings.length === 0 ? <div className="home-empty"><span aria-hidden="true">◷</span><h3>No meetings yet</h3><p>Create your first meeting to start organizing transcripts and notes.</p><Link className="button button-primary" href="/meetings">Open meetings</Link></div> :
          <div className="home-meeting-list">{meetings.map((meeting) => <Link className="home-meeting-row" href={`/meetings/${meeting.id}`} key={meeting.id}><span className="home-meeting-icon" aria-hidden="true">◷</span><span className="home-meeting-copy"><strong>{meeting.title}</strong><small>{meeting.participants.length} {meeting.participants.length === 1 ? "participant" : "participants"}</small></span><time dateTime={meeting.started_at}>{formatHomeDate(meeting.started_at)}</time><span className="home-row-arrow" aria-hidden="true">›</span></Link>)}</div>}
      </section>
    </div>
  );
}
