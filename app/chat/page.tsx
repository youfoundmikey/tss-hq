"use client";

import { useEffect, useRef, useState } from "react";

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { id: `local-${Date.now()}`, role: "user", content: text }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          id: `local-${Date.now()}-a`,
          role: "assistant",
          content: data.reply ?? "Something went wrong.",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `local-${Date.now()}-e`,
          role: "assistant",
          content: "Couldn't reach the agent. Try again in a bit.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page">
      <div className="masthead">
        <h1>Chat</h1>
        <div className="sub">TALK TO THE AGENTS</div>
      </div>

      <div className="chat-log" style={{ marginTop: 16 }}>
        {messages.length === 0 && (
          <div className="empty">
            Ask it to find underground artists, come up with a batch of
            ideas, or write a script. Everything it does lands straight in
            your real Notion tracker.
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.role}`}>
            {m.content}
          </div>
        ))}
        {sending && <div className="msg assistant">Thinking…</div>}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-bar">
        <textarea
          rows={1}
          value={input}
          placeholder="Message the agent…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button onClick={send} disabled={sending || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
