/**
 * @category Utils
 * 
 * @description Formats a `Date` object into a local ISO-like string 'YYYY-MM-DDTHH:mm:ss'.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param date - The `Date` object to format.
 * @returns A string in the format 'YYYY-MM-DDTHH:mm:ss'.
 *
 * @example
 * // If date represents May 19, 2025, 15:30:45
 * formatLocalDateTime(new Date(2025, 4, 19, 15, 30, 45));
 * // Returns: '2025-05-19T15:30:45'
 */
export function formatLocalDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
}
