import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

/**
 * @category Pipes
 * 
 * Angular pipe that sanitizes a URL string and marks it as safe.
 *
 * Uses DomSanitizer to bypass Angular security and allow binding
 * of dynamic URLs (e.g., images, downloads, or external resources).
 *
 * Use with caution: bypassing security can expose the application
 * to XSS vulnerabilities if the input is not trusted.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Pipe({
  name: 'safeUrl',
  standalone: true,
})
export class SafeUrlPipe implements PipeTransform {
  /**
   * Creates an instance of SafeUrlPipe.
   *
   * @param sanitizer - Angular DomSanitizer used to mark URLs as safe
   */
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Transforms a string URL into a SafeUrl.
   *
   * @param value - URL string to sanitize
   * @returns SafeUrl that can be safely bound in templates
   */
  transform(value: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(value);
  }
}
