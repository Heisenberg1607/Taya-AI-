// types/types.ts

export type MemoryResult = {
  id: string;
  created_at: string;
  transcript: string;
  title: string;
  category: string[];
  action_items: string[];
  completed_action_items: number[];
  mood: string;
};

export type RecordState = "idle" | "recording" | "processing";
