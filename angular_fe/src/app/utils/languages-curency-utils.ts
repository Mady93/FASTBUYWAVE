import ISO6391 from 'iso-639-1';
import currencyCodes from 'currency-codes';
import getSymbolFromCurrency from 'currency-symbol-map';

/**
 * @category Utils
 * 
 * @description Represents a currency according to the ISO 4217 standard.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 */
export interface Currency {
  /** ISO 4217 currency code (e.g., 'USD', 'EUR') */
  code: string;
  /** Full currency name (e.g., 'US Dollar') */
  currency: string;
  /** Numeric ISO 4217 code (e.g., '840') */
  number: string;
  /** Number of decimal digits supported */
  digits: number;
  /** List of countries that use this currency */
  countries: string[];
}

/**
 * @category Utils
 * 
 * @description Utility class for handling languages and currencies.
 *
 * Provides methods to retrieve language names and codes, currency codes,
 * currency details, currency symbols, and dropdown-ready currency objects.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 */
export class LanguageCurrencyUtils {
  /**
   * @description Returns all language names according to the ISO 639-1 standard.
   *
   * @author Popa Madalina Mariana
   * @version 0.0.0
   *
   * @returns {string[]} Array of language names (e.g., ['English', 'Italian', 'Spanish'])
   *
   * @example
   * LanguageCurrencyUtils.getLanguageNames();
   * // ['English', 'Italian', 'Spanish', ...]
   */
  static getLanguageNames(): string[] {
    return ISO6391.getAllNames();
  }

  /**
   * @category Utils
   * 
   * @description Returns all language codes according to the ISO 639-1 standard.
   *
   * @author Popa Madalina Mariana
   * @version 0.0.0
   *
   * @returns {string[]} Array of ISO 639-1 codes (e.g., ['en', 'it', 'es'])
   *
   * @example
   * LanguageCurrencyUtils.getLanguageCodes();
   * // ['en', 'it', 'es', ...]
   */
  static getLanguageCodes(): string[] {
    return ISO6391.getAllCodes();
  }

  /**
   * @category Utils
   * 
   * @description Returns all currency codes according to the ISO 4217 standard.
   *
   * @author Popa Madalina Mariana
   * @version 0.0.0
   *
   * @returns {string[]} Array of currency codes (e.g., ['USD', 'EUR', 'JPY'])
   *
   * @example
   * LanguageCurrencyUtils.getCurrencyCodes();
   * // ['USD', 'EUR', 'JPY', ...]
   */
  static getCurrencyCodes(): string[] {
    return currencyCodes.codes();
  }

  /**
   * @category Utils
   * 
   * @description Returns detailed information for all currencies.
   *
   * @author Popa Madalina Mariana
   * @version 0.0.0
   *
   * @returns {Currency[]} Array of Currency objects containing code, name, numeric code, decimal digits, and countries.
   *
   * @example
   * LanguageCurrencyUtils.getCurrencyDetails();
   * // [{ code: 'USD', currency: 'US Dollar', number: '840', digits: 2, countries: ['United States'] }, ...]
   */
  static getCurrencyDetails(): Currency[] {
    return currencyCodes.data as Currency[];
  }

  /**
   * @category Utils
   * 
   * @description Returns the symbol for a currency by its ISO 4217 code.
   *
   * @author Popa Madalina Mariana
   * @version 0.0.0
   *
   * @param {string} code - ISO 4217 currency code (e.g., 'USD', 'EUR')
   * @returns {string} Symbol of the currency (e.g., '$', '€') or the code itself if not found
   *
   * @example
   * LanguageCurrencyUtils.getCurrencySymbol('USD'); // '$'
   * LanguageCurrencyUtils.getCurrencySymbol('EUR'); // '€'
   */
  static getCurrencySymbol(code: string): string {
    return getSymbolFromCurrency(code) || code;
  }

  /**
   * @category Utils
   * 
   * @description Returns an array of objects ready for populating a currency dropdown.
   *
   * Each object contains:
   * - `code`: ISO 4217 currency code
   * - `name`: Currency name
   * - `symbol`: Currency symbol
   *
   * @author Popa Madalina Mariana
   * @version 0.0.0
   *
   * @returns {{ code: string; name: string; symbol: string }[]} Array of dropdown-friendly currency objects
   *
   * @example
   * LanguageCurrencyUtils.getCurrencyDropdown();
   * // [{ code: 'USD', name: 'US Dollar', symbol: '$' }, { code: 'EUR', name: 'Euro', symbol: '€' }, ...]
   */
  static getCurrencyDropdown(): {
    code: string;
    name: string;
    symbol: string;
  }[] {
    return this.getCurrencyDetails().map((curr: Currency) => ({
      code: curr.code,
      name: curr.currency,
      symbol: this.getCurrencySymbol(curr.code),
    }));
  }
}
