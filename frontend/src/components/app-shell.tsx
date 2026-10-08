import type { ReactNode } from "react";
import Link from "next/link";

const navigation = [
  { href: "/meetings", label: "Meetings", icon: "◷" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="workspace-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className="sidebar">
        <Link className="brand" href="/meetings" aria-label="Fireflies Clone home">
          <span className="brand-mark" aria-hidden="true">✳</span><span>fireflies<span className="brand-light">.ai</span></span>
        </Link>
        <div className="workspace-switcher"><span className="workspace-avatar">S</span><span className="workspace-copy"><strong>My workspace</strong><small>Personal</small></span><span className="chevron" aria-hidden="true">⌄</span></div>
        <p className="nav-caption">WORKSPACE</p>
        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map((item) => {
            return <Link className="nav-link" href={item.href} key={item.href}><span className="nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span></Link>;
          })}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-note"><span className="note-spark" aria-hidden="true">✦</span><strong>Your meeting workspace</strong><p>Keep conversations, notes, and next steps together.</p></div>
        <button className="profile-button" type="button" aria-label="Profile menu placeholder"><span className="profile-avatar">S</span><span className="profile-copy"><strong>Saumya</strong><small>Free workspace</small></span><span className="chevron" aria-hidden="true">···</span></button>
      </aside>
      <div className="main-column">
        <header className="topbar"><div className="breadcrumb"><span>Fireflies Clone</span><span className="breadcrumb-divider">/</span><strong>Workspace</strong></div><div className="topbar-actions"><span className="status-pill"><span className="status-dot" />Workspace ready</span><button className="top-avatar" type="button" aria-label="Profile placeholder">S</button></div></header>
        <main className="main-content" id="main-content" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}
