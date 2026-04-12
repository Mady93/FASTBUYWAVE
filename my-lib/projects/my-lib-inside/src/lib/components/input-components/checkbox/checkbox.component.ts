import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CheckboxModule } from 'primeng/checkbox';
import {
  ReactiveFormsModule,
  FormsModule,
  ControlValueAccessor,
} from '@angular/forms';
import { BaseInputComponent } from '../../../../models/base-input-component/base-input-component.component';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

/**
 * @fileoverview Checkbox input component with Angular Forms integration.
 *
 * @description
 * A customizable checkbox component that extends BaseInputComponent and implements
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
 * <lib-checkbox
 *   [formControl]="control"
 *   [label]="'Accept terms and conditions'"
 *   [disabled]="false"
 *   [required]="true"
 * ></lib-checkbox>
 * ```
 *
 * @example
 * ```typescript
 * // In your component
 * form = new FormGroup({
 *   acceptTerms: new FormControl(false)
 * });
 * ```
 */
@Component({
  selector: 'lib-checkbox',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    CheckboxModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
})
export class CheckboxComponent
  extends BaseInputComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  /** @description Subject for cleaning up subscriptions on component destruction */
  private destroy$ = new Subject<void>();

  /** @description Internal flag for the checkbox value */
  private _val: boolean = false;

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
        .subscribe((value: boolean) => {
          if (value !== this._val) {
            this._val = value;
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

  /**
   * @description Handles checkbox value change from user interaction.
   * Updates internal state and notifies the parent form control.
   *
   * @param value - The new checkbox state (true = checked, false = unchecked)
   */
  onValueChange(value: boolean): void {
    this._val = value;
    this.value = value;
    this.onChange(value); // Notify the form control about the change
  }
}
