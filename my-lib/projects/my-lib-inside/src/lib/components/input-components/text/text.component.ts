import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BaseInputComponent } from '../../../../models/base-input-component/base-input-component.component';
import {
  ControlValueAccessor,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

/**
 * @fileoverview Text input component with Angular Forms integration.
 *
 * @description
 * A customizable text input component that extends BaseInputComponent and implements
 * ControlValueAccessor for seamless integration with Angular reactive forms.
 * Features debounced value changes and distinct value detection to optimize performance.
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
 * <lib-text
 *   [formControl]="nameControl"
 *   [label]="'Full name'"
 *   [placeholder]="'Enter your full name'"
 *   [required]="true"
 *   [errorMessages]="{
 *     required: 'Name is required',
 *     minlength: 'Name must be at least 3 characters'
 *   }"
 * ></lib-text>
 * ```
 *
 * @example
 * ```typescript
 * // In your component
 * form = new FormGroup({
 *   name: new FormControl('', [Validators.required, Validators.minLength(3)])
 * });
 * ```
 */
@Component({
  selector: 'lib-text',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule, FormsModule],
  templateUrl: './text.component.html',
  styleUrl: './text.component.scss',
})
export class TextComponent
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
