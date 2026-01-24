import { prisma } from "@/backend/db/prisma";
import type { MemoryJson } from "@/backend/validator/memoryJson";
import type { Prisma } from "@prisma/client";

const DEFAULT_FETCH_LIMIT = 20;
const MAX_FETCH_LIMIT = 100;
const MIN_FETCH_LIMIT = 1;

export interface UpdateMemoryCardInput {
  title?: string;
  transcript?: string;
  category?: string[];
  mood?: string;
  actionItems?: string[];
  completedActionItems?: number[];
}

export async function saveMemoryCard(transcript: string, memory: MemoryJson) {
  return prisma.memoryCard.create({
    data: {
      transcript,
      title: memory.title,
      category: memory.category,
      actionItems: memory.action_items,
      completedActionItems: [],
      mood: memory.mood,
      rawLlmJson: memory as unknown as Prisma.JsonObject,
    },
  });
}

export async function listMemoryCards(limit: number = DEFAULT_FETCH_LIMIT) {
  const validLimit = Math.min(Math.max(limit, MIN_FETCH_LIMIT), MAX_FETCH_LIMIT);

  return prisma.memoryCard.findMany({
    orderBy: { createdAt: "desc" },
    take: validLimit,
  });
}

export async function getMemoryCardById(id: string) {
  return prisma.memoryCard.findUnique({
    where: { id },
  });
}

export async function updateMemoryCard(id: string, data: UpdateMemoryCardInput) {
  return prisma.memoryCard.update({
    where: { id },
    data,
  });
}

export async function toggleActionItemComplete(id: string, actionIndex: number) {
  const memory = await prisma.memoryCard.findUnique({
    where: { id },
    select: { completedActionItems: true },
  });

  if (!memory) throw new Error("Memory not found");

  const completed = memory.completedActionItems;
  const isCompleted = completed.includes(actionIndex);

  const newCompleted = isCompleted
    ? completed.filter((i) => i !== actionIndex)
    : [...completed, actionIndex];

  return prisma.memoryCard.update({
    where: { id },
    data: { completedActionItems: newCompleted },
  });
}

export async function updateActionItem(
  id: string,
  actionIndex: number,
  newText: string
) {
  const memory = await prisma.memoryCard.findUnique({
    where: { id },
    select: { actionItems: true },
  });

  if (!memory) throw new Error("Memory not found");

  const items = [...memory.actionItems];
  if (actionIndex < 0 || actionIndex >= items.length) {
    throw new Error("Invalid action item index");
  }

  items[actionIndex] = newText;

  return prisma.memoryCard.update({
    where: { id },
    data: { actionItems: items },
  });
}

export async function deleteActionItem(id: string, actionIndex: number) {
  const memory = await prisma.memoryCard.findUnique({
    where: { id },
    select: { actionItems: true, completedActionItems: true },
  });

  if (!memory) throw new Error("Memory not found");

  const items = memory.actionItems.filter((_, i) => i !== actionIndex);

  const completed = memory.completedActionItems
    .filter((i) => i !== actionIndex)
    .map((i) => (i > actionIndex ? i - 1 : i));

  return prisma.memoryCard.update({
    where: { id },
    data: { actionItems: items, completedActionItems: completed },
  });
}

export async function deleteMemoryCard(id: string) {
  return prisma.memoryCard.delete({
    where: { id },
  });
}

export function validateLimit(limit: number | undefined): number {
  if (limit === undefined) return DEFAULT_FETCH_LIMIT;
  return Math.min(Math.max(limit, MIN_FETCH_LIMIT), MAX_FETCH_LIMIT);
}
