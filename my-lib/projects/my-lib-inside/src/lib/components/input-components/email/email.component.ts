import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { BaseInputComponent } from '../../../../models/base-input-component/base-input-component.component';

/**
 * @fileoverview Email input component with Angular Forms integration.
 *
 * @description
 * A customizable email input component that extends BaseInputComponent and implements
 * ControlValueAccessor for seamless integration with Angular reactive forms.
 * Features debounced value changes and distinct value detection to optimize performance.
 * Includes built-in email validation handling.
 *
 * @extends BaseInputComponent
 * @implements {ControlValueAccessor}
 * @implements {OnInit}
 * @implements {OnDestroy}
 *
 * @category Components
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```html
 * <lib-email
 *   [formControl]="emailControl"
 *   [label]="'Email address'"
 *   [placeholder]="'Enter your email'"
 *   [required]="true"
 *   [errorMessages]="{
 *     required: 'Email is required',
 *     email: 'Please enter a valid email address'
 *   }"
 * ></lib-email>
 * ```
 *
 * @example
 * ```typescript
 * // In your component
 * form = new FormGroup({
 *   email: new FormControl('', [Validators.required, Validators.email])
 * });
 * ```
 */
@Component({
  selector: 'lib-email',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, ReactiveFormsModule],
  templateUrl: './email.component.html',
  styleUrl: './email.component.scss',
})
export class EmailComponent
  extends BaseInputComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  /** @description Subject for cleaning up subscriptions on component destruction */
  private destroy$ = new Subject<void>();

  /**
   * @inheritdoc
   * @description Lifecycle hook: initializes the component and subscribes to form control value changes.
   * Sets up a subscription with debounce time and distinct value detection to prevent
   * unnecessary updates and optimize performance.
   */
  ngOnInit(): void {
    if (this.formControl) {
      this.formControl.valueChanges
        .pipe(
          takeUntil(this.destroy$),
          debounceTime(100),
          distinctUntilChanged(),
        )
        .subscribe((value) => {
          if (value !== this.value) {
            this.value = value;
          }
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
}
