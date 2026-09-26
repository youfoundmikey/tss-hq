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
      {!loading && !error && ideas.length === 0 && (
        <div className="empty">
          Nothing in the tracker yet. Ask the chat to generate some ideas, or
          wait for the Idea Generator agent's next run.
        </div>
      )}

      {STATUS_ORDER.map((status) => {
        const group = ideas.filter((i) => i.status === status);
        if (group.length === 0) return null;
        return (
          <div key={status}>
            <div className="section-title" style={{ fontSize: "0.95rem" }}>
              {status} ({group.length})
            </div>
            {group.map((idea) => (
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
                    {idea.script.slice(0, 220)}
                    {idea.script.length > 220 ? "…" : ""}
                  </p>
                )}
                <div className="actions">
                  {!idea.script && (
                    <button
                      className="btn"
                      disabled={busyId === idea.id}
                      onClick={() => toggleReady(idea)}
                    >
                      {idea.readyToScript ? "Unmark Ready" : "Mark Ready to Script"}
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
            ))}
          </div>
        );
      })}
    </div>
  );
}
