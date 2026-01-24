import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function transcribeWithWhisper(file: File): Promise<string> {
  const t = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file,
  });

  return (t.text || "").trim();
}
