/**
 * Utility class for common validation operations
 */
export class ValidationUtils {
  /**
   * Checks if a value is a non-null object (record)
   */
  static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  /**
   * Checks if a value is a non-empty string
   */
  static isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
  }

  /**
   * Checks if a value is a valid non-negative number
   */
  static isNonNegativeNumber(value: unknown): value is number {
    return typeof value === "number" && !isNaN(value) && value >= 0;
  }

  /**
   * Checks if a value is a positive integer
   */
  static isPositiveInteger(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
  }

  /**
   * Checks if a value is a valid array
   */
  static isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  /**
   * Checks if a value is a non-empty array
   */
  static isNonEmptyArray(value: unknown): value is unknown[] {
    return Array.isArray(value) && value.length > 0;
  }

  /**
   * Checks if a value is a valid email format
   */
  static isValidEmail(value: unknown): boolean {
    if (!this.isNonEmptyString(value)) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  /**
   * Checks if a value is a valid URL
   */
  static isValidUrl(value: unknown): boolean {
    if (!this.isNonEmptyString(value)) return false;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates that a string is within length bounds
   */
  static isWithinLength(value: string, min: number, max: number): boolean {
    const length = value.trim().length;
    return length >= min && length <= max;
  }

  /**
   * Sanitizes a string by trimming whitespace and optionally limiting length
   */
  static sanitizeString(value: unknown, maxLength?: number): string {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    return maxLength ? trimmed.slice(0, maxLength) : trimmed;
  }

  /**
   * Sanitizes an array of strings, filtering empty values
   */
  static sanitizeStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => (typeof item === "string" ? item.trim() : String(item).trim()))
      .filter(Boolean);
  }

  /**
   * Validates a number is within a range (inclusive)
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Coerces a value to a number within bounds, with a default fallback
   */
  static coerceNumber(
    value: unknown,
    defaultValue: number,
    min?: number,
    max?: number
  ): number {
    const num = typeof value === "number" ? value : Number(value);
    if (isNaN(num)) return defaultValue;
    
    let result = num;
    if (min !== undefined && result < min) result = min;
    if (max !== undefined && result > max) result = max;
    
    return result;
  }

  /**
   * Creates a validation result object
   */
  static createResult<T>(
    isValid: boolean,
    data?: T,
    errors?: string[]
  ): ValidationResult<T> {
    return {
      isValid,
      data: isValid ? data : undefined,
      errors: errors ?? [],
    };
  }
}

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: string[];
}
