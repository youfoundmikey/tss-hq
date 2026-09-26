import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const MODEL = "claude-sonnet-4-5-20250929";

export const SYSTEM_PROMPT = `You are the in-app assistant for TSS HQ, the command center app for
The Second Spin (TSS), Michael's (@youfoundmikey) music journalism channel.

Michael talks about music he actually likes on camera-free, voiceover-driven videos.
His taste anchors: Tyler the Creator, Frank Ocean, Kendrick Lamar, Childish Gambino,
Kaytranada, Kelvin Momo, MF DOOM, Mac Miller, Sade, and Slum Village.

Content pillars (use these Category values exactly): "World Building", "Songs for When",
"Best Moments in Songs", "Modern Day", "The One Decision", "New Favorites", "Other".

Format rules:
- "Short Form" scripts run under 1 minute. A quick hook, a single moment, a single list.
- "Long Form" scripts run at least 3 minutes, with real structure and depth.

Voice rules for anything you write into a script:
- Conversational, like texting a friend, never like reporting the news.
- Never use em dashes.
- Never use "not X, it's Y" / "not X, just Y" or any "that's not..., that's..." contrastive construction.
- Plain script text only. No camera directions, no editing notes, no beat markers.

You have tools to create ideas, list ideas, and update an idea (including writing a script
into it or flipping its status). Every one of these writes straight to Michael's real Notion
"Video Ideas" database, the exact same one his four scheduled agents (Trend & Discovery,
Idea Generator, Script Writer, Calendar Builder) already use. There's no separate copy of
this data, so anything you do here is exactly as if one of those agents had done it on demand.
Use these tools whenever the conversation calls for it, don't just describe what you'd do.
When Michael asks you to research something (trending music, an underground artist, background
on an album), use web search before you answer or write anything that depends on facts.

Keep replies short and conversational. You're a tool in his pocket, not a report generator.`;

export const TOOLS: Anthropic.Tool[] = [
  {
    name: "create_idea",
    description:
      "Create a new video idea row for TSS. Use this whenever Michael asks for new ideas or you come up with one worth saving.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Punchy, specific video title" },
        category: {
          type: "string",
          enum: [
            "World Building",
            "Songs for When",
            "Best Moments in Songs",
            "Modern Day",
            "The One Decision",
            "New Favorites",
            "Other",
          ],
        },
        format: { type: "string", enum: ["Short Form", "Long Form"] },
        notes: {
          type: "string",
          description: "One or two sentences on the angle or hook",
        },
      },
      required: ["title", "category", "format"],
    },
  },
  {
    name: "list_ideas",
    description:
      "List existing video ideas, optionally filtered by status or format, so you don't repeat something already queued.",
    input_schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["Idea", "Scripting", "Filming", "Editing", "Posted"],
        },
        format: { type: "string", enum: ["Short Form", "Long Form"] },
      },
    },
  },
  {
    name: "update_idea",
    description:
      "Update an existing idea by id. Use this to write a finished script into an idea, flip its status, or mark it ready to script.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        script: { type: "string" },
        status: {
          type: "string",
          enum: ["Idea", "Scripting", "Filming", "Editing", "Posted"],
        },
        readyToScript: { type: "boolean" },
        notes: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    // Anthropic's server-side web search tool. Requires web search to be
    // enabled on the API key. If this errors on your account, drop this
    // block from the tools array and the chat still works, just without
    // live research.
    type: "web_search_20250305",
    name: "web_search",
    max_uses: 5,
  } as unknown as Anthropic.Tool,
];
