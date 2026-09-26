import type { Idea, Category, Format, Status } from "./types";

const NOTION_VERSION = "2022-06-28";

function headers() {
  return {
    Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

function plainText(richText: any[] | undefined): string {
  if (!richText) return "";
  return richText.map((t) => t.plain_text ?? "").join("");
}

// Maps a raw Notion page object (from the Video Ideas database) into our
// Idea shape. This is the SAME database the four scheduled agents read
// and write, so what shows up here is exactly what they've done.
function pageToIdea(page: any): Idea {
  const props = page.properties;
  return {
    id: page.id,
    title: plainText(props.Title?.title),
    category: (props.Category?.select?.name ?? "Other") as Category,
    format: (props.Format?.select?.name ?? "Short Form") as Format,
    status: (props.Status?.select?.name ?? "Idea") as Status,
    notes: plainText(props.Notes?.rich_text),
    script: plainText(props.Script?.rich_text),
    readyToScript: Boolean(props["Ready to Script"]?.checkbox),
    scheduledDate: props["Scheduled Date"]?.date?.start ?? null,
    createdAt: new Date(page.created_time).getTime(),
    updatedAt: new Date(page.last_edited_time).getTime(),
    notionUrl: page.url,
  };
}

export async function listIdeasFromNotion(): Promise<Idea[]> {
  const databaseId = process.env.NOTION_DATABASE_ID!;
  const results: any[] = [];
  let cursor: string | undefined;

  do {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          start_cursor: cursor,
          sorts: [{ timestamp: "created_time", direction: "descending" }],
        }),
      }
    );
    if (!res.ok) {
      throw new Error(`Notion query failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    results.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return results.map(pageToIdea);
}

export async function getIdeaFromNotion(pageId: string): Promise<Idea | null> {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: headers(),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Notion get failed: ${res.status} ${await res.text()}`);
  }
  return pageToIdea(await res.json());
}

export async function createIdeaInNotion(input: {
  title: string;
  category: Category;
  format: Format;
  status?: Status;
  notes?: string;
}): Promise<Idea> {
  const databaseId = process.env.NOTION_DATABASE_ID!;
  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        Title: { title: [{ text: { content: input.title } }] },
        Category: { select: { name: input.category } },
        Format: { select: { name: input.format } },
        Status: { select: { name: input.status ?? "Idea" } },
        Notes: { rich_text: [{ text: { content: input.notes ?? "" } }] },
        "Ready to Script": { checkbox: false },
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`Notion create failed: ${res.status} ${await res.text()}`);
  }
  return pageToIdea(await res.json());
}

export async function updateIdeaInNotion(
  pageId: string,
  patch: Partial<{
    title: string;
    category: Category;
    format: Format;
    status: Status;
    notes: string;
    script: string;
    readyToScript: boolean;
  }>
): Promise<Idea> {
  const properties: Record<string, unknown> = {};

  if (patch.title !== undefined)
    properties.Title = { title: [{ text: { content: patch.title } }] };
  if (patch.category !== undefined)
    properties.Category = { select: { name: patch.category } };
  if (patch.format !== undefined)
    properties.Format = { select: { name: patch.format } };
  if (patch.status !== undefined)
    properties.Status = { select: { name: patch.status } };
  if (patch.notes !== undefined)
    properties.Notes = { rich_text: [{ text: { content: patch.notes } }] };
  if (patch.script !== undefined)
    properties.Script = { rich_text: [{ text: { content: patch.script } }] };
  if (patch.readyToScript !== undefined)
    properties["Ready to Script"] = { checkbox: patch.readyToScript };

  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ properties }),
  });
  if (!res.ok) {
    throw new Error(`Notion update failed: ${res.status} ${await res.text()}`);
  }
  return pageToIdea(await res.json());
}
