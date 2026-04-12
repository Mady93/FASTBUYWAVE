import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { InputComponent } from '../../../interfaces/input_component.interface';
import { BaseInputComponent } from '../../../../models/base-input-component/base-input-component.component';
import { Subject, takeUntil } from 'rxjs';

/**
 * @fileoverview Password input component with visibility toggle and strength meter.
 *
 * @description
 * A customizable password input component that extends BaseInputComponent and implements
 * ControlValueAccessor for seamless integration with Angular reactive forms.
 * Features password visibility toggle and real-time password strength calculation.
 *
 * @extends BaseInputComponent
 * @implements {ControlValueAccessor}
 * @implements {InputComponent}
 * @implements {OnInit}
 *
 * @category Components
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```html
 * <lib-password
 *   [formControl]="passwordControl"
 *   [label]="'Password'"
 *   [placeholder]="'Enter your password'"
 *   [showPasswordStrength]="true"
 *   (strengthChange)="onStrengthChange($event)"
 * ></lib-password>
 * ```
 *
 * @example
 * ```typescript
 * // In your component
 * onStrengthChange(strength: number) {
 *   console.log('Password strength:', strength); // 0-4
 * }
 * ```
 */
@Component({
  selector: 'lib-password',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './password.component.html',
  styleUrl: './password.component.scss',
})
export class PasswordComponent
  extends BaseInputComponent
  implements ControlValueAccessor, InputComponent, OnInit
{
  /** @description Whether to display the password strength meter */
  @Input() showPasswordStrength: boolean = true;

  /** @description Emitted when password strength changes (0-4) */
  @Output() strengthChange = new EventEmitter<number>();

  /** @description Toggles visibility of password characters */
  showPassword: boolean = false;

  /** @description Current password strength value (0-4) */
  private passwordStrength: number = 0;

  /** @description Subject for cleaning up subscriptions on component destruction */
  private destroy$ = new Subject<void>();

  /**
   * @inheritdoc
   * @description Lifecycle hook: initializes the component and subscribes to form control value changes.
   * Calculates password strength on each value change.
   */
  ngOnInit(): void {
    if (this.formControl) {
      this.formControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.value = value;
          this.calculatePasswordStrength();
        });
    }
  }

  /**
   * @inheritdoc
   * @description Lifecycle hook: cleans up subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * @description Toggles the visibility of password characters.
   * When true, shows plain text; when false, masks characters.
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * @description Calculates password strength based on complexity rules.
   *
   * Criteria:
   * - Minimum 8 characters
   * - Contains numbers
   * - Contains uppercase and lowercase letters
   * - Contains special characters
   *
   */
  private calculatePasswordStrength(): void {
    if (!this.value) {
      this.passwordStrength = 0;
      return;
    }

    let strength = 0;

    // Minimum length check
    if (this.value.length >= 8) strength++;

    // Contains numbers
    if (/\d/.test(this.value)) strength++;

    // Contains mixed case letters
    if (/[a-z]/.test(this.value) && /[A-Z]/.test(this.value)) strength++;

    // Contains special characters
    if (/[^A-Za-z0-9]/.test(this.value)) strength++;

    this.passwordStrength = strength;
    this.strengthChange.emit(this.passwordStrength);
  }

  /**
   * @description Gets the CSS class for a strength indicator bar.
   *
   * @param index - Bar index (0-3)
   * @returns CSS class name ('weak', 'fair', 'good', 'strong', or empty string)
   */
  getStrengthClass(index: number): string {
    if (this.passwordStrength === 0) return '';
    if (index === 0 && this.passwordStrength >= 1) return 'weak';
    if (index === 1 && this.passwordStrength >= 2) return 'fair';
    if (index === 2 && this.passwordStrength >= 3) return 'good';
    if (index === 3 && this.passwordStrength >= 4) return 'strong';
    return '';
  }

  /**
   * @description Gets the human-readable strength text based on current password strength.
   *
   * @returns Strength description ('Enter a password', 'Weak', 'Fair', 'Good', 'Strong')
   */
  get strengthText(): string {
    if (this.passwordStrength === 0) return 'Enter a password';
    if (this.passwordStrength === 1) return 'Weak';
    if (this.passwordStrength === 2) return 'Fair';
    if (this.passwordStrength === 3) return 'Good';
    return 'Strong';
  }
}
