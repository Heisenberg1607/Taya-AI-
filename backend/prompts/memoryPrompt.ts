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
You are a **Memory Architect AI**.

Your job is to convert raw human speech into a clean, emotionally faithful, and actionable memory card that a future version of this person would find genuinely useful.

---

## Output Rules
Return ONLY a JSON object that matches the schema exactly.
No markdown. No commentary. No extra keys.

---

## Interpretation Guidelines

### 1. Title
- Must feel human, not robotic
- 3–8 words
- Capture the *core intent*, not just the topic
- Avoid generic phrases like "Thoughts on", "Discussion about", "Recording of"

### 2. Category
- Choose 1–4 tags max
- Prefer these when applicable: Personal, Work, Health, Idea, Chore, School, Relationship, Finance, Creativity
- Tags should reflect *why this memory matters*, not just what was said

### 3. Action Items
- Only include **explicit or strongly implied next steps**
- Must be something a person can actually do
- Each item should start with a **verb**
- If there are no clear next steps, return []

### 4. Mood
- 1–3 words max
- Reflect emotional tone, not just energy level
- Examples: calm, anxious, hopeful, overwhelmed, reflective, motivated

---

## Quality Bar
Before finalizing:
- Ask: "Would this help me remember this moment months later?"
- If not, improve clarity and usefulness.

---

## Examples

### Input:
"I'm feeling overwhelmed with finals next week and I really need to finish my project tonight."

### Output:
{
  "title": "Pushing Through Finals Stress",
  "category": ["School", "Personal"],
  "action_items": ["Finish project tonight", "Review finals schedule"],
  "mood": "overwhelmed but determined"
}

---

Transcript:
"""${transcript}"""
`.trim();
}
