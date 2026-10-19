"use client";

import { useState } from "react";

const integrations = [
  { name: "Google Calendar", category: "Calendar", description: "Bring meeting context together with your calendar events.", mark: "31", style: "calendar" },
  { name: "Slack", category: "Collaboration", description: "Share meeting summaries and action items with your team.", mark: "✳", style: "slack" },
  { name: "Zoom", category: "Video conferencing", description: "Connect conversations with your video meetings.", mark: "Z", style: "zoom" },
  { name: "Notion", category: "Knowledge", description: "Keep meeting notes alongside your team knowledge base.", mark: "N", style: "notion" },
];

export default function IntegrationsPage() {
  const [tab, setTab] = useState<"discover" | "connected">("discover");
  return (
    <div className="page-wrap integrations-page">
      <header className="integrations-header"><div><span className="eyebrow muted-eyebrow">WORKSPACE</span><h1>Integrations</h1><p>Connect your meeting workflow with the tools you already use.</p></div><span className="integration-count">0 connected</span></header>
      <div className="integration-tabs" role="tablist" aria-label="Integration list">
        <button type="button" role="tab" aria-selected={tab === "discover"} className={tab === "discover" ? "active" : ""} onClick={() => setTab("discover")}>Discover</button>
        <button type="button" role="tab" aria-selected={tab === "connected"} className={tab === "connected" ? "active" : ""} onClick={() => setTab("connected")}>Connected <span>0</span></button>
      </div>
      {tab === "discover" ? <>
        <div className="integrations-callout"><span className="callout-icon" aria-hidden="true">✧</span><div><strong>Make your meeting workspace work with your tools</strong><p>Browse popular integrations. Connections are visual placeholders in this assignment.</p></div><span className="callout-spark" aria-hidden="true">✦</span></div>
        <div className="integrations-section-heading"><div><span className="eyebrow muted-eyebrow">AVAILABLE CONNECTIONS</span><h2>Popular integrations</h2></div><span>{integrations.length} apps</span></div>
        <div className="integration-grid">{integrations.map((integration) => <article className="integration-card" key={integration.name}>
          <span className={`integration-mark ${integration.style}`} aria-hidden="true">{integration.mark}</span>
          <div className="integration-copy"><span>{integration.category}</span><h3>{integration.name}</h3><p>{integration.description}</p></div>
          <button type="button" disabled title="Integration connections are not implemented in this assignment">Coming soon</button>
        </article>)}</div>
      </> : <div className="integration-empty"><span aria-hidden="true">◇</span><h2>No integrations connected</h2><p>Connected services will appear here when integration support is added.</p><button type="button" onClick={() => setTab("discover")}>Browse integrations</button></div>}
      <p className="integration-footnote">Integration connections and external account access are outside the current project scope.</p>
    </div>
  );
}
