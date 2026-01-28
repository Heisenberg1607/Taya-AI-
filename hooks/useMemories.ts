"use client";

import { useState, useCallback, useMemo } from "react";
import type { MemoryResult } from "@/types/types";

const DEFAULT_FETCH_LIMIT = 100;
const ITEMS_PER_PAGE = 1;

interface UseMemoriesReturn {
  memories: MemoryResult[];
  currentMemories: MemoryResult[] | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  loading: boolean;
  error: string | null;
  fetchMemories: () => Promise<void>;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  updateMemory: (id: string, data: Partial<MemoryResult>) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  toggleActionItemComplete: (id: string, actionIndex: number) => Promise<void>;
  updateActionItem: (id: string, actionIndex: number, text: string) => Promise<void>;
  deleteActionItem: (id: string, actionIndex: number) => Promise<void>;
}

export function useMemories(): UseMemoriesReturn {
  const [memories, setMemories] = useState<MemoryResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalCount = memories.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const currentMemories = useMemo(() => {
    const StartIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const EndIndex = StartIndex + ITEMS_PER_PAGE;
    return memories.slice(StartIndex, EndIndex);
  }, [memories, currentPage]);

  const fetchMemories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/memory?limit=${DEFAULT_FETCH_LIMIT}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

      const data = await res.json();
      setMemories(data.items ?? []);
      setCurrentPage(1);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.min(Math.max(1, page), totalPages));
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (hasNextPage) setCurrentPage((p) => p + 1);
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) setCurrentPage((p) => p - 1);
  }, [hasPrevPage]);

  const updateLocalMemory = useCallback((updated: MemoryResult) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
  }, []);

  const removeLocalMemory = useCallback((id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    setCurrentPage((p) => Math.min(p, Math.max(1, memories.length - 1)));
  }, [memories.length]);

  const updateMemory = useCallback(
    async (id: string, data: Partial<MemoryResult>) => {
      const res = await fetch(`/api/memory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          transcript: data.transcript,
          category: data.category,
          mood: data.mood,
        }),
      });

      if (!res.ok) throw new Error("Failed to update memory");

      const updated = await res.json();
      updateLocalMemory(updated);
    },
    [updateLocalMemory]
  );

  const deleteMemory = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/memory/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete memory");
      removeLocalMemory(id);
    },
    [removeLocalMemory]
  );

  const toggleActionItemComplete = useCallback(
    async (id: string, actionIndex: number) => {
      const res = await fetch(`/api/memory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_complete", actionIndex }),
      });

      if (!res.ok) throw new Error("Failed to toggle action item");

      const updated = await res.json();
      updateLocalMemory(updated);
    },
    [updateLocalMemory]
  );

  const updateActionItem = useCallback(
    async (id: string, actionIndex: number, text: string) => {
      const res = await fetch(`/api/memory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_action_item", actionIndex, text }),
      });

      if (!res.ok) throw new Error("Failed to update action item");

      const updated = await res.json();
      updateLocalMemory(updated);
    },
    [updateLocalMemory]
  );

  const deleteActionItem = useCallback(
    async (id: string, actionIndex: number) => {
      const res = await fetch(`/api/memory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_action_item", actionIndex }),
      });

      if (!res.ok) throw new Error("Failed to delete action item");

      const updated = await res.json();
      updateLocalMemory(updated);
    },
    [updateLocalMemory]
  );

  return {
    memories,
    currentMemories,
    totalCount,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    loading,
    error,
    fetchMemories,
    goToPage,
    nextPage,
    prevPage,
    updateMemory,
    deleteMemory,
    toggleActionItemComplete,
    updateActionItem,
    deleteActionItem,
  };
}
