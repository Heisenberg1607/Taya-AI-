import OpenAI from "openai";
import {
  memorySchema,
  buildMemoryPrompt,
} from "@/backend/prompts/memoryPrompt";
import {
  sanitizeMemoryJson,
  type MemoryJson,
} from "@/backend/validator/memoryJson";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

const openai = new OpenAI({ apiKey });

export async function structureMemory(transcript: string): Promise<MemoryJson> {
  const r = await openai.responses.create({
    model: "gpt-4o-mini",
    input: buildMemoryPrompt(transcript),
    text: { format: memorySchema },
  });

  const raw = (r.output_text || "").trim();
  if (!raw) throw new Error("LLM returned empty output");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("LLM returned non-JSON");
  }

  const structured = sanitizeMemoryJson(parsed);
  if (!structured) throw new Error("LLM JSON invalid shape");

  return structured;
}
