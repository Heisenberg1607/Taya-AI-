"use client";

import { useState, useCallback } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface EditActionItemDialogProps {
  text: string;
  onSave: (newText: string) => Promise<void>;
}

export function EditActionItemDialog({ text, onSave }: EditActionItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [saving, setSaving] = useState(false);

  const handleOpen = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setEditedText(text);
    }
  }, [text]);

  const handleSave = useCallback(async () => {
    if (!editedText.trim()) return;
    
    setSaving(true);
    try {
      await onSave(editedText.trim());
      setOpen(false);
    } catch (e) {
      console.error("Failed to save:", e);
    } finally {
      setSaving(false);
    }
  }, [editedText, onSave]);

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center justify-center rounded-md border border-slate-200 bg-white p-1 hover:bg-slate-50 transition-colors"
          title="Edit action item"
        >
          <Pencil className="h-4 w-4 text-slate-600" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Action Item</DialogTitle>
          <DialogDescription>Update the action item text</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="action-text">Action Item</Label>
          <Textarea
            id="action-text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={3}
            className="mt-2"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !editedText.trim()}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
