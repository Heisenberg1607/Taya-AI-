// app/UI/MemoryCard/MemoryCard.tsx
"use client";

import { MemoryResult } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckSquare, Sparkles } from "lucide-react";
import { AddToCalendarDialog } from "./AddToCalendarDialog";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function moodLabel(mood: string) {
  // keep it simple; backend mood is string
  return mood?.trim() ? mood : "neutral";
}

export function MemoryCard({ data }: { data: MemoryResult }) {
  return (
    <Card className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="h-4 w-4" />
            <span>{formatDate(data.created_at)}</span>
          </div>

          <h3 className="mt-2 truncate text-2xl font-semibold text-slate-900">
            {data.title}
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full">
              Mood: {moodLabel(data.mood)}
            </Badge>

            {data.category?.map((c) => (
              <Badge key={c} variant="outline" className="rounded-full">
                {c}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
        {data.transcript}
      </div>

      {!!data.action_items?.length && (
        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900">
            <CheckSquare className="h-4 w-4" />
            Action items
          </div>

          <ul className="space-y-2">
            {data.action_items.map((item, idx) => (
              <li
                key={`${data.id}-ai-${idx}`}
                className="flex items-start gap-3 rounded-2xl border bg-white p-3"
              >
                <div className="mt-0.5 h-5 w-5 rounded-md border" />
                <div className="flex-1 text-sm text-slate-700">{item}</div>
                <AddToCalendarDialog
                  actionItem={item}
                  memoryTitle={data.title}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
