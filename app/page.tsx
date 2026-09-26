"use client";

import { useEffect, useState } from "react";
import type { Idea, Status } from "@/lib/types";

const STATUS_ORDER: Status[] = [
  "Idea",
  "Scripting",
  "Filming",
  "Editing",
  "Posted",
];

const TABS: ("All" | Status)[] = ["All", ...STATUS_ORDER];

const AGENTS = [
  { name: "Trend & Discovery", cadence: "Daily · 10:00 AM ET" },
  { name: "Idea Generator", cadence: "Every 2 days · 11:00 AM ET" },
  { name: "Script Writer", cadence: "Daily · 12:00 PM ET" },
  { name: "Calendar Builder", cadence: "Weekly · Sun 9:00 AM ET" },
];

export default function Dashboard() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tab, setTab] = useState<"All" | Status>("Idea");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  async function load() {
    setError(null);
    const res = await fetch("/api/ideas");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Couldn't load Notion.");
      setLoading(false);
      return;
    }
    setIdeas(data.ideas ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleReady(idea: Idea) {
    setBusyId(idea.id);
    await fetch(`/api/ideas/${idea.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ readyToScript: !idea.readyToScript }),
    });
    await load();
    setBusyId(null);
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const counts = STATUS_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = ideas.filter((i) => i.status === s).length;
    return acc;
  }, {});

  const visible =
    tab === "All" ? ideas : ideas.filter((i) => i.status === tab);

  return (
    <div className="page">
      <div className="masthead">
        <h1>TSS HQ</h1>
        <div className="sub">LIVE FROM YOUR NOTION TRACKER</div>
      </div>

      <div className="section-title">Agents on Duty</div>
      {AGENTS.map((a) => (
        <div className="card" key={a.name}>
          <div className="card-top">
            <h3>{a.name}</h3>
            <span className="pill status-Posted">Active</span>
          </div>
          <p className="notes">{a.cadence}</p>
        </div>
      ))}

      <div className="section-title">Pipeline</div>

      {loading && <div className="empty">Loading from Notion…</div>}
      {error && (
        <div className="empty">
          Couldn't reach Notion: {error}
          <br />
          Check NOTION_TOKEN and NOTION_DATABASE_ID in your env vars, and
          make sure the integration is connected to the database in Notion.
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="status-tabs">
            {TABS.map((t) => (
              <button
                key={t}
                className={`status-tab${tab === t ? " active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
                <span className="status-tab-count">
                  {t === "All" ? ideas.length : counts[t] ?? 0}
                </span>
              </button>
            ))}
          </div>

          {ideas.length === 0 && (
            <div className="empty">
              Nothing in the tracker yet. Ask the chat to generate some
              ideas, or wait for the Idea Generator agent's next run.
            </div>
          )}

          {ideas.length > 0 && visible.length === 0 && (
            <div className="empty">Nothing in {tab} right now.</div>
          )}

          {visible.map((idea) => {
            const isOpen = expanded.has(idea.id);
            const scriptIsLong = idea.script && idea.script.length > 220;
            return (
              <div className="card" key={idea.id}>
                <div className="card-top">
                  <h3>{idea.title}</h3>
                  <span className={`pill status-${idea.status}`}>
                    {idea.status}
                  </span>
                </div>
                <div className="meta">
                  <span className="pill">{idea.category}</span>
                  <span className="pill">{idea.format}</span>
                  {idea.readyToScript && (
                    <span className="pill status-Scripting">
                      Ready to Script
                    </span>
                  )}
                  {idea.scheduledDate && (
                    <span className="pill">
                      {new Date(idea.scheduledDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {idea.notes && <p className="notes">{idea.notes}</p>}
                {idea.script && (
                  <p className="notes" style={{ color: "var(--cream)" }}>
                    {isOpen || !scriptIsLong
                      ? idea.script
                      : `${idea.script.slice(0, 220)}…`}
                  </p>
                )}
                <div className="actions">
                  {!idea.script && (
                    <button
                      className="btn"
                      disabled={busyId === idea.id}
                      onClick={() => toggleReady(idea)}
                    >
                      {idea.readyToScript
                        ? "Unmark Ready"
                        : "Mark Ready to Script"}
                    </button>
                  )}
                  {scriptIsLong && (
                    <button
                      className="btn secondary"
                      onClick={() => toggleExpanded(idea.id)}
                    >
                      {isOpen ? "Show less" : "Read full script"}
                    </button>
                  )}
                  <a
                    className="btn secondary"
                    href={idea.notionUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Notion
                  </a>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
