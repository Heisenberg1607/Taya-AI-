export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Memory {
  id: string;
  title: string;
  mood: "calm" | "focused" | "hopeful" | "excited" | "reflective" | "grateful";
  categories: string[];
  transcript: string;
  actionItems: ActionItem[];
    timestamp: Date;
    created_at?: string;
}

export type MemoryResult = {
  id: string;
  created_at: string;
  transcript: string;
  title: string;
  category: string[];
  action_items: string[];
  mood: string;
};

export type RecordState = "idle" | "recording" | "processing";
