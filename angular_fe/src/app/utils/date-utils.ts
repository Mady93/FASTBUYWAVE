/**
 * @category Utils
 * 
 * @description Calculates the number of milliseconds remaining until the start of the next full minute.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @returns {number} Milliseconds remaining until the next whole minute.
 *
 * @example
 * // If the current time is 12:34:45.500, it returns 14500
 * const ms = getMillisToNextMinute();
 * console.log(ms); // ~14500
 */
export function getMillisToNextMinute(): number {
  const now = new Date();
  return 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
}

/**
 * @category Utils
 * 
 * @description Converts a timestamp into a human-readable relative time format.
 * - Returns "Just now" for times less than 1 minute ago.
 * - Returns "Xm ago" for minutes.
 * - Returns "Xh ago" for hours.
 * - Returns "Xd ago" for days.
 * - Falls back to locale date string for dates older than 7 days.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param timestamp - ISO date string or any valid date string.
 * @returns {string} Formatted relative time string (e.g., "Just now", "5m ago", "3h ago", "2d ago", "12/31/2025").
 *
 * @example
 * getTimeAgo('2025-02-15T14:30:00'); // → "5m ago" (if 5 minutes ago)
 * getTimeAgo('2025-02-10T10:00:00'); // → "5d ago" (if 5 days ago)
 * getTimeAgo('2024-12-31T23:59:59'); // → "12/31/2024" (if older than 7 days)
 */
export function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / 60000);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
