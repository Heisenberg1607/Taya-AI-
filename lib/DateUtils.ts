import { DateTime } from "luxon";

export class DateUtils {
  static formatForDisplay(isoString: string): string {
    const dt = DateTime.fromISO(isoString);
    if (!dt.isValid) return "Invalid date";
    return dt.toLocaleString(DateTime.DATETIME_MED);
  }

  static format(date: Date, pattern: string): string {
    const dt = DateTime.fromJSDate(date);
    if (!dt.isValid) return "Invalid date";
    return dt.toFormat(pattern);
  }

  static formatTime(hours: number, minutes: number): string {
    return DateTime.fromObject({ hour: hours, minute: minutes }).toFormat("HH:mm");
  }

  static toICSFormat(date: Date): string {
    return DateTime.fromJSDate(date).toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'");
  }

  static createDateWithTime(date: Date, hours: number, minutes: number): Date {
    return DateTime.fromJSDate(date)
      .set({ hour: hours, minute: minutes, second: 0, millisecond: 0 })
      .toJSDate();
  }

  static addHours(date: Date, hours: number): Date {
    return DateTime.fromJSDate(date).plus({ hours }).toJSDate();
  }

  static isPastDate(date: Date): boolean {
    const today = DateTime.now().startOf("day");
    const target = DateTime.fromJSDate(date).startOf("day");
    return target < today;
  }

  static today(): Date {
    return DateTime.now().toJSDate();
  }
}
