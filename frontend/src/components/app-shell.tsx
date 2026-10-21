"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigation = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m3.5 10 8.5-7 8.5 7v10.5h-6v-6h-5v6h-6V10Z" />
      </svg>
    ),
  },
  {
    href: "/meetings",
    label: "Meetings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.25" />
        <path d="M12 7.5v4.8l3.2 1.9" />
      </svg>
    ),
  },
  {
    href: "/tasks",
    label: "Tasks",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 6h11M9 12h11M9 18h11M3.5 6l1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2" />
      </svg>
    ),
  },
  {
    href: "/integrations",
    label: "Integrations",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3.2 14.5 9.5l6.3 2.5-6.3 2.5-2.5 6.3-2.5-6.3-6.3-2.5 6.3-2.5L12 3.2Z" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
        <path d="m19.2 13.8 1.1.8-1.5 2.6-1.3-.5a7.6 7.6 0 0 1-1.7 1l-.2 1.4h-3l-.2-1.4a7.6 7.6 0 0 1-1.8-1l-1.3.5-1.5-2.6 1.1-.8a7.5 7.5 0 0 1 0-2l-1.1-.8 1.5-2.6 1.3.5a7.6 7.6 0 0 1 1.8-1l.2-1.4h3l.2 1.4a7.6 7.6 0 0 1 1.7 1l1.3-.5 1.5 2.6-1.1.8a7.5 7.5 0 0 1 0 2Z" />
      </svg>
    ),
  },
];

function FirefliesMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.5v7M12 14.5v7M2.5 12h7m5 0h7M5.3 5.3l4.9 4.9m3.6 3.6 4.9 4.9m0-13.4-4.9 4.9m-3.6 3.6-4.9 4.9" />
    </svg>
  );
}

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const currentPage = pathname.startsWith("/meetings/")
    ? "Meeting details"
    : navigation.find((item) => item.href === pathname)?.label ?? "Meetings";

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("fireflies-theme");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("fireflies-theme", nextTheme);
  }

  return (
    <div className="workspace-shell" data-theme={theme}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className="sidebar" aria-label="Workspace sidebar">
        <Link className="brand" href="/meetings" aria-label="MeetMind home">
          <span className="brand-mark"><FirefliesMark /></span>
          <span>MeetMind<span className="brand-light"> AI</span></span>
        </Link>

        <div className="workspace-switcher" role="group" aria-label="Current workspace: My workspace">
          <span className="workspace-avatar">S</span>
          <span className="workspace-copy"><strong>My workspace</strong><small>Personal</small></span>
          <span className="workspace-indicator" aria-hidden="true" />
        </div>

        <p className="nav-caption">WORKSPACE</p>
        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && item.href !== "/meetings" && pathname.startsWith(`${item.href}/`)) || (item.href === "/meetings" && pathname.startsWith("/meetings/"));
            return (
              <Link
                className={`nav-link${isActive ? " active" : ""}`}
                href={item.href}
                key={item.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-note">
          <span className="note-spark" aria-hidden="true"><FirefliesMark /></span>
          <strong>Your meeting workspace</strong>
          <p>Keep conversations, notes, and next steps together.</p>
        </div>
        <div className="profile-button" role="group" aria-label="Signed in as Saumya">
          <span className="profile-avatar">S</span>
          <span className="profile-copy"><strong>Saumya</strong><small>Personal workspace</small></span>
          <span className="profile-plan">FREE</span>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-heading">
            <span className="topbar-context">MY WORKSPACE</span>
            <p className="topbar-title">{currentPage}</p>
          </div>
          <div className="topbar-actions">
            <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
              <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
              <span className="theme-toggle-label">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
            </button>
            <span className="topbar-workspace-tag">Personal workspace</span>
            <span className="top-avatar" aria-label="Saumya">S</span>
          </div>
        </header>
        <main className="main-content" id="main-content" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}
