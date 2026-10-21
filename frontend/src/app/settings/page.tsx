export default function SettingsPage() {
  return (
    <div className="page-wrap settings-page">
      <header className="settings-header">
        <span className="eyebrow muted-eyebrow">WORKSPACE PREFERENCES</span>
        <h1>Settings</h1>
        <p>Workspace details and the preferences available in this assignment.</p>
      </header>

      <section className="settings-profile-card" aria-labelledby="workspace-profile-title">
        <div className="settings-avatar" aria-hidden="true">S</div>
        <div className="settings-profile-copy">
          <span className="settings-card-label">PERSONAL WORKSPACE</span>
          <h2 id="workspace-profile-title">Saumya&apos;s workspace</h2>
          <p>Meeting notes, transcripts, summaries, and action items are organized here.</p>
        </div>
        <span className="settings-status"><span /> Active workspace</span>
      </section>

      <div className="settings-section-title">
        <div><span className="eyebrow muted-eyebrow">PREFERENCES</span><h2>Workspace overview</h2></div>
      </div>

      <div className="settings-grid">
        <section className="settings-card settings-info-card">
          <span className="settings-symbol settings-purple" aria-hidden="true">✳</span>
          <div><span className="settings-card-label">APPEARANCE</span><h3>Dark workspace</h3><p>The meeting workspace uses the MeetMind interface, with a dark theme and a light theme option.</p></div>
          <span className="settings-value">Current</span>
        </section>

        <section className="settings-card settings-info-card">
          <span className="settings-symbol settings-green" aria-hidden="true">▤</span>
          <div><span className="settings-card-label">MEETING DATA</span><h3>Connected workspace</h3><p>Meeting details and transcript features are provided by the project backend.</p></div>
          <span className="settings-value">Ready</span>
        </section>

        <section className="settings-card settings-info-card settings-wide-card">
          <span className="settings-symbol settings-amber" aria-hidden="true">⚙</span>
          <div><span className="settings-card-label">ACCOUNT & ACCESS</span><h3>Default assignment user</h3><p>Authentication, team management, and editable account preferences are outside this assignment&apos;s scope.</p></div>
          <span className="settings-value settings-muted-value">Not configurable</span>
        </section>
      </div>

      <p className="settings-footnote">These settings describe the current workspace; they do not change backend configuration.</p>
    </div>
  );
}
