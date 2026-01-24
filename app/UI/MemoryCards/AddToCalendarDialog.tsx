"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
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
import { createActionItemEvent, addToCalendar } from "@/lib/CalendarUtils";
import { DateUtils } from "@/lib/DateUtils";
import { useToast } from "@/hooks/use-toast";

const CALENDAR_DIALOG_CONSTANTS = {
  DEFAULT_HOUR: "9",
  DEFAULT_MINUTE: "0",
  HOURS_COUNT: 24,
  MINUTE_INTERVALS: [0, 15, 30, 45],
  DISPLAY_DATE_FORMAT: "EEEE, MMMM d, yyyy",
} as const;

interface AddToCalendarDialogProps {
  actionItem: string;
  memoryTitle: string;
}

function AddToCalendarDialogComponent({
  actionItem,
  memoryTitle,
}: AddToCalendarDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    DateUtils.today()
  );
  const [selectedHour, setSelectedHour] = useState<string>(
    CALENDAR_DIALOG_CONSTANTS.DEFAULT_HOUR
  );
  const [selectedMinute, setSelectedMinute] = useState<string>(
    CALENDAR_DIALOG_CONSTANTS.DEFAULT_MINUTE
  );
  const { toast } = useToast();

  const hours = useMemo(
    () => Array.from({ length: CALENDAR_DIALOG_CONSTANTS.HOURS_COUNT }, (_, i) => i),
    []
  );

  const minutes = useMemo(
    () => CALENDAR_DIALOG_CONSTANTS.MINUTE_INTERVALS,
    []
  );

  const isDateDisabled = useCallback((date: Date) => {
    return DateUtils.isPastDate(date);
  }, []);

  const handleAddToCalendar = useCallback(() => {
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
  }, [selectedDate, selectedHour, selectedMinute, actionItem, memoryTitle, toast]);

  const formattedDate = useMemo(() => {
    if (!selectedDate) return null;
    return DateUtils.format(selectedDate, CALENDAR_DIALOG_CONSTANTS.DISPLAY_DATE_FORMAT);
  }, [selectedDate]);

  const formattedTime = useMemo(() => {
    return DateUtils.formatTime(parseInt(selectedHour), parseInt(selectedMinute));
  }, [selectedHour, selectedMinute]);

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
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-900">Action Item:</p>
            <p className="mt-1 text-sm text-slate-700">{actionItem}</p>
          </div>

          <div className="space-y-2">
            <Label>Select Date</Label>
            <div className="flex justify-center rounded-md border">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={isDateDisabled}
                initialFocus
                className="rounded-md"
              />
            </div>
          </div>

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

          {selectedDate && (
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm font-medium text-blue-900">Scheduled for:</p>
              <p className="mt-1 text-sm text-blue-700">
                {formattedDate} at {formattedTime}
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

export const AddToCalendarDialog = memo(AddToCalendarDialogComponent);
