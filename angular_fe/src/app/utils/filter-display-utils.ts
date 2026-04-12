import { AppointmentStatus } from '../interfaces/dtos/contact/appointmentStatus.enum';

/**
 * @category Utils
 * 
 * @description Returns a display-friendly label for a given filter status.
 *
 * Used to convert internal status values into UI-friendly strings.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param filter - Filter status value
 * @returns Human-readable label for UI display
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export function getFilterDisplayName(filter: string): string {
  switch (filter) {
    case 'ALL':
      return '';
    case 'CONFIRMED':
      return 'confirmed';
    case 'PENDING':
      return 'pending';
    case 'RESCHEDULED':
      return 'rescheduled';
    case 'CANCELLED':
      return 'cancelled';
    case 'REJECTED':
      return 'rejected';
    default:
      return '';
  }
}

/**
 * @category Utils
 * 
 * @description Converts an appointment status enum value into a human-readable string.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param status - The `AppointmentStatus` enum value
 * @returns A human-readable label for the status
 *
 * @example
 * ```ts
 * const label = getAppointmentStatusLabel(AppointmentStatus.CONFIRMED);
 * console.log(label); // 'Confirmed'
 * ```
 */
export function getAppointmentStatusLabel(status: AppointmentStatus): string {
  const map: Record<AppointmentStatus, string> = {
    [AppointmentStatus.PENDING]: 'Pending',
    [AppointmentStatus.CONFIRMED]: 'Confirmed',
    [AppointmentStatus.CANCELLED]: 'Cancelled',
    [AppointmentStatus.COMPLETED]: 'Completed',
    [AppointmentStatus.RESCHEDULED]: 'Rescheduled',
    [AppointmentStatus.NO_SHOW]: 'No Show',
  };
  return map[status] ?? status;
}

/**
 * @category Utils
 * 
 * @description Formats a date string based on the selected period for chart visualization.
 * Applies different formatting strategies depending on the time range.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param {string} dateStr - Raw date string to format.
 * @param {string} period - Selected time period.
 * @returns {string} Formatted date string suitable for chart labels.
 */
export function formatDateForPeriod(dateStr: string, period: string): string {
  try {
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateStr);
      return 'Invalid';
    }

    switch (period) {
      case '7d':
      case '30d':
      case '90d':
        return date.toLocaleDateString('it-IT', {
          day: '2-digit',
          month: 'short',
        });

      case '1y':
        return date.toLocaleDateString('it-IT', {
          month: 'short',
        });

      default:
        return date.toLocaleDateString('it-IT', {
          day: '2-digit',
          month: 'short',
        });
    }
  } catch (error) {
    console.error('Error formatting date:', dateStr, error);
    return dateStr.substring(5, 7);
  }
}

/**
 * @category Utils
 * 
 * @description Formats a full date string for tooltip display,
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * including weekday, day, month and year.
 * @param {string} dateStr - Raw date string.
 * @returns {string} Fully formatted date string.
 */
export function formatFullDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting full date:', dateStr, error);
    return dateStr;
  }
}

/**
 * @category Utils
 * 
 * @description Calculates the maximum number of ticks for the chart axis
 * based on the selected period.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param {string} period - Selected time period.
 * @returns {number} Maximum number of ticks to display.
 */
export function getMaxTicksLimit(period: string): number {
  switch (period) {
    case '7d':
      return 7;
    case '30d':
      return 10;
    case '90d':
      return 12;
    case '1y':
      return 12;
    default:
      return 10;
  }
}

/**
 * @category Utils
 * 
 * @description Cleans appointment title by removing predefined prefixes.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param {string} name - Original appointment title.
 * @returns {string} Cleaned appointment title.
 */
export function getAptTitle(name: string): string {
  return name?.replace(/^Meeting:\s*/i, '') ?? '';
}

// utils/period-utils.ts

/**
 * @category Utils
 * 
 * @description Converts a period identifier into a human-readable label.
 * Useful for displaying selected period in charts, tables, or headers.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param {string} period - Period key ('7d', '30d', '90d', '1y').
 * @returns {string} Display label corresponding to the period.
 */
export function getPeriodLabel(period: string): string {
  switch (period) {
    case '7d':
      return '7 days';
    case '30d':
      return '30 days';
    case '90d':
      return '90 days';
    case '1y':
      return '1 year';
    default:
      return period;
  }
}
