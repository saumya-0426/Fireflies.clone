"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { ActionItem } from "@/lib/meetings";

type TaskWithMeeting = ActionItem & { meeting_title: string };
type TaskFilter = "open" | "all" | "completed";

function formatTaskDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithMeeting[]>([]);
  const [filter, setFilter] = useState<TaskFilter>("open");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadTasks() {
      try {
        const taskList = await apiFetch<TaskWithMeeting[]>("/api/action-items", { signal: controller.signal });
        if (controller.signal.aborted) return;
        taskList.sort((a, b) => Number(a.is_completed) - Number(b.is_completed) || new Date(a.due_date ?? a.created_at).getTime() - new Date(b.due_date ?? b.created_at).getTime());
        setTasks(taskList);
      } catch (reason) {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load action items.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadTasks();
    return () => controller.abort();
  }, []);

  const visibleTasks = useMemo(() => tasks.filter((item) => filter === "all" || (filter === "open" ? !item.is_completed : item.is_completed)), [filter, tasks]);

  async function toggleTask(item: TaskWithMeeting) {
    setUpdating(item.id);
    setError("");
    try {
      const updated = await apiFetch<ActionItem>(`/api/action-items/${item.id}`, { method: "PATCH", body: JSON.stringify({ is_completed: !item.is_completed }) });
      setTasks((current) => current.map((task) => task.id === updated.id ? { ...task, ...updated, meeting_title: task.meeting_title } : task));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update this action item.");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="page-wrap tasks-page">
      <header className="tasks-header"><div><span className="eyebrow muted-eyebrow">MEETING WORKSPACE</span><h1>Tasks</h1><p>Keep meeting next steps moving.</p></div><Link className="button button-primary" href="/meetings">＋ New action item</Link></header>
      <div className="task-tabs" role="tablist" aria-label="Filter action items">
        {(["open", "all", "completed"] as const).map((value) => <button key={value} type="button" role="tab" aria-selected={filter === value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value === "open" ? "My tasks" : value === "all" ? "All tasks" : "Completed"}{value === "open" && <span>{tasks.filter((item) => !item.is_completed).length}</span>}</button>)}
      </div>
      <section className="tasks-promo"><div className="tasks-app-dots" aria-hidden="true"><span>✓</span><span>↗</span><span>▤</span></div><p>Action items are linked to their meeting so you can review the conversation context.</p><Link href="/meetings">Browse meetings <span aria-hidden="true">→</span></Link></section>
      {error && <p className="tasks-error" role="alert">{error}</p>}
      <section className="tasks-list" aria-label="Action items" aria-busy={loading}>
        {loading ? <p className="tasks-state" role="status">Loading action items…</p> : visibleTasks.length === 0 ? <div className="tasks-empty"><span aria-hidden="true">☷</span><h2>{filter === "completed" ? "No completed tasks yet" : tasks.length ? "You’re all caught up" : "No action items yet"}</h2><p>{tasks.length ? "Meeting tasks will appear here as you add them." : "Open a meeting and add an action item to keep the next step visible."}</p><Link className="button button-primary" href="/meetings">Open meetings</Link></div> :
          visibleTasks.map((item) => <article className={`task-row${item.is_completed ? " is-complete" : ""}`} key={item.id}>
            <label className="task-check"><input type="checkbox" checked={item.is_completed} disabled={updating === item.id} onChange={() => void toggleTask(item)} aria-label={`${item.is_completed ? "Reopen" : "Complete"} ${item.description}`} /><span /></label>
            <div className="task-copy"><strong>{item.description}</strong><span>{item.assignee ? `Assigned to ${item.assignee}` : "Unassigned"}{item.due_date ? ` · Due ${formatTaskDate(item.due_date)}` : ""}</span></div>
            <Link className="task-meeting-link" href={`/meetings/${item.meeting_id}`} title={`Open ${item.meeting_title}`}><span>From meeting</span><strong>{item.meeting_title}</strong><span aria-hidden="true">↗</span></Link>
          </article>)}
      </section>
      <p className="tasks-footnote">Completing a task updates its status for the linked meeting.</p>
    </div>
  );
}
