/**
 * @category Utils
 * 
 * @description Collection of reusable validation regex patterns used throughout the application.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 */
export const ValidationPatterns = {
  /**
   * @description Pattern to validate personal or entity names:
   * - Must start with a letter (A-Z, a-z, accented letters from à to ù)
   * - Can contain letters, dots, and spaces
   *
   * @author Popa Madalina Mariana
   * @version 0.0.0
   *
   */
  namePattern: /^[A-Za-zà-ù][A-Za-zà-ù.\s]*$/,

  /**
   * @description Pattern to validate agency names:
   * - Can contain letters (including all accented letters À-ÿ)
   * - Can contain spaces
   * - Only letters and spaces allowed, no digits or special characters
   *
   * @author Popa Madalina Mariana
   * @version 0.0.0
   *
   */
  agencyNamePattern: /^[A-Za-zÀ-ÿ\s]+$/,

  /**
   * @description Pattern to validate agency fee percentage as integers:
   * - Only digits 0-9 allowed (no decimals)
   *
   * @author Popa Madalina Mariana
   * @version 0.0.0
   *
   */
  agencyFeePercentPattern: /^[0-9]+$/,

  /**
   * @description Pattern to validate URLs that must start with https://
   * Valid: https://google.com, https://example.com, https://www.test.co.uk/path
   * Invalid: http://google.com, google.com, https://, reff
   *
   * @author Popa Madalina Mariana
   * @version 0.0.0
   *
   */
  httpsUrlPattern: /^https:\/\/.+\..+$/,

  /**
   * @description Pattern per validare prezzi con massimo 6 cifre intere e fino a 2 decimali.
   * Esempi validi: 0, 123, 123456, 123456.78
   *
   * @author Popa Madalina Mariana
   * @version 0.0.0
   *
   */
  pricePattern: /^\d{1,6}(\.\d{1,2})?$/,

  /**
   * @description Pattern to validate international phone numbers (E.164 format):
   * - Starts with optional +
   * - First digit 1-9
   * - Followed by up to 14 digits
   *
   * @author Popa Madalina Mariana
   * @version 0.0.0
   *
   */
  phoneNumberPattern: /^\+?[1-9]\d{1,14}$/,

  /**
   * @description Pattern for street number/house number:
   * - Can contain digits, letters, hyphens, slashes (per numeri civici tipo "12A", "12/B", "12-1")
   * - Min 1 carattere, max 10 caratteri
   *
   * @author Popa Madalina Mariana
   * @version 0.0.0
   *
   */
  streetNumberPattern: /^[a-zA-Z0-9\/\-]{1,10}$/,
};
