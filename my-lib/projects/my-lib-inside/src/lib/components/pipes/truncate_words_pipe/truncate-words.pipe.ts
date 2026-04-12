import { Pipe, PipeTransform } from '@angular/core';

/**
 * @fileoverview Pipe that truncates text to a specified number of words.
 *
 * @description
 * Truncates a string to a specified number of words and appends an ellipsis (...)
 * if the text exceeds the limit. Useful for previews, excerpts, or summaries.
 *
 * @category Pipes
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```html
 * <!-- Basic usage -->
 * <p>{{ longText | truncateWordsPipe:10 }}</p>
 *
 * <!-- With dynamic limit -->
 * <p>{{ description | truncateWordsPipe:previewWords }}</p>
 * ```
 *
 * @example
 * ```typescript
 * // Usage examples
 * const text = 'This is a long sentence with many words that needs truncation';
 *
 * truncateWordsPipe.transform(text, 5);
 * // Returns: 'This is a long sentence...'
 *
 * truncateWordsPipe.transform(text, 20);
 * // Returns: full text (no truncation)
 * ```
 */
@Pipe({
  name: 'truncateWordsPipe',
  standalone: true,
})
export class TruncateWordsPipe implements PipeTransform {
  /**
   * @description Truncates the input text to the specified number of words.
   *
   * @param text - The text to truncate. If empty or null, returns empty string.
   * @param maxWords - Maximum number of words to keep. Words beyond this limit are truncated.
   * @returns Truncated text with ellipsis if truncated, otherwise the original text
   *
   * @example
   * ```typescript
   * transform('Hello world, how are you?', 3)  // 'Hello world, how...'
   * transform('Short text', 10)                // 'Short text'
   * transform('', 5)                           // ''
   * ```
   */
  transform(text: string, maxWords: number): string {
    if (!text) return '';
    const words = text.trim().split(/\s+/);
    return words.length <= maxWords
      ? text
      : words.slice(0, maxWords).join(' ') + '...';
  }
}
