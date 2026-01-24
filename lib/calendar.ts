// lib/calendar.ts
// Utility functions for calendar integration

export interface CalendarEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
}

/**
 * Format a date to ICS format (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

/**
 * Generate ICS file content for a calendar event
 */
export function generateICS(event: CalendarEvent): string {
  const { title, description, startDate, endDate, location } = event;
  
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Taya Memory App//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `SUMMARY:${title.replace(/\n/g, "\\n")}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    ...(location ? [`LOCATION:${location.replace(/\n/g, "\\n")}`] : []),
    `UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@taya.app`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return icsContent;
}

/**
 * Add event directly to calendar (opens default calendar app)
 */
export function addToCalendar(event: CalendarEvent): void {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  // Open the ICS file, which will prompt the default calendar app
  window.open(url, "_blank");
  
  // Clean up after a short delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Create a calendar event for an action item
 */
export function createActionItemEvent(
  actionItem: string,
  memoryTitle: string,
  selectedDate: Date,
  selectedTime: { hours: number; minutes: number }
): CalendarEvent {
  const startDate = new Date(selectedDate);
  startDate.setHours(selectedTime.hours, selectedTime.minutes, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + 1); // Default 1-hour duration
  
  return {
    title: actionItem,
    description: `Action item from memory: ${memoryTitle}`,
    startDate,
    endDate,
  };
}
