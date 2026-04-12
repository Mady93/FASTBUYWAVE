import { Pipe, PipeTransform } from '@angular/core';

/**
 * @fileoverview Pipe that formats numbers into human-readable like counts.
 *
 * @description
 * Converts large numbers into compact format with K (thousands), M (millions),
 * B (billions), and T (trillions) suffixes. Useful for displaying like counts,
 * follower counts, or any large numerical values in a concise format.
 *
 * @category Pipes
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```html
 * <!-- Basic usage --> * <p>{{ 1500 | formatLikes }}</p>      <!-- Output: 1.5K -->
 * <p>{{ 2500000 | formatLikes }}</p>   <!-- Output: 2.5M -->
 * <p>{{ 500 | formatLikes }}</p>       <!-- Output: 500 -->
 * ```
 *
 * @example
 * ```typescript
 * // Usage in component
 * export class MyComponent {
 *   likes = 1234567;
 *   formattedLikes = this.formatLikesPipe.transform(this.likes); // "1.2M"
 * }
 * ```
 */
@Pipe({
  name: 'formatLikes',
  standalone: true,
})
export class FormatLikesPipe implements PipeTransform {
  /**
   * @description Transforms a number into a compact formatted string with suffix.
   *
   * @param value - The number to format (e.g., 1500, 2500000)
   * @returns Formatted string with appropriate suffix (e.g., '1.5K', '2.5M')
   *          Returns the original number as string if less than 1000
   *
   * @example
   * ```typescript
   * transform(500)     // returns '500'
   * transform(1500)    // returns '1.5K'
   * transform(2500000) // returns '2.5M'
   * transform(1234567890) // returns '1.2B'
   * ```
   */
  transform(value: number): string {
    if (value < 1000) return value.toString();
    const units = ['K', 'M', 'B', 'T'];
    let unitIndex = -1;
    let scaled = value;

    while (scaled >= 1000 && unitIndex < units.length - 1) {
      scaled /= 1000;
      unitIndex++;
    }

    return scaled.toFixed(1).replace(/\.0$/, '') + units[unitIndex];
  }
}
