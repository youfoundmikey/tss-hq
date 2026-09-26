// This file used to be backed by a separate Upstash database. It's now a
// thin pass-through to Notion, which is the actual shared source of truth
// between this app and the four scheduled TSS agents. Nothing here
// duplicates data, it just reads and writes the same rows they do.

import {
  listIdeasFromNotion,
  getIdeaFromNotion,
  createIdeaInNotion,
  updateIdeaInNotion,
} from "./notion";
import type { Idea, Category, Format, Status } from "./types";

export async function listIdeas(): Promise<Idea[]> {
  return listIdeasFromNotion();
}

export async function getIdea(id: string): Promise<Idea | null> {
  return getIdeaFromNotion(id);
}

export async function createIdea(input: {
  title: string;
  category: Category;
  format: Format;
  notes?: string;
  status?: Status;
}): Promise<Idea> {
  return createIdeaInNotion(input);
}

export async function updateIdea(
  id: string,
  patch: Partial<{
    title: string;
    category: Category;
    format: Format;
    status: Status;
    notes: string;
    script: string;
    readyToScript: boolean;
  }>
): Promise<Idea | null> {
  return updateIdeaInNotion(id, patch);
}
