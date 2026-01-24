import { prisma } from "@/backend/db/prisma";
import type { MemoryJson } from "@/backend/validator/memoryJson";

export async function saveMemoryCard(transcript: string, m: MemoryJson) {
  return prisma.memoryCard.create({
    data: {
      transcript,
      title: m.title,
      category: m.category,
      actionItems: m.action_items,
      mood: m.mood,
      rawLlmJson: m,
    },
  });
}

export async function listMemoryCards(limit = 20) {
  return prisma.memoryCard.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
