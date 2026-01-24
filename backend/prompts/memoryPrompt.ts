export const memorySchema = {
  type: "json_schema",
  name: "memory_card",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["title", "category", "action_items", "mood"],
    properties: {
      title: { type: "string" },
      category: { type: "array", items: { type: "string" } },
      action_items: { type: "array", items: { type: "string" } },
      mood: { type: "string" },
    },
  },
} as const;

export function buildMemoryPrompt(transcript: string) {
  return `
Return ONLY a JSON object matching the schema.

Rules:
- title: short and human (max ~8 words)
- category: 1–4 short tags (Personal/Work/Health/Idea/Chore/School/etc.)
- action_items: only concrete next steps; can be []
- mood: one word or short phrase

Transcript:
"""${transcript}"""
`.trim();
}
