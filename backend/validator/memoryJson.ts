// this file is used to validate the memory json object, in short whatever is returned from the LLM should be validated here, check the types, or if the LLM returns a non-json object, return null

export type MemoryJson = {
  title: string;
  category: string[];
  action_items: string[];
  mood: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function sanitizeMemoryJson(value: unknown): MemoryJson | null {
  if (!isRecord(value)) return null;

  const titleRaw = value.title;
  const moodRaw = value.mood;
  const categoryRaw = value.category;
  const actionItemsRaw = value.action_items;

  const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
  const mood = typeof moodRaw === "string" ? moodRaw.trim() : "";

  const category = Array.isArray(categoryRaw)
    ? categoryRaw
        .map(String)
        .map((s) => s.trim())
        .filter(Boolean)
    : null;

  const action_items = Array.isArray(actionItemsRaw)
    ? actionItemsRaw
        .map(String)
        .map((s) => s.trim())
        .filter(Boolean)
    : null;

  if (!title || !mood || !category || !action_items) return null;

  return { title, mood, category, action_items };
}
