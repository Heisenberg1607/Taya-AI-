import { NextResponse } from "next/server";
import { transcribeWithWhisper } from "@/backend/services/transcribe";
import { structureMemory } from "@/backend/services/structure";
import {
  saveMemoryCard,
  listMemoryCards,
  validateLimit,
} from "@/backend/repo/memoryRepo";
import type { MemoryResult } from "@/types/types";

const MIN_AUDIO_SIZE_BYTES = 2000;

export const runtime = "nodejs";

function formatMemoryResponse(item: {
  id: string;
  createdAt: Date;
  transcript: string;
  title: string;
  category: string[];
  actionItems: string[];
  completedActionItems?: number[];
  mood: string;
}): MemoryResult {
  return {
    id: item.id,
    created_at: item.createdAt.toISOString(),
    transcript: item.transcript,
    title: item.title,
    category: item.category,
    action_items: item.actionItems,
    completed_action_items: item.completedActionItems ?? [],
    mood: item.mood,
  };
}

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

    if (audio.size < MIN_AUDIO_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Audio looks empty/silent. Try again." },
        { status: 400 }
      );
    }

    const transcript = await transcribeWithWhisper(audio);
    if (!transcript) {
      return NextResponse.json(
        { error: "Empty transcription. Try again." },
        { status: 400 }
      );
    }

    const memory = await structureMemory(transcript);
    const created = await saveMemoryCard(transcript, memory);

    return NextResponse.json(formatMemoryResponse(created));
  } catch (err: unknown) {
    console.error("POST /api/memory failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Server error", detail: message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const limit = validateLimit(limitParam ? Number(limitParam) : undefined);

    const items = await listMemoryCards(limit);

    return NextResponse.json({
      items: items.map(formatMemoryResponse),
    });
  } catch (err: unknown) {
    console.error("GET /api/memory failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch memories", detail: message },
      { status: 500 }
    );
  }
}
