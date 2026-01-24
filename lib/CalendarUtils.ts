import { DateUtils } from "./DateUtils";

const CALENDAR_CONSTANTS = {
  DEFAULT_EVENT_DURATION_HOURS: 1,
  URL_CLEANUP_DELAY_MS: 100,
  APP_IDENTIFIER: "Taya Memory App",
  APP_DOMAIN: "taya.app",
} as const;

interface CalendarEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
}

interface TimeSelection {
  hours: number;
  minutes: number;
}

function escapeICSText(text: string): string {
  return text.replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function generateICS(event: CalendarEvent): string {
  const { title, description, startDate, endDate, location } = event;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${CALENDAR_CONSTANTS.APP_IDENTIFIER}//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${DateUtils.toICSFormat(startDate)}`,
    `DTEND:${DateUtils.toICSFormat(endDate)}`,
    `DTSTAMP:${DateUtils.toICSFormat(new Date())}`,
    `SUMMARY:${escapeICSText(title)}`,
    `DESCRIPTION:${escapeICSText(description)}`,
    ...(location ? [`LOCATION:${escapeICSText(location)}`] : []),
    `UID:${crypto.randomUUID()}@${CALENDAR_CONSTANTS.APP_DOMAIN}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return icsContent;
}

export function addToCalendar(event: CalendarEvent): void {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  window.open(url, "_blank");

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, CALENDAR_CONSTANTS.URL_CLEANUP_DELAY_MS);
}

export function createActionItemEvent(
  actionItem: string,
  memoryTitle: string,
  selectedDate: Date,
  selectedTime: TimeSelection
): CalendarEvent {
  const startDate = DateUtils.createDateWithTime(
    selectedDate,
    selectedTime.hours,
    selectedTime.minutes
  );

  const endDate = DateUtils.addHours(
    startDate,
    CALENDAR_CONSTANTS.DEFAULT_EVENT_DURATION_HOURS
  );

  return {
    title: actionItem,
    description: `Action item from memory: ${memoryTitle}`,
    startDate,
    endDate,
  };
}
