import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  Type,
  ViewChild,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AbstractControlOptions,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subject, takeUntil } from 'rxjs';
import { InputComponentMap } from '../../../models/input-component-map';
import { BaseInputComponent } from '../../../models/base-input-component/base-input-component.component';
import { FormConfig } from '../../interfaces/dinamic_form/form_config.interface';
import { FieldChangeEvent } from '../../interfaces/dinamic_form/field_change-event.interface';
import { FormFieldConfig } from '../../interfaces/dinamic_form/form_field_config.interface';
import { FormButton } from '../../interfaces/dinamic_form/form_button.interface';
import { FormStatus } from '../../interfaces/dinamic_form/form_status.interface';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

/**
 * @fileoverview Dynamic form component that renders form fields dynamically based on configuration.
 * Supports various input types, validation, and dynamic component loading.
 *
 * @description
 * A flexible form component that generates form controls dynamically from a configuration object.
 * Supports text inputs, selects, checkboxes, radios, and custom components. Handles validation,
 * form submission, and field value changes.
 *
 * Implements Angular lifecycle hooks:
 * - OnInit: initializes the form
 * - OnChanges: reacts to changes in input configuration
 * - AfterViewInit: handles post-view initialization logic
 * - OnDestroy: cleans up subscriptions and resources
 *
 * @category Components
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```typescript
 * const config: FormConfig = {
 *   fields: [
 *     { name: 'email', type: 'email', label: 'Email', required: true },
 *     { name: 'password', type: 'password', label: 'Password', required: true }
 *   ],
 *   buttons: [{ id: 'submit', label: 'Login', type: 'submit' }]
 * };
 * ```
 *
 * ```html
 * <lib-dynamic-form
 *   [formConfig]="config"
 *   (formSubmit)="onSubmit($event)"
 * ></lib-dynamic-form>
 * ```
 */
@Component({
  selector: 'lib-dynamic-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit
{
  /**
   * @description Configuration object defining form structure and behavior
   */
  @Input() formConfig: FormConfig = { fields: [], buttons: [] };

  /** @description Form title displayed at the top */
  @Input() formTitle: string = '';

  /** @description Layout style: 'card', 'inline', or 'stacked' */
  @Input() layout: string = 'card';

  /** @description CSS class applied to form element */
  @Input() formClass: string = '';

  /** @description CSS class applied to card container */
  @Input() cardClass: string = '';

  /** @description Whether to show backdrop overlay */
  @Input() backdrop: boolean = true;

  /** @description Whether to apply blur effect to backdrop */
  @Input() backdropBlur: boolean = true;

  /** @description Enable Google social login button */
  @Input() enableSocialLogin: boolean = false;

  /** @description Emitted when form is submitted with valid data */
  @Output() formSubmit = new EventEmitter<any>();

  /** @description Emitted when form validity or values change */
  @Output() formStatusChange = new EventEmitter<FormStatus>();

  /** @description Emitted when any field value changes */
  @Output() fieldValueChange = new EventEmitter<FieldChangeEvent>();

  /** @description Emitted when Google Sign-In button is clicked */
  @Output() googleSignin = new EventEmitter<void>();

  /** @description Emitted when login button is clicked */

  /** @description Emitted when login button is clicked */
  @Output() login = new EventEmitter<void>();

  /** @description Emitted when any button is clicked */
  @Output() buttonClick = new EventEmitter<FormButton>();

  /** @description Emitted when register button is clicked */
  @Output() register = new EventEmitter<void>();

  /** @description Container reference for dynamically loaded components */
  @ViewChild('dynamicInputContainer', { read: ViewContainerRef, static: false })
  inputContainer!: ViewContainerRef;

  /** @description Public form group instance */
  form!: FormGroup;

  /** @description Injected FormBuilder service for creating reactive forms */
  private fb: FormBuilder;

  /** @description Change detector for manual change detection triggers */
  private cd: ChangeDetectorRef;

  /** @description Platform identifier for browser/server detection */
  private platformId: Object;

  /** @description Subject for managing unsubscriptions */
  private destroy$ = new Subject<void>();

  constructor(
    fb: FormBuilder,
    cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.fb = fb;
    this.cd = cd;
    this.platformId = platformId;
  }

  // Component state

  /** @description Tracks visibility state for password fields */
  fieldVisibility: Record<string, boolean> = {};

  /** @description Map of dynamically created component references */
  componentRefs = new Map<string, ComponentRef<any>>();

  /**
   * @inheritdoc
   *
   * @description Lifecycle hook: initializes form after component initialization.
   */
  ngOnInit(): void {
    this.initForm();
  }

  /**
   * @inheritdoc
   *
   * @description Lifecycle hook: loads dynamic components after view initialization.
   */
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDynamicComponents();
      this.cd.detectChanges();
    }
  }

  /**
   * @inheritdoc
   *
   * @description Lifecycle hook: responds to input property changes.
   *
   * @param changes - Object containing changed input properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formConfig'] && !changes['formConfig'].firstChange) {
      this.initForm();
      this.clearDynamicComponents();

      if (this.inputContainer) {
        this.loadDynamicComponents();
      }
    }

    if (changes['formData'] && !changes['formData'].firstChange && this.form) {
      this.updateFormValues();
    }
  }

  /**
   * @inheritdoc
   *
   * @description Lifecycle hook: cleans up subscriptions and dynamic components.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearDynamicComponents();
  }

  /**
   * @description  Initializes the reactive form group from configuration.
   */
  private initForm(): void {
    const formGroup: { [key: string]: any } = {};

    this.formConfig.fields.forEach((field) => {
      formGroup[field.name] = [
        this.form?.get(field.name)?.value || field.defaultValue || '',
        field.validators || [],
      ];

      if (field.type === 'password') {
        this.fieldVisibility[field.name] = false;
      }
    });

    this.form = this.fb.group(formGroup, {
      validators: this.formConfig.formValidators || [],
    } as AbstractControlOptions);

    this.emitFormStatus();

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((values: Record<string, any>) => {
        Object.keys(values).forEach((key) => {
          if (this.form.get(key)?.dirty) {
            this.fieldValueChange.emit({
              fieldName: key,
              value: values[key],
              form: this.form,
            });
          }
          this.emitFormStatus();
        });
      });
  }

  /**
   * @description Updates form values from external data.
   */
  private updateFormValues(): void {
    if (!this.form || !this.form) return;

    this.form.patchValue(this.form, { emitEvent: false });
    this.cd.markForCheck();
  }

  /**
   * @description Loads dynamic components for each field in the configuration.
   */
  private loadDynamicComponents(): void {
    if (!this.inputContainer) {
      return;
    }

    this.formConfig.fields.forEach((field) => {
      if (!field.hidden) {
        let componentToUse: Type<any> | undefined;

        if (field.component) {
          componentToUse = field.component;
        } else if (field.type) {
          componentToUse = InputComponentMap.getComponent(field.type);
        }

        if (componentToUse) {
          this.createDynamicComponent({
            ...field,
            component: componentToUse,
          });
        } else {
        }
      }
    });
  }

  /**
   * @description Creates a dynamic component instance for a form field.
   * @param field - Field configuration
   */
  private createDynamicComponent(field: FormFieldConfig): void {
    if (!field.component) {
      return;
    }

    try {
      const componentRef = this.inputContainer.createComponent(field.component);
      const instance = componentRef.instance;

      if (instance) {
        instance.name = field.name;
        instance.label = field.label;
        instance.value = this.form.get(field.name)?.value;
        instance.placeholder = field.placeholder;
        instance.disabled = field.disabled;
        instance.hidden = field.hidden;
        instance.required = field.required;
        instance.formControl = this.form.get(field.name);
        instance.errorMessages = field.errorMessages || {};

        if (field.componentProps) {
          Object.entries(field.componentProps).forEach(([prop, value]) => {
            instance[prop] = value;
          });
        }

        if (instance instanceof BaseInputComponent) {
          if (instance.valueChange) {
            instance.valueChange
              .pipe(takeUntil(this.destroy$))
              .subscribe((value: any) => {
                this.form.get(field.name)?.setValue(value);
                this.form.get(field.name)?.markAsDirty();
              });
          }
        }

        if (instance.valueChange) {
          instance.valueChange
            .pipe(takeUntil(this.destroy$))
            .subscribe((value: any) => {
              this.form.get(field.name)?.setValue(value);
              this.form.get(field.name)?.markAsDirty();
            });
        }
      }

      this.componentRefs.set(field.name, componentRef);
    } catch (error) {}
  }

  /**
   * @description Clears all dynamic components from the container.
   */
  private clearDynamicComponents(): void {
    this.componentRefs.forEach((ref) => {
      if (ref) {
        ref.destroy();
      }
    });

    this.componentRefs.clear();

    if (this.inputContainer) {
      this.inputContainer.clear();
    }
  }

  /**
   * @description Handles form submission.
   */
  onSubmit(): void {
    this.markAllAsTouched();

    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
      this.emitFormStatus();
    }
  }

  /**
   * @description Emits current form status to parent component.
   */
  private emitFormStatus(): void {
    this.formStatusChange.emit({
      values: this.form.value,
      valid: this.form.valid,
      errors: this.getFormErrors(),
    });
  }

  /**
   * @description Collects all form validation errors.
   *
   * @returns Object containing errors by field name
   */
  private getFormErrors(): { [key: string]: any } {
    const errors: { [key: string]: any } = {};

    Object.keys(this.form.controls).forEach((key) => {
      if (this.form.get(key)?.errors) {
        errors[key] = this.form.get(key)?.errors;
      }
    });

    if (this.form.errors) {
      errors['form'] = this.form.errors;
    }

    return errors;
  }

  /**
   * @description Marks all form controls as touched.
   */
  private markAllAsTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.markAsTouched();
    });
  }

  /**
   * @description Notifies child components when form is reset.
   */
  private notifyComponentsOfReset(): void {
    this.componentRefs.forEach((ref, fieldName) => {
      const instance = ref.instance;

      if (instance) {
        const defaultValue =
          this.formConfig.fields.find((f) => f.name === fieldName)
            ?.defaultValue || '';

        if (typeof instance.writeValue === 'function') {
          instance.writeValue(defaultValue);
        }

        if (typeof instance.reset === 'function') {
          instance.reset();
        }

        if (instance instanceof BaseInputComponent) {
          instance.touched = false;
          if (instance.formControl) {
            instance.formControl.markAsUntouched();
            instance.formControl.markAsPristine();
          }
        }
      }
    });
  }

  /**
   * @description Marks all form controls as untouched.
   */
  private markAllAsUntouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.markAsUntouched();
    });
  }

  /**
   * @description Marks all form controls as pristine.
   */
  private markAllAsPristine(): void {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.markAsPristine();
    });
  }

  /**
   * @description Resets the form to its initial state.
   */
  resetForm(): void {
    this.form.reset(this.getInitialFormValues(), { emitEvent: false });
    this.markAllAsUntouched();
    this.markAllAsPristine();
    this.form.updateValueAndValidity();
    this.notifyComponentsOfReset();
    this.emitFormStatus();
    this.cd.detectChanges();
  }

  /**
   * @description Gets initial form values from configuration.
   * @returns Object with default values for each field
   */
  private getInitialFormValues(): { [key: string]: any } {
    const values: { [key: string]: any } = {};
    this.formConfig.fields.forEach((field) => {
      values[field.name] = field.defaultValue || '';
    });
    return values;
  }

  /**
   * @description Handles button click events.
   * @param button - Button configuration
   */
  handleButtonClick(button: FormButton): void {
    this.buttonClick.emit(button);

    switch (button.id) {
      case 'submit':
        break;

      case 'refresh':
        this.resetForm();
        break;

      case 'login':
        this.login.emit();
        break;

      case 'google-signin':
        this.googleSignin.emit();
        break;

      case 'register':
        this.register.emit();
        break;

      default:
    }
  }

  /**
   * @description Toggles visibility of a password field.
   * @param fieldName - Name of the field
   */
  toggleFieldVisibility(fieldName: string): void {
    this.fieldVisibility[fieldName] = !this.fieldVisibility[fieldName];
    this.cd.markForCheck();
  }

  /**
   * @description Gets the current input type for a field (handles password visibility).
   * @param fieldName - Name of the field
   * @returns Input type string
   */
  getFieldType(fieldName: string): string {
    const field = this.formConfig.fields.find((f) => f.name === fieldName);
    if (field?.type === 'password') {
      return this.fieldVisibility[fieldName] ? 'text' : 'password';
    }
    return field?.type || 'text';
  }

  /**
   * @description Gets error message for a specific field.
   * @param fieldName - Name of the field
   * @returns Error message or empty string
   */
  getErrorMessage(fieldName: string): string {
    const field = this.formConfig.fields.find((f) => f.name === fieldName);
    const control = this.form.get(fieldName);

    if (
      !control ||
      !control.errors ||
      !control.touched ||
      !field?.errorMessages
    )
      return '';

    for (const errorKey in control.errors) {
      if (field.errorMessages[errorKey]) {
        return field.errorMessages[errorKey];
      }
    }

    return '';
  }

  /**
   * @description Checks if form has a specific error.
   * @param errorKey - Error key to check
   * @returns True if error exists and form is touched
   */
  hasFormError(errorKey: string): boolean {
    return this.form.errors?.[errorKey] && this.form.touched;
  }

  /**
   * @description Gets error message for a form-level error.
   * @param errorKey - Error key
   * @returns Error message or default
   */
  getFormErrorMessage(errorKey: string): string {
    return this.formConfig.formErrorMessages?.[errorKey] || 'Error in the form';
  }

  /**
   * @description Gets icon from configuration.
   * @param iconName - Icon name or IconProp
   * @returns IconProp or null
   */
  getIcon(iconName: IconProp): IconProp | null {
    if (this.formConfig && this.formConfig.icons) {
      if (typeof iconName === 'string') {
        return this.formConfig.icons[iconName] || null;
      }
      return iconName;
    }
    return null;
  }
}
