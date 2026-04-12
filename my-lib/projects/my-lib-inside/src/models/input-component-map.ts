import { CheckboxComponent } from '../lib/components/input-components/checkbox/checkbox.component';
import { DateComponent } from '../lib/components/input-components/date/date.component';
import { DatetimeLocalComponent } from '../lib/components/input-components/datetime-local/datetime-local.component';
import { EmailComponent } from '../lib/components/input-components/email/email.component';
import { FileComponent } from '../lib/components/input-components/file/file.component';
import { NumberComponent } from '../lib/components/input-components/number/number.component';
import { PasswordComponent } from '../lib/components/input-components/password/password.component';
import { RadioComponent } from '../lib/components/input-components/radio/radio.component';
import { RangeComponent } from '../lib/components/input-components/range/range.component';
import { SearchComponent } from '../lib/components/input-components/search/search.component';
import { TelComponent } from '../lib/components/input-components/tel/tel.component';
import { TextComponent } from '../lib/components/input-components/text/text.component';
import { TextareaComponent } from '../lib/components/input-components/textarea/textarea.component';
import { TimeComponent } from '../lib/components/input-components/time/time.component';
import { UrlComponent } from '../lib/components/input-components/url/url.component';
import { SelectComponent } from '../lib/components/input-components/select/select.component';
import { Type } from '@angular/core';

/**
 * @fileoverview Registry for mapping input types to their corresponding components.
 * Provides centralized component lookup and registration.
 *
 * @description
 * Maps string type names to Angular component classes. Used by DynamicFormComponent
 * to dynamically render the correct input component for each field type.
 *
 * @category Utils
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```typescript
 * // Get component for text input
 * const textComponent = InputComponentMap.getComponent('text');
 *
 * // Register custom component
 * InputComponentMap.registerComponent('custom', CustomInputComponent);
 * ```
 */
export class InputComponentMap {
  /**
   * @description Internal registry mapping input type strings to their corresponding component classes.
   *
   * Supported types:
   * - text, email, password, tel, number, textarea
   * - select, radio, checkbox
   * - date, datetime, time
   * - file, range, search, url
   */
  private static readonly componentMap: { [key: string]: Type<any> } = {
    text: TextComponent,
    email: EmailComponent,
    password: PasswordComponent,
    tel: TelComponent,
    number: NumberComponent,
    textarea: TextareaComponent,
    select: SelectComponent,
    radio: RadioComponent,
    checkbox: CheckboxComponent,
    date: DateComponent,
    datetime: DatetimeLocalComponent,
    file: FileComponent,
    range: RangeComponent,
    search: SearchComponent,
    time: TimeComponent,
    url: UrlComponent,
  };

  /**
   * @description Retrieves the component class for a given input type.
   * @param type - Input type identifier (e.g., 'text', 'email')
   * @returns Component class or undefined if not found
   */
  static getComponent(type: string): Type<any> | undefined {
    return this.componentMap[type];
  }

  /**
   * @description Registers a new component for a custom input type.
   * @param type - Type identifier to map
   * @param component - Component class to register
   */
  static registerComponent(type: string, component: Type<any>): void {
    this.componentMap[type] = component;
  }

  /**
   * @description Returns all available input type identifiers.
   * @returns Array of registered type names
   */
  static getAvailableTypes(): string[] {
    return Object.keys(this.componentMap);
  }
}
