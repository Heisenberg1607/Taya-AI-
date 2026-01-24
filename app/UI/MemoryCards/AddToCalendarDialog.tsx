// app/UI/MemoryCards/AddToCalendarDialog.tsx
"use client";

import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { createActionItemEvent, addToCalendar } from "@/lib/calendar";
import { useToast } from "@/hooks/use-toast";

interface AddToCalendarDialogProps {
  actionItem: string;
  memoryTitle: string;
}

export function AddToCalendarDialog({
  actionItem,
  memoryTitle,
}: AddToCalendarDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedHour, setSelectedHour] = useState<string>("9");
  const [selectedMinute, setSelectedMinute] = useState<string>("0");
  const { toast } = useToast();

  const handleAddToCalendar = () => {
    if (!selectedDate) {
      toast({
        title: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    const event = createActionItemEvent(
      actionItem,
      memoryTitle,
      selectedDate,
      { hours: parseInt(selectedHour), minutes: parseInt(selectedMinute) }
    );

    addToCalendar(event);

    toast({
      title: "Calendar event created!",
      description: "Opening your calendar app to add the event.",
    });

    setOpen(false);
  };

  // Generate hour options (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  // Generate minute options (0, 15, 30, 45)
  const minutes = [0, 15, 30, 45];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center justify-center rounded-md border border-slate-200 bg-white p-1 hover:bg-slate-50 transition-colors"
          title="Add to calendar"
        >
          <CalendarIcon className="h-4 w-4 text-slate-600" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add to Calendar</DialogTitle>
          <DialogDescription>
            Schedule this action item in your calendar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Action item preview */}
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-900">Action Item:</p>
            <p className="mt-1 text-sm text-slate-700">{actionItem}</p>
          </div>

          {/* Date picker */}
          <div className="space-y-2">
            <Label>Select Date</Label>
            <div className="flex justify-center rounded-md border">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
                className="rounded-md"
              />
            </div>
          </div>

          {/* Time picker */}
          <div className="space-y-2">
            <Label>Select Time</Label>
            <div className="flex gap-2">
              <Select value={selectedHour} onValueChange={setSelectedHour}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((hour) => (
                    <SelectItem key={hour} value={hour.toString()}>
                      {hour.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Minute" />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map((minute) => (
                    <SelectItem key={minute} value={minute.toString()}>
                      {minute.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          {selectedDate && (
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm font-medium text-blue-900">Scheduled for:</p>
              <p className="mt-1 text-sm text-blue-700">
                {format(selectedDate, "EEEE, MMMM d, yyyy")} at{" "}
                {selectedHour.padStart(2, "0")}:{selectedMinute.padStart(2, "0")}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddToCalendar}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Add to Calendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
