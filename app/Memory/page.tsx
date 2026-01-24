// app/memories/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MemoryCard } from "@/app/UI/MemoryCards/MemoryCard";
import type { MemoryResult } from "@/types/types";

export default function MemoriesPage() {
  const [memories, setMemories] = useState<MemoryResult[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMemories() {
    setLoading(true);
    try {
      const res = await fetch("/api/memory?limit=100", { cache: "no-store" });
      if (!res.ok) throw new Error(`GET failed: ${res.status}`);
      const data = await res.json();
      setMemories(data.items ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMemories();
  }, []);

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            All Memories
          </h1>
          <p className="text-sm text-slate-500">
            {loading ? "Loading…" : `${memories.length} memories`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={loadMemories}
            className="text-sm font-medium text-slate-900 hover:opacity-70"
          >
            Refresh
          </button>

          <Link
            href="/"
            className="text-sm font-medium text-slate-900 hover:opacity-70"
          >
            ← Back
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Fetching memories…</div>
      ) : memories.length === 0 ? (
        <div className="text-sm text-slate-500">No memories yet.</div>
      ) : (
        <div className="space-y-6">
          {memories.map((m) => (
            <MemoryCard key={m.id} data={m} />
          ))}
        </div>
      )}
    </main>
  );
}
