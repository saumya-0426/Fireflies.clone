"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { ActionItem, MeetingDetail, TranscriptSegment } from "@/lib/meetings";

const EMPTY_SEGMENTS: TranscriptSegment[] = [];

function formatTime(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60).toString().padStart(2, "0")}:${(whole % 60).toString().padStart(2, "0")}`;
}

function formatMeetingDate(value: string): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function localDateTime(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

type ActionItemValues = { description: string; assignee: string | null; due_date: string | null };

function responseMessage(reason: unknown): string {
  if (reason instanceof ApiError) {
    try { return (JSON.parse(reason.message) as { detail?: string }).detail ?? reason.message; } catch { return reason.message; }
  }
  return reason instanceof Error ? reason.message : "Something went wrong. Please try again.";
}

function ActionItemForm({ initial, saving, onCancel, onSave }: { initial?: ActionItem; saving: boolean; onCancel: () => void; onSave: (values: ActionItemValues) => Promise<void> }) {
  const [description, setDescription] = useState(initial?.description ?? "");
  const [assignee, setAssignee] = useState(initial?.assignee ?? "");
  const [dueDate, setDueDate] = useState(localDateTime(initial?.due_date));
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!description.trim()) { setError("Enter a description for this action item."); return; }
    setError("");
    try {
      await onSave({ description: description.trim(), assignee: assignee.trim() || null, due_date: dueDate ? new Date(dueDate).toISOString() : null });
    } catch (reason) {
      setError(responseMessage(reason));
    }
  }

  return <form className="action-item-form" onSubmit={submit}>
    <label className="action-form-field"><span>Action item</span><input autoFocus maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the next step" /></label>
    <div className="action-form-grid"><label className="action-form-field"><span>Assignee</span><input maxLength={160} value={assignee} onChange={(event) => setAssignee(event.target.value)} placeholder="Optional" /></label><label className="action-form-field"><span>Due date</span><input type="datetime-local" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label></div>
    {error && <p className="action-form-error" role="alert">{error}</p>}
    <div className="action-form-buttons"><button className="button button-secondary" type="button" disabled={saving} onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving…" : initial ? "Save task" : "Add task"}</button></div>
  </form>;
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "ig"));
  return <>{parts.map((part, index) => part.toLowerCase() === query.trim().toLowerCase() ? <mark key={`${index}-${part}`}>{part}</mark> : part)}</>;
}

function activeSegmentAt(segments: TranscriptSegment[], seconds: number): number {
  const containing = segments.findIndex((segment) => seconds >= segment.start_seconds && seconds <= Math.max(segment.end_seconds, segment.start_seconds + 1));
  if (containing >= 0) return containing;
  for (let index = segments.length - 1; index >= 0; index -= 1) {
    if (seconds >= segments[index].start_seconds) return index;
  }
  return -1;
}

export default function MeetingDetailView({ meetingId }: { meetingId: string }) {
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loadedFor, setLoadedFor] = useState("");
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [query, setQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [actionEditor, setActionEditor] = useState<number | "new" | null>(null);
  const [actionBusy, setActionBusy] = useState<number | "new" | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [deleteActionTarget, setDeleteActionTarget] = useState<ActionItem | null>(null);
  const requestToken = `${meetingId}:${retryKey}`;
  const loading = loadedFor !== requestToken;

  useEffect(() => {
    const controller = new AbortController();
    apiFetch<MeetingDetail>(`/api/meetings/${encodeURIComponent(meetingId)}`, { signal: controller.signal })
      .then((data) => {
        setMeeting(data);
        setCurrentTime(0);
        setIsPlaying(false);
        setError("");
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          let message = reason instanceof Error ? reason.message : "Could not load this meeting.";
          if (reason instanceof ApiError) {
            try { message = (JSON.parse(reason.message) as { detail?: string }).detail ?? message; } catch { /* Keep the API message. */ }
          }
          setError(message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadedFor(requestToken);
      });
    return () => controller.abort();
  }, [meetingId, retryKey, requestToken]);

  const segments = meeting?.transcript_segments ?? EMPTY_SEGMENTS;
  const duration = useMemo(() => Math.max(meeting?.duration_seconds ?? 0, ...segments.map((segment) => segment.end_seconds), 1), [meeting?.duration_seconds, segments]);
  const activeIndex = activeSegmentAt(segments, currentTime);
  const playbackActive = isPlaying && currentTime < duration;
  const matchingCount = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return term ? segments.filter((segment) => segment.text.toLocaleLowerCase().includes(term) || segment.speaker.toLocaleLowerCase().includes(term)).length : segments.length;
  }, [query, segments]);
  const filteredSegments = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return term ? segments.filter((segment) => segment.text.toLocaleLowerCase().includes(term) || segment.speaker.toLocaleLowerCase().includes(term)) : segments;
  }, [query, segments]);

  const seekTo = useCallback((seconds: number) => {
    setCurrentTime(Math.max(0, Math.min(duration, seconds)));
  }, [duration]);

  async function saveActionItem(values: ActionItemValues) {
    if (!meeting) return;
    setActionBusy(actionEditor);
    setActionError("");
    try {
      if (actionEditor === "new") {
        const created = await apiFetch<ActionItem>(`/api/meetings/${meeting.id}/action-items`, { method: "POST", body: JSON.stringify({ ...values, is_completed: false }) });
        setMeeting((current) => current ? { ...current, action_items: [...current.action_items, created] } : current);
        setActionNotice("Action item added.");
      } else if (typeof actionEditor === "number") {
        const updated = await apiFetch<ActionItem>(`/api/action-items/${actionEditor}`, { method: "PATCH", body: JSON.stringify(values) });
        setMeeting((current) => current ? { ...current, action_items: current.action_items.map((item) => item.id === updated.id ? updated : item) } : current);
        setActionNotice("Action item updated.");
      }
      setActionEditor(null);
    } catch (reason) {
      throw reason;
    } finally {
      setActionBusy(null);
    }
  }

  async function toggleActionItem(item: ActionItem) {
    setActionBusy(item.id);
    setActionError("");
    try {
      const updated = await apiFetch<ActionItem>(`/api/action-items/${item.id}`, { method: "PATCH", body: JSON.stringify({ is_completed: !item.is_completed }) });
      setMeeting((current) => current ? { ...current, action_items: current.action_items.map((existing) => existing.id === updated.id ? updated : existing) } : current);
      setActionNotice(updated.is_completed ? "Action item completed." : "Action item reopened.");
    } catch (reason) {
      setActionError(responseMessage(reason));
    } finally {
      setActionBusy(null);
    }
  }

  async function deleteActionItem() {
    if (!deleteActionTarget) return;
    setActionBusy(deleteActionTarget.id);
    setActionError("");
    try {
      await apiFetch<void>(`/api/action-items/${deleteActionTarget.id}`, { method: "DELETE" });
      setMeeting((current) => current ? { ...current, action_items: current.action_items.filter((item) => item.id !== deleteActionTarget.id) } : current);
      setActionNotice("Action item removed.");
      setDeleteActionTarget(null);
    } catch (reason) {
      setActionError(responseMessage(reason));
    } finally {
      setActionBusy(null);
    }
  }

  useEffect(() => {
    if (!playbackActive) return;
    const timer = window.setInterval(() => {
      setCurrentTime((time) => Math.min(duration, time + 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [duration, playbackActive]);

  if (loading) return <div className="page-wrap detail-page"><Link className="back-link" href="/meetings">← Back to meetings</Link><div className="detail-loading" role="status"><span className="loading-spinner" />Loading meeting…</div></div>;
  if (error || !meeting) return <div className="page-wrap detail-page"><Link className="back-link" href="/meetings">← Back to meetings</Link><section className="detail-error" role="alert"><span className="placeholder-icon" aria-hidden="true">!</span><h1>{error.includes("404") ? "Meeting not found" : "Could not load meeting"}</h1><p>{error || "This meeting may have been deleted."}</p><div className="detail-error-actions"><button className="button button-secondary" type="button" onClick={() => setRetryKey((key) => key + 1)}>Retry</button><Link className="button button-primary" href="/meetings">Back to meetings</Link></div></section></div>;

  return (
    <div className="page-wrap detail-page">
      <Link className="back-link" href="/meetings">← Back to meetings</Link>
      <header className="detail-header">
        <div><span className="eyebrow muted-eyebrow">MEETING NOTES</span><h1>{meeting.title}</h1><div className="detail-meta"><span>{formatMeetingDate(meeting.started_at)}</span><i /> <span>{meeting.participants.map((person) => person.name).join(", ") || "No participants"}</span></div></div>
        <span className="detail-duration">◷ {formatTime(meeting.duration_seconds)}</span>
      </header>

      <section className="media-card" aria-label="Transcript timeline player">
        <div className="media-card-top"><div className="media-title"><span className="media-wave" aria-hidden="true">♫</span><span><strong>Meeting recording</strong><small>Interactive timeline preview</small></span></div><span className="media-placeholder-tag">SAMPLE PLAYER</span></div>
        <div className="player-controls"><button className="player-play" type="button" aria-label={playbackActive ? "Pause playback" : "Start playback"} onClick={() => { if (currentTime >= duration) setCurrentTime(0); setIsPlaying((playing) => currentTime >= duration || !playing); }}>{playbackActive ? "Ⅱ" : "▶"}</button><span className="player-time">{formatTime(currentTime)}</span><input className="player-range" aria-label="Seek meeting playback" type="range" min="0" max={duration} step="1" value={Math.min(currentTime, duration)} onChange={(event) => seekTo(Number(event.target.value))} style={{ "--range-progress": `${(currentTime / duration) * 100}%` } as CSSProperties} /><span className="player-time">{formatTime(duration)}</span><button className="player-skip" type="button" aria-label="Skip forward 15 seconds" onClick={() => seekTo(currentTime + 15)}>+15s</button></div>
        <div className="player-note">No audio file is attached. Use the timeline to follow transcript timestamps.</div>
      </section>

      <div className="detail-columns">
        <section className="transcript-card" aria-labelledby="transcript-heading">
          <div className="detail-card-heading"><div><span className="eyebrow muted-eyebrow">CONVERSATION</span><h2 id="transcript-heading">Transcript</h2></div><span className="segment-count">{query.trim() ? `${matchingCount} matches` : `${segments.length} segments`}</span></div>
          <label className="transcript-search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search transcript or speaker…" aria-label="Search transcript" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear transcript search">×</button>}</label>
          {segments.length === 0 ? <div className="transcript-empty"><span aria-hidden="true">▤</span><h3>No transcript yet</h3><p>This meeting has no transcript segments.</p></div> : filteredSegments.length === 0 ? <div className="transcript-empty"><h3>No matches</h3><p>Try another word or speaker name.</p></div> :
            <div className="transcript-list" aria-label="Transcript segments">{filteredSegments.map((segment) => {
              const index = segments.indexOf(segment);
              return <button key={segment.id ?? `${segment.position}-${segment.start_seconds}`} type="button" className={`transcript-segment${index === activeIndex ? " is-active" : ""}`} onClick={() => seekTo(segment.start_seconds)} aria-current={index === activeIndex ? "true" : undefined}>
                <span className="segment-time">{formatTime(segment.start_seconds)}</span><span className="segment-copy"><strong>{segment.speaker}</strong><span><HighlightedText text={segment.text} query={query} /></span></span><span className="segment-jump" aria-hidden="true">↗</span>
              </button>;
            })}</div>}
        </section>

        <aside className="detail-side-column">
          <section className="summary-card"><div className="detail-card-heading"><div><span className="eyebrow muted-eyebrow">AI SUMMARY</span><h2>Overview</h2></div><span className="summary-spark" aria-hidden="true">✦</span></div>{meeting.summary?.overview ? <><p>{meeting.summary.overview}</p><small className="summary-origin">Existing summaries are seeded; new ones use Groq when configured and a local mock fallback otherwise.</small></> : <p className="muted-copy">{meeting.transcript_segments.length ? "No summary is available for this transcript yet." : "No transcript or summary yet. Add a transcript when creating a meeting to get a summary."}</p>}</section>
          <section className="topics-card"><div className="detail-card-heading"><div><span className="eyebrow muted-eyebrow">KEY MOMENTS</span><h2>Topics</h2></div><span className="segment-count">{meeting.topics.length}</span></div>{meeting.topics.length ? <div className="topic-list">{meeting.topics.map((topic) => <button className="topic-row" type="button" key={topic.id ?? topic.position} onClick={() => topic.start_seconds !== null && seekTo(topic.start_seconds)} disabled={topic.start_seconds === null}><span className="topic-dot" /><span>{topic.title}</span>{topic.start_seconds !== null && <time>{formatTime(topic.start_seconds)}</time>}</button>)}</div> : <p className="muted-copy">No topics have been added.</p>}</section>
          <section className="action-items-card" aria-labelledby="action-items-heading">
            <div className="detail-card-heading"><div><span className="eyebrow muted-eyebrow">NEXT STEPS</span><h2 id="action-items-heading">Action items</h2></div><span className="segment-count">{meeting.action_items.filter((item) => !item.is_completed).length} open</span></div>
            {actionNotice && <p className="action-feedback" role="status">{actionNotice}</p>}
            {actionError && <p className="action-feedback is-error" role="alert">{actionError}</p>}
            {actionEditor === "new" && <ActionItemForm saving={actionBusy === "new"} onCancel={() => { setActionEditor(null); setActionError(""); }} onSave={saveActionItem} />}
            {meeting.action_items.length ? <div className="action-item-list">{meeting.action_items.map((item) => <div className={`action-item${item.is_completed ? " is-complete" : ""}`} key={item.id}>
              {actionEditor === item.id ? <ActionItemForm initial={item} saving={actionBusy === item.id} onCancel={() => { setActionEditor(null); setActionError(""); }} onSave={saveActionItem} /> : <>
                <label className="action-check"><input type="checkbox" checked={item.is_completed} disabled={actionBusy === item.id} onChange={() => toggleActionItem(item)} aria-label={`${item.is_completed ? "Reopen" : "Complete"} ${item.description}`} /><span className="checkmark" /></label>
                <div className="action-item-copy"><strong>{item.description}</strong><span>{[item.assignee, item.due_date ? `Due ${formatMeetingDate(item.due_date)}` : null].filter(Boolean).join(" · ") || "Unassigned"}</span></div>
                <div className="action-item-controls"><button type="button" disabled={actionBusy !== null} onClick={() => { setActionEditor(item.id); setActionError(""); setActionNotice(""); }} aria-label={`Edit ${item.description}`} title="Edit action item">✎</button><button type="button" disabled={actionBusy !== null} onClick={() => { setDeleteActionTarget(item); setActionError(""); }} aria-label={`Remove ${item.description}`} title="Remove action item">×</button></div>
              </>}
            </div>)}</div> : actionEditor !== "new" && <p className="muted-copy action-empty">No action items yet. Add a next step to keep this meeting moving.</p>}
            {deleteActionTarget && <div className="action-delete-confirm" role="group" aria-label="Confirm action item removal"><span>Remove “{deleteActionTarget.description}”?</span><button type="button" disabled={actionBusy !== null} onClick={() => setDeleteActionTarget(null)}>Cancel</button><button type="button" className="confirm-remove" disabled={actionBusy !== null} onClick={deleteActionItem}>{actionBusy === deleteActionTarget.id ? "Removing…" : "Remove"}</button></div>}
            {actionEditor === null && <button className="add-action-button" type="button" disabled={actionBusy !== null} onClick={() => { setActionEditor("new"); setActionNotice(""); setActionError(""); }}>＋ Add action item</button>}
          </section>
        </aside>
      </div>
      <p className="detail-footnote">Transcript search highlights matching words. Select a line or topic to move the timeline.</p>
    </div>
  );
}
