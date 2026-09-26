export type Category =
  | "World Building"
  | "Songs for When"
  | "Best Moments in Songs"
  | "Modern Day"
  | "The One Decision"
  | "New Favorites"
  | "Other";

export type Format = "Short Form" | "Long Form";

export type Status = "Idea" | "Scripting" | "Filming" | "Editing" | "Posted";

export interface Idea {
  id: string; // this IS the Notion page id, there's no separate app id
  title: string;
  category: Category;
  format: Format;
  status: Status;
  notes: string;
  script: string;
  readyToScript: boolean;
  scheduledDate: string | null;
  createdAt: number;
  updatedAt: number;
  notionUrl: string;
}
