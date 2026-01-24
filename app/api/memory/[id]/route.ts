import { NextResponse } from "next/server";
import {
  getMemoryCardById,
  updateMemoryCard,
  deleteMemoryCard,
  toggleActionItemComplete,
  updateActionItem,
  deleteActionItem,
} from "@/backend/repo/memoryRepo";
import type { MemoryResult } from "@/types/types";

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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const memory = await getMemoryCardById(id);

    if (!memory) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    return NextResponse.json(formatMemoryResponse(memory));
  } catch (err: unknown) {
    console.error("GET /api/memory/[id] failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch memory", detail: message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.action === "toggle_complete" && typeof body.actionIndex === "number") {
      const updated = await toggleActionItemComplete(id, body.actionIndex);
      return NextResponse.json(formatMemoryResponse(updated));
    }

    if (body.action === "update_action_item" && typeof body.actionIndex === "number") {
      const updated = await updateActionItem(id, body.actionIndex, body.text);
      return NextResponse.json(formatMemoryResponse(updated));
    }

    if (body.action === "delete_action_item" && typeof body.actionIndex === "number") {
      const updated = await deleteActionItem(id, body.actionIndex);
      return NextResponse.json(formatMemoryResponse(updated));
    }

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.transcript !== undefined) updateData.transcript = body.transcript;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.mood !== undefined) updateData.mood = body.mood;
    if (body.actionItems !== undefined) updateData.actionItems = body.actionItems;

    const updated = await updateMemoryCard(id, updateData);
    return NextResponse.json(formatMemoryResponse(updated));
  } catch (err: unknown) {
    console.error("PATCH /api/memory/[id] failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update memory", detail: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteMemoryCard(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("DELETE /api/memory/[id] failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete memory", detail: message },
      { status: 500 }
    );
  }
}
