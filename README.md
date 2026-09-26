# TSS HQ

Phone-friendly command center for The Second Spin's four scheduled agents
(Trend & Discovery, Idea Generator, Script Writer, Calendar Builder). Two
screens:

- **Dashboard** — every video idea, grouped by status, read live from your
  actual Notion "Video Ideas" database, the same one those four agents
  write to. Not a copy, not a separate app database, the real thing. Mark
  an idea "Ready to Script" right from your phone and the Script Writer
  agent picks it up on its next run, exactly as if you'd checked the box
  in Notion.
- **Chat** — talk to an on-demand version of the agents. Ask it to research
  trends or underground artists (web search), spin up new ideas, or write
  a script, and it writes the result straight into that same Notion
  database, on the spot, instead of waiting for the schedule.

## What this app is (and isn't)

This app can't literally reach into your four scheduled agents and press
their button, those live inside Claude's own scheduling system and there's
no public way for an outside app to trigger them. What it does instead is
read and write the exact same Notion data those agents use. So the
dashboard always reflects real agent output, and anything you do in chat
here shows up for the scheduled agents next time they run, and vice versa.
One shared tracker, two ways of working it: on a schedule, or on demand
from your phone.

## 1. Get two keys

1. **Anthropic API key** — console.anthropic.com → API Keys → Create Key.
2. **Notion integration token** — notion.so/my-integrations → New
   integration → copy the "Internal Integration Secret". Then open your
   TSS Video Ideas database in Notion, click "..." in the top right →
   Connections → add this integration, so it can read and write it.

Copy `.env.example` to `.env.local` and fill in `ANTHROPIC_API_KEY` and
`NOTION_TOKEN` (the database id is already filled in).

## 2. Run it locally (optional)

```bash
npm install
npm run dev
```

Open http://localhost:3000 on your phone (same wifi) or in a browser.

## 3. Push to GitHub

```bash
git add -A
git commit -m "Initial TSS HQ app"
git branch -M main
git remote add origin https://github.com/<your-username>/tss-hq.git
git push -u origin main
```

(Create the empty repo on GitHub first, or use `gh repo create tss-hq
--private --source=. --push` if you have the GitHub CLI installed.)

## 4. Deploy on Vercel

1. vercel.com → Add New Project → import the `tss-hq` GitHub repo.
2. Under Environment Variables, paste in `ANTHROPIC_API_KEY`,
   `NOTION_TOKEN`, and `NOTION_DATABASE_ID`.
3. Deploy. Vercel gives you a URL, add it to your phone's home screen for
   an app-like feel (Share → Add to Home Screen on iOS, or the browser
   menu on Android).

Every push to `main` redeploys automatically after this.
