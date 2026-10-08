"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { apiFetch } from "@/lib/api";
import type { Meeting, MeetingDetail, MeetingPayload } from "@/lib/meetings";
import { parseParticipants, parseTranscript } from "@/lib/transcript";

type DialogMode = "create" | "edit";

function localDateTime(value?: string): string {
  const date = value ? new Date(value) : new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours} hr ${remaining} min` : `${hours} hr`;
}

function participantLabel(participants: Meeting["participants"]): string {
  return participants.map((person) => person.name).join(", ") || "No participants added";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message) as { detail?: string };
      if (parsed.detail) return parsed.detail;
    } catch {
      // Use the original message when the response is not JSON.
    }
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [query, setQuery] = useState("");
  const [participant, setParticipant] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialog, setDialog] = useState<{ mode: DialogMode; meeting?: Meeting } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ sort, limit: "100" });
      if (query.trim()) params.set("q", query.trim());
      if (participant.trim()) params.set("participant", participant.trim());
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      setLoading(true);
      setLoadError("");
      apiFetch<Meeting[]>(`/api/meetings?${params.toString()}`, { signal: controller.signal })
        .then((items) => setMeetings(items))
        .catch((error: unknown) => {
          if (!controller.signal.aborted) setLoadError(getErrorMessage(error));
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, participant, dateFrom, dateTo, sort, refreshKey]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }, []);

  async function saveMeeting(payload: MeetingPayload) {
    try {
      if (dialog?.mode === "edit" && dialog.meeting) {
        await apiFetch<MeetingDetail>(`/api/meetings/${dialog.meeting.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            title: payload.title,
            started_at: new Date(payload.started_at).toISOString(),
            duration_seconds: payload.duration_seconds,
            participants: payload.participants,
          }),
        });
        showToast("Meeting details updated");
      } else {
        await apiFetch<MeetingDetail>("/api/meetings", {
          method: "POST",
          body: JSON.stringify({ ...payload, started_at: new Date(payload.started_at).toISOString() }),
        });
        showToast("Meeting created");
      }
      setDialog(null);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async function deleteMeeting() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch<void>(`/api/meetings/${deleteTarget.id}`, { method: "DELETE" });
      showToast("Meeting deleted");
      setDeleteTarget(null);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  function clearFilters() {
    setQuery("");
    setParticipant("");
    setDateFrom("");
    setDateTo("");
    setSort("newest");
  }

  const hasFilters = Boolean(query || participant || dateFrom || dateTo || sort !== "newest");

  return (
    <div className="page-wrap meetings-page">
      <section className="welcome-banner compact-banner">
        <div className="welcome-copy"><div className="eyebrow"><span className="eyebrow-dot" />MEETING WORKSPACE</div><h1>Make every meeting <span>count.</span></h1><p>Your conversations, notes, and next steps, all in one place.</p></div>
        <div className="welcome-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-card"><span className="art-card-mark">✳</span><span className="art-line line-long" /><span className="art-line line-short" /><span className="art-wave">〰</span></div><span className="art-star star-one">✦</span><span className="art-star star-two">✧</span></div>
      </section>

      <div className="section-heading meetings-heading"><div><span className="eyebrow muted-eyebrow">YOUR WORKSPACE</span><h2>Meetings <span className="count-pill">{loading ? "…" : meetings.length}</span></h2></div><button className="button button-primary" type="button" onClick={() => setDialog({ mode: "create" })}><span aria-hidden="true">＋</span> New meeting</button></div>

      <section className="filter-panel" aria-label="Search and filter meetings">
        <label className="search-field"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search meetings or people" aria-label="Search meetings by title or participant" /></label>
        <label className="filter-field"><span>From</span><input type="date" value={dateFrom} max={dateTo || undefined} onChange={(event) => setDateFrom(event.target.value)} aria-label="Filter meetings from date" /></label>
        <label className="filter-field"><span>To</span><input type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => setDateTo(event.target.value)} aria-label="Filter meetings to date" /></label>
        <label className="filter-field participant-filter"><span>Participant</span><input value={participant} onChange={(event) => setParticipant(event.target.value)} placeholder="Any participant" aria-label="Filter by participant" /></label>
        <label className="filter-field sort-filter"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as "newest" | "oldest")} aria-label="Sort meetings by date"><option value="newest">Most recent</option><option value="oldest">Oldest first</option></select></label>
        {hasFilters && <button className="clear-filters" type="button" onClick={clearFilters}>Clear</button>}
      </section>

      {loadError ? <section className="load-error" role="alert"><div><strong>Could not load meetings</strong><p>{loadError}</p><small>Make sure the FastAPI backend is running at the configured API URL.</small></div><button className="button button-secondary" type="button" onClick={() => setRefreshKey((key) => key + 1)}>Retry</button></section> :
        <section className="meeting-list-card" aria-label="Meetings list">
          {loading && !meetings.length ? <div className="list-state"><span className="loading-spinner" />Loading meetings…</div> : meetings.length === 0 ?
            <div className="library-empty"><div className="empty-illustration" aria-hidden="true"><div className="empty-sheet"><span className="sheet-spark">✳</span><i /><i /><i /></div><span className="empty-orb orb-a" /><span className="empty-orb orb-b" /></div><h3>{hasFilters ? "No meetings match those filters" : "Your meeting library is empty"}</h3><p>{hasFilters ? "Try a different search, date range, or participant." : "Create a meeting from a form or add a transcript to get started."}</p><button className="button button-primary" type="button" onClick={() => hasFilters ? clearFilters() : setDialog({ mode: "create" })}>{hasFilters ? "Clear filters" : "Create a meeting"}</button></div> :
            <>
              <div className="table-summary"><span>{loading ? "Updating results…" : `${meetings.length} ${meetings.length === 1 ? "meeting" : "meetings"}`}</span><span>Sorted by {sort === "newest" ? "most recent" : "oldest"}</span></div>
              <div className="meeting-table-wrap"><table className="meeting-table"><thead><tr><th>Meeting</th><th>Date</th><th>Duration</th><th>Participants</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{meetings.map((meeting) => <tr key={meeting.id}>
                <td data-label="Meeting"><Link className="meeting-title-link" href={`/meetings/${meeting.id}`}><span className="meeting-icon" aria-hidden="true">◷</span><span><strong>{meeting.title}</strong><small>{meeting.participants.length} {meeting.participants.length === 1 ? "participant" : "participants"}</small></span></Link></td>
                <td data-label="Date"><span className="meeting-date">{formatDate(meeting.started_at)}</span></td>
                <td data-label="Duration"><span className="duration-value">{formatDuration(meeting.duration_seconds)}</span></td>
                <td data-label="Participants"><span className="participant-names" title={participantLabel(meeting.participants)}>{participantLabel(meeting.participants)}</span></td>
                <td data-label="Actions"><div className="row-actions"><button type="button" className="icon-button" aria-label={`Edit ${meeting.title}`} title="Edit meeting" onClick={() => setDialog({ mode: "edit", meeting })}>✎</button><button type="button" className="icon-button danger-action" aria-label={`Delete ${meeting.title}`} title="Delete meeting" onClick={() => setDeleteTarget(meeting)}>⌫</button></div></td>
              </tr>)}</tbody></table></div>
            </>}
        </section>}

      <p className="page-footnote">Meeting data is stored in your local SQLite workspace.</p>
      {toast && <div className="toast-message" role="status"><span className="toast-check">✓</span>{toast}</div>}
      {dialog && <MeetingFormDialog key={`${dialog.mode}-${dialog.meeting?.id ?? "new"}`} mode={dialog.mode} meeting={dialog.meeting} onClose={() => setDialog(null)} onSave={saveMeeting} />}
      {deleteTarget && <div className="dialog-backdrop" role="presentation"><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description"><span className="confirm-icon" aria-hidden="true">!</span><h2 id="delete-title">Delete this meeting?</h2><p id="delete-description"><strong>{deleteTarget.title}</strong> and its transcript, summary, topics, and action items will be deleted.</p><div className="dialog-actions"><button className="button button-secondary" type="button" disabled={deleting} onClick={() => setDeleteTarget(null)}>Cancel</button><button className="button button-danger" type="button" disabled={deleting} onClick={deleteMeeting}>{deleting ? "Deleting…" : "Delete meeting"}</button></div></section></div>}
    </div>
  );
}

function MeetingFormDialog({ mode, meeting, onClose, onSave }: { mode: DialogMode; meeting?: Meeting; onClose: () => void; onSave: (payload: MeetingPayload) => Promise<void> }) {
  const [title, setTitle] = useState(meeting?.title ?? "");
  const [startedAt, setStartedAt] = useState(localDateTime(meeting?.started_at));
  const [durationMinutes, setDurationMinutes] = useState(String(meeting ? Math.round(meeting.duration_seconds / 60) : 30));
  const [participants, setParticipants] = useState(meeting?.participants.map((person) => person.email ? `${person.name} <${person.email}>` : person.name).join(", ") ?? "");
  const [transcriptText, setTranscriptText] = useState("");
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setTranscriptText(await file.text());
      setFileName(file.name);
      setError("");
    } catch {
      setError("Could not read that file. Try pasting the transcript instead.");
    }
    event.target.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Enter a meeting title.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const transcriptSegments = mode === "create" ? parseTranscript(transcriptText, fileName) : [];
      await onSave({
        title: title.trim(),
        started_at: startedAt,
        duration_seconds: Math.round(Number(durationMinutes) * 60),
        participants: parseParticipants(participants),
        transcript_segments: transcriptSegments,
      });
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation"><section className="meeting-dialog" role="dialog" aria-modal="true" aria-labelledby="meeting-dialog-title">
      <div className="dialog-header"><div><span className="eyebrow muted-eyebrow">MEETING LIBRARY</span><h2 id="meeting-dialog-title">{mode === "create" ? "Create a meeting" : "Edit meeting details"}</h2></div><button className="dialog-close" type="button" aria-label="Close dialog" onClick={onClose}>×</button></div>
      <form onSubmit={handleSubmit}>
        <div className="dialog-form-body">
          <label className="form-field full-field"><span>Meeting title <b>*</b></span><input required minLength={1} maxLength={240} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Product planning" autoFocus /></label>
          <div className="form-grid"><label className="form-field"><span>Date and time <b>*</b></span><input required type="datetime-local" value={startedAt} onChange={(event) => setStartedAt(event.target.value)} /></label><label className="form-field"><span>Duration (minutes) <b>*</b></span><input required type="number" min="0" step="1" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} /></label></div>
          <label className="form-field full-field"><span>Participants</span><textarea rows={2} value={participants} onChange={(event) => setParticipants(event.target.value)} placeholder="Maya Chen <maya@example.com>, Arjun Rao" /><small>Separate participants with commas or new lines. Email is optional.</small></label>
          {mode === "create" && <div className="transcript-field"><label className="form-field full-field"><span>Transcript <em>Optional</em></span><textarea rows={5} value={transcriptText} onChange={(event) => { setTranscriptText(event.target.value); setFileName(""); }} placeholder="Paste transcript text, timestamped lines, or WebVTT cues…" /><small>{fileName ? `Loaded ${fileName}` : "Plain text, .vtt, or .json. Transcript processing is local; no speech-to-text is run."}</small></label><label className="upload-button"><span aria-hidden="true">↥</span> Upload transcript<input type="file" accept=".txt,.vtt,.json,text/plain,text/vtt,application/json" onChange={handleFileChange} /></label></div>}
          {error && <div className="form-error" role="alert">{error}</div>}
        </div>
        <div className="dialog-footer"><button className="button button-secondary" type="button" disabled={saving} onClick={onClose}>Cancel</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving…" : mode === "create" ? "Create meeting" : "Save changes"}</button></div>
      </form>
    </section></div>
  );
}
