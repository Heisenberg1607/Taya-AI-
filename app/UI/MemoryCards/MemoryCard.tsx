"use client";

import { memo, useCallback } from "react";
import { MemoryResult } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, Sparkles } from "lucide-react";
import { AddToCalendarDialog } from "./AddToCalendarDialog";
import { EditMemoryDialog } from "./EditMemoryDialog";
import { EditActionItemDialog } from "./EditActionItemDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { DateUtils } from "@/lib/DateUtils";

const DEFAULT_MOOD = "neutral";

interface MemoryCardProps {
  data: MemoryResult;
  onUpdate?: (id: string, data: Partial<MemoryResult>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onToggleActionComplete?: (id: string, actionIndex: number) => Promise<void>;
  onUpdateActionItem?: (id: string, actionIndex: number, text: string) => Promise<void>;
  onDeleteActionItem?: (id: string, actionIndex: number) => Promise<void>;
}

function MemoryCardComponent({
  data,
  onUpdate,
  onDelete,
  onToggleActionComplete,
  onUpdateActionItem,
  onDeleteActionItem,
}: MemoryCardProps) {
  const moodLabel = data.mood?.trim() || DEFAULT_MOOD;

  const handleUpdateMemory = useCallback(
    async (updates: Partial<MemoryResult>) => {
      if (onUpdate) await onUpdate(data.id, updates);
    },
    [data.id, onUpdate]
  );

  const handleDeleteMemory = useCallback(async () => {
    if (onDelete) await onDelete(data.id);
  }, [data.id, onDelete]);

  const handleToggleComplete = useCallback(
    async (index: number) => {
      if (onToggleActionComplete) await onToggleActionComplete(data.id, index);
    },
    [data.id, onToggleActionComplete]
  );

  const handleUpdateAction = useCallback(
    async (index: number, text: string) => {
      if (onUpdateActionItem) await onUpdateActionItem(data.id, index, text);
    },
    [data.id, onUpdateActionItem]
  );

  const handleDeleteAction = useCallback(
    async (index: number) => {
      if (onDeleteActionItem) await onDeleteActionItem(data.id, index);
    },
    [data.id, onDeleteActionItem]
  );

  const isEditable = Boolean(onUpdate || onDelete);

  return (
    <Card className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="h-4 w-4" />
            <span>{DateUtils.formatForDisplay(data.created_at)}</span>
          </div>

          <h3 className="mt-2 truncate text-2xl font-semibold text-slate-900">
            {data.title}
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full">
              Mood: {moodLabel}
            </Badge>

            {data.category?.map((c) => (
              <Badge key={c} variant="outline" className="rounded-full">
                {c}
              </Badge>
            ))}
          </div>
        </div>

        {isEditable && (
          <div className="flex items-center gap-1">
            {onUpdate && (
              <EditMemoryDialog memory={data} onSave={handleUpdateMemory} />
            )}
            {onDelete && (
              <DeleteConfirmDialog
                title="Delete Memory?"
                description="This will permanently delete this memory and all its action items. This action cannot be undone."
                onConfirm={handleDeleteMemory}
              />
            )}
          </div>
        )}
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
            {data.action_items.map((item, idx) => {
              const isCompleted = data.completed_action_items?.includes(idx);

              return (
                <li
                  key={`${data.id}-ai-${idx}`}
                  className={`flex items-start gap-3 rounded-2xl border bg-white p-3 transition-colors ${
                    isCompleted ? "bg-slate-50" : ""
                  }`}
                >
                  {onToggleActionComplete ? (
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => handleToggleComplete(idx)}
                      className="mt-0.5"
                    />
                  ) : (
                    <div className="mt-0.5 h-5 w-5 rounded-md border" />
                  )}

                  <div
                    className={`flex-1 text-sm ${
                      isCompleted
                        ? "text-slate-400 line-through"
                        : "text-slate-700"
                    }`}
                  >
                    {item}
                  </div>

                  <div className="flex items-center gap-1">
                    {onUpdateActionItem && (
                      <EditActionItemDialog
                        text={item}
                        onSave={(text) => handleUpdateAction(idx, text)}
                      />
                    )}
                    {onDeleteActionItem && (
                      <DeleteConfirmDialog
                        title="Delete Action Item?"
                        description="This action item will be permanently removed."
                        onConfirm={() => handleDeleteAction(idx)}
                        variant="icon"
                      />
                    )}
                    <AddToCalendarDialog
                      actionItem={item}
                      memoryTitle={data.title}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}

export const MemoryCard = memo(MemoryCardComponent);
