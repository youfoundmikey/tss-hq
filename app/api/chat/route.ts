import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { anthropic, MODEL, SYSTEM_PROMPT, TOOLS } from "@/lib/anthropic";
import { createIdea, listIdeas, updateIdea } from "@/lib/ideas";

const MAX_TURNS = 6; // safety cap on the tool-use loop per message

async function runTool(name: string, input: any): Promise<unknown> {
  switch (name) {
    case "create_idea": {
      const idea = await createIdea(input);
      return { created: idea };
    }
    case "list_ideas": {
      const all = await listIdeas();
      const filtered = all.filter(
        (i) =>
          (!input.status || i.status === input.status) &&
          (!input.format || i.format === input.format)
      );
      return { ideas: filtered.slice(0, 30) };
    }
    case "update_idea": {
      const { id, ...patch } = input;
      const updated = await updateIdea(id, patch);
      if (!updated) return { error: `No idea with id ${id}` };
      return { updated };
    }
    default:
      return { error: `Unknown tool ${name}` };
  }
}

interface ClientMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const { message, history } = (await req.json()) as {
    message: string;
    history?: ClientMessage[];
  };
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  // The browser holds the chat history (see app/chat/page.tsx) and sends it
  // back with each message. Nothing is persisted server-side, so a page
  // refresh clears the conversation, but every idea/script it produces is
  // saved permanently in Notion regardless.
  const messages: Anthropic.MessageParam[] = [
    ...(history ?? []).slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  let finalText = "";

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages,
      tools: TOOLS,
    });

    const toolUses = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );
    const textBlocks = response.content.filter(
      (b): b is Anthropic.TextBlock => b.type === "text"
    );
    finalText = textBlocks.map((b) => b.text).join("\n").trim();

    if (toolUses.length === 0 || response.stop_reason !== "tool_use") {
      break;
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolUse of toolUses) {
      const result = await runTool(toolUse.name, toolUse.input);
      toolResults.push({
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: JSON.stringify(result),
      });
    }
    messages.push({ role: "user", content: toolResults });
  }

  return NextResponse.json({ reply: finalText || "Done." });
}
