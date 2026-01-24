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

export class CalendarUtils {
  /**
   * Escapes special characters for ICS format
   */
  private static escapeICSText(text: string): string {
    return text.replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  }

  /**
   * Generates an ICS file content string for a calendar event
   */
  private static generateICS(event: CalendarEvent): string {
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
      `SUMMARY:${this.escapeICSText(title)}`,
      `DESCRIPTION:${this.escapeICSText(description)}`,
      ...(location ? [`LOCATION:${this.escapeICSText(location)}`] : []),
      `UID:${crypto.randomUUID()}@${CALENDAR_CONSTANTS.APP_DOMAIN}`,
      "STATUS:CONFIRMED",
      "SEQUENCE:0",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    return icsContent;
  }

  /**
   * Creates and opens a calendar event file
   */
  static addToCalendar(event: CalendarEvent): void {
    const icsContent = this.generateICS(event);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank");

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, CALENDAR_CONSTANTS.URL_CLEANUP_DELAY_MS);
  }

  /**
   * Creates a calendar event from an action item
   */
  static createActionItemEvent(
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

  /**
   * Creates a generic calendar event
   */
  static createEvent(
    title: string,
    description: string,
    startDate: Date,
    durationHours: number = CALENDAR_CONSTANTS.DEFAULT_EVENT_DURATION_HOURS,
    location?: string
  ): CalendarEvent {
    return {
      title,
      description,
      startDate,
      endDate: DateUtils.addHours(startDate, durationHours),
      location,
    };
  }
}

// Backward compatibility exports
export function addToCalendar(event: CalendarEvent): void {
  CalendarUtils.addToCalendar(event);
}

export function createActionItemEvent(
  actionItem: string,
  memoryTitle: string,
  selectedDate: Date,
  selectedTime: TimeSelection
): CalendarEvent {
  return CalendarUtils.createActionItemEvent(actionItem, memoryTitle, selectedDate, selectedTime);
}
