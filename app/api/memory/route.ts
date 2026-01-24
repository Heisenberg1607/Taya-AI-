import { NextResponse } from "next/server";
import { transcribeWithWhisper } from "@/backend/services/transcribe";
import { structureMemory } from "@/backend/services/structure";
import { saveMemoryCard, listMemoryCards } from "@/backend/repo/memoryRepo";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const audio = form.get("audio");

    if (!(audio instanceof File)) {
      return NextResponse.json(
        { error: "Missing form field: audio" },
        { status: 400 }
      );
    }

    if (audio.size < 2000) {
      return NextResponse.json(
        { error: "Audio looks empty/silent. Try again." },
        { status: 400 }
      );
    }

    // 1) voice -> text
    const transcript = await transcribeWithWhisper(audio);
    if (!transcript) {
      return NextResponse.json(
        { error: "Empty transcription. Try again." },
        { status: 400 }
      );
    }

    // 2) text -> memory JSON
    const memory = await structureMemory(transcript);

    // 3) save to DB
    const created = await saveMemoryCard(transcript, memory);

    return NextResponse.json({
      id: created.id,
      created_at: created.createdAt,
      transcript: created.transcript,
      title: created.title,
      category: created.category,
      action_items: created.actionItems,
      mood: created.mood,
    });
  } catch (err: unknown) {
    console.error("POST /api/memory failed:", err);

    let message = "Unknown error";
    if (err instanceof Error) message = err.message;

    return NextResponse.json(
      { error: "Server error", detail: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  const items = await listMemoryCards(20);
  return NextResponse.json({
    items: items.map((x) => ({
      id: x.id,
      created_at: x.createdAt,
      transcript: x.transcript,
      title: x.title,
      category: x.category,
      action_items: x.actionItems,
      mood: x.mood,
    })),
  });
}
