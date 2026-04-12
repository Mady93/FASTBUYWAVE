import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CategoryService } from 'src/app/services/path/category/category.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { showSnackBar } from 'src/app/utils/snackbar.utils';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { animate, style, transition, trigger } from '@angular/animations';
import { FormLayoutComponent, ModalAction } from 'my-lib-inside';

/**
 * @category Components
 * 
 * @description Handles the creation of categories in the admin dashboard.
 *
 * Key features:
 * - Create categories and subcategories with name, label, icon, link, and active status
 * - Supports nested category trees
 * - Tracks form changes to enable/disable Reset and Save buttons
 * - Manages form actions (reset, save)
 * - Provides feedback via snackbar
 * - Animations for opening/closing sections using `slideDown`
 *
 * Lifecycle:
 * - `ngOnInit`: creates the form, saves initial state, subscribes to form changes
 * - `ngOnDestroy`: unsubscribes from all form change subscriptions
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Component({
  selector: 'app-admin-category-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    FontAwesomeModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatListModule,
    FormLayoutComponent,
  ],
  templateUrl: './admin-category-create.component.html',
  styleUrl: './admin-category-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: '0', opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden' }),
        animate('200ms ease-in', style({ height: '0', opacity: 0 })),
      ]),
    ]),
  ],
})
export class AdminCategoryCreateComponent implements OnInit, OnDestroy {
  /**
   * @property category
   * @description The current category passed from the DashboardComponent via `ngComponentOutletInputs`.
   *
   * @source - DashboardComponent template:
   * ```html
   * <ng-container
   *   [ngComponentOutlet]="currentComponent"
   *   [ngComponentOutletInputs]="{ category: currentCategory }">
   * </ng-container>
   * ```
   *
   * @purpose - Represents the current route value (e.g., 'contact-requests', 'products', 'users').
   * @usage - Not directly used in this component's template yet, but available for future logic.
   * @type {string}
   */
  @Input() category!: string;

  /**
   * @description FormBuilder used to create reactive forms.
   */
  private fb = inject(FormBuilder);

  /**
   * @description Service to manage categories.
   */
  private categoryService = inject(CategoryService);

  /**
   * @description Snackbar for user feedback messages.
   */
  private snackBar = inject(MatSnackBar);

  /**
   * @description ChangeDetectorRef to trigger manual change detection.
   */
  private cdr = inject(ChangeDetectorRef);

  /**
   * @description Main reactive form for creating or editing a category.
   */
  form!: FormGroup;

  /**
   * @description Set of expanded nodes in the category tree.
   */
  expandedNodes = new Set<string>();

  /**
   * @description Array of FormGroup paths for nested children.
   */
  path: FormGroup[] = [];

  /**
   * @description Current parent FormGroup.
   */
  currentParent!: FormGroup;

  /**
   * @description Tracks whether the info section is open.
   */
  infoOpen = false;

  /**
   * @description Indicates whether the form is initializing.
   */
  isInitializing = true;

  /**
   * @description Initial form state used to detect changes.
   */
  private initialFormState: any = null;

  /**
   * @description Indicates if the Reset button should be active.
   */
  isResetButtonActive = false;

  /**
   * @description Subscription to form value changes.
   */
  private valueChangesSubscription: any;

  /**
   * @description Subscription to form status changes.
   */
  private statusChangesSubscription: any;

  /**
   * @description Action buttons available in the form (reset/save).
   */
  formActions: ModalAction[] = [
    { id: 'reset', label: '↺ Reset', type: 'danger-outline', disabled: true },
    { id: 'save', label: '💾 Save', type: 'primary', disabled: true },
  ];

  /**
   * @inheritdoc
   * @description Lifecycle hook OnInit.
   * Creates the form, saves the initial state, and subscribes to changes.
   */
  ngOnInit() {
    this.form = this.createCategoryForm();
    this.currentParent = this.form;
    this.saveInitialState();

    this.valueChangesSubscription = this.form.valueChanges.subscribe(() => {
      this.checkFormChanges();
    });

    this.statusChangesSubscription = this.form.statusChanges.subscribe(() => {
      this.checkFormChanges();
    });

    this.isInitializing = false;
    this.cdr.markForCheck();
  }

  /**
   * @inheritdoc
   * @description Lifecycle hook OnDestroy.
   * Cleans up all form change subscriptions.
   */
  ngOnDestroy() {
    this.valueChangesSubscription?.unsubscribe();
    this.statusChangesSubscription?.unsubscribe();
  }

  /**
   * @description Handles clicks on form action buttons (reset/save).
   * @param actionId ID of the clicked action
   */
  onActionClicked(actionId: string): void {
    if (actionId === 'reset') this.resetForm();
    else if (actionId === 'save') this.submit();
  }

  /**
   * @description Saves the initial state of the form for change tracking.
   */
  private saveInitialState(): void {
    this.initialFormState = JSON.parse(JSON.stringify(this.form.getRawValue()));
  }

  /**
   * @description Checks whether the form has changes compared to the initial state
   * and updates the state of the Reset and Save buttons.
   */
  private checkFormChanges(): void {
    if (!this.initialFormState || !this.form) {
      this.isResetButtonActive = false;
      return;
    }

    const hasChanges = !this.deepCompare(
      this.initialFormState,
      this.form.getRawValue(),
    );

    if (this.isResetButtonActive !== hasChanges) {
      this.isResetButtonActive = hasChanges;
    }

    // Nuovo array → OnPush rileva il cambio di riferimento
    this.formActions = [
      {
        id: 'reset',
        label: '↺ Reset',
        type: 'danger-outline',
        disabled: !this.isResetButtonActive,
      },
      {
        id: 'save',
        label: '💾 Save',
        type: 'primary',
        disabled: !this.form.valid,
      },
    ];

    this.cdr.markForCheck();
  }

  /**
   * @description Deep comparison of two objects based on specific fields.
   * @param obj1 First object
   * @param obj2 Second object
   * @returns true if objects are equal, false otherwise
   */
  private deepCompare(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    if (!obj1 || !obj2) return false;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object')
      return obj1 === obj2;

    const fieldsToCompare = [
      'name',
      'label',
      'icon',
      'link',
      'active',
      'parent',
    ];
    for (const field of fieldsToCompare) {
      if (obj1[field] !== obj2[field]) return false;
    }

    const children1 = obj1.children || [];
    const children2 = obj2.children || [];
    if (children1.length !== children2.length) return false;
    for (let i = 0; i < children1.length; i++) {
      if (!this.deepCompare(children1[i], children2[i])) return false;
    }

    return true;
  }

  /**
   * @description Creates a new reactive form for a category.
   * @returns {FormGroup} The FormGroup representing a category
   */
  createCategoryForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      label: ['', Validators.required],
      icon: ['', Validators.required],
      link: ['', Validators.required],
      active: [true],
      parent: [null],
      children: this.fb.array([]),
    });
  }

  /**
   * @description Creates a new FormGroup for a child category.
   * @returns {FormGroup} FormGroup representing a child category
   */
  createChildForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      label: ['', Validators.required],
      icon: ['', Validators.required],
      link: ['', Validators.required],
      active: [true],
      parent: [null],
      children: this.fb.array([]),
    });
  }

  /**
   * @description Returns the FormArray of children for a given FormGroup.
   * @param formGroup The parent FormGroup
   * @returns {FormArray} Array of child FormGroups
   */
  getChildrenFormArray(formGroup: FormGroup): FormArray {
    return formGroup.get('children') as FormArray;
  }

  /**
   * @description Adds a new child category to a parent FormGroup.
   * @param parentFormGroup The parent FormGroup to add the child to
   */
  addChild(parentFormGroup: FormGroup): void {
    const childrenArray = this.getChildrenFormArray(parentFormGroup);
    const newChild = this.createChildForm();
    newChild.patchValue({
      parent: parentFormGroup.get('name')?.value || 'Root',
    });
    childrenArray.push(newChild);
    this.form.markAsDirty();
    this.checkFormChanges();
  }

  /**
   * @description Removes a child category at a specific index.
   * @param childrenFormArray The FormArray of children
   * @param index Index of the child to remove
   */
  removeChild(childrenFormArray: FormArray, index: number): void {
    childrenFormArray.removeAt(index);
    this.form.markAsDirty();
    this.checkFormChanges();
    showSnackBar(this.snackBar, 'Children removed successfully');
  }

  /**
   * @description Handles changes in a form field and updates button states.
   */
  onFieldChange(): void {
    this.checkFormChanges();
  }

  /**
   * @description Toggles expansion of a category node.
   * @param nodeId The ID of the node to toggle
   */
  toggleNode(nodeId: string): void {
    if (this.expandedNodes.has(nodeId)) this.expandedNodes.delete(nodeId);
    else this.expandedNodes.add(nodeId);
    this.cdr.markForCheck();
  }

  /**
   * @description Handles form submission, validates data and sends it via CategoryService.
   */
  submit(): void {
    if (this.form.valid) {
      const categoryData = this.prepareDataForSubmit(this.form.value);
      this.categoryService.createCategory(categoryData).subscribe({
        next: () => {
          showSnackBar(this.snackBar, 'Category created successfully');
          this.saveInitialState();
          this.isResetButtonActive = false;
          this.formActions = [
            {
              id: 'reset',
              label: '↺ Reset',
              type: 'danger-outline',
              disabled: true,
            },
            {
              id: 'save',
              label: '💾 Save',
              type: 'primary',
              disabled: !this.form.valid,
            },
          ];
          this.cdr.markForCheck();
        },
        error: () => showSnackBar(this.snackBar, 'Error creating category'),
        complete: () => showSnackBar(this.snackBar, 'Request completed'),
      });
    } else {
      this.markFormGroupTouched(this.form);
      showSnackBar(this.snackBar, 'Please fix the errors in the form');
    }
  }

  /**
   * @description Resets the form to its initial state.
   */
  resetForm(): void {
    if (!this.isResetButtonActive) return;

    this.form = this.createCategoryForm();
    this.currentParent = this.form;
    this.expandedNodes.clear();
    this.saveInitialState();
    this.isResetButtonActive = false;
    this.formActions = [
      { id: 'reset', label: '↺ Reset', type: 'danger-outline', disabled: true },
      { id: 'save', label: '💾 Save', type: 'primary', disabled: true },
    ];
    this.cdr.markForCheck();
    showSnackBar(this.snackBar, 'Form reset successfully');
  }

  /**
   * @description Prepares form data recursively for submission, mapping parent/children relationships.
   * @param data Form data
   * @param parent Optional parent information
   * @returns Prepared data object for backend submission
   */
  private prepareDataForSubmit(data: any, parent: any = null): any {
    const prepared = {
      type: data.type,
      active: data.active,
      parent,
      children: [] as any[],
    };
    if (data.children?.length > 0) {
      prepared.children = data.children.map((child: any) =>
        this.prepareDataForSubmit(child, {
          type: data.type,
          active: data.active,
          parent: parent?.parent ?? null,
          children: [],
        }),
      );
    }
    return prepared;
  }

  /**
   * @description Marks all controls in a form group or array as touched.
   * @param formGroup The FormGroup or FormArray to mark
   */
  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * @description Returns the updated breadcrumb array when traversing the form tree.
   * @param currentBreadcrumb Current breadcrumb array
   * @param formGroup FormGroup being traversed
   * @returns {string[]} Updated breadcrumb array
   */
  getUpdatedBreadcrumb(
    currentBreadcrumb: string[],
    formGroup: FormGroup,
  ): string[] {
    return [...currentBreadcrumb, formGroup.get('name')?.value || 'Unknown'];
  }

  /**
   * @description Marks a specific control as touched.
   * @param control The AbstractControl to mark
   */
  markFieldAsTouched(control: AbstractControl | null): void {
    control?.markAsTouched();
  }

  /**
   * @description Toggles the info panel visibility.
   */
  toggleInfo(): void {
    this.infoOpen = !this.infoOpen;
    this.cdr.markForCheck();
  }

  /**
   * @description Returns a human-readable label for a category level.
   * @param level Level of category (0 = root)
   * @returns {string} Label for the level
   */
  getLevelLabel(level: number): string {
    const labels = [
      'Root',
      'Main Category',
      'Sub-category',
      'Sub-sub-category',
    ];
    return labels[level] || `Level ${level}`;
  }

  /**
   * @description Returns the breadcrumb for a child control relative to root.
   * @param childControl AbstractControl of the child
   * @returns {string[]} Array of breadcrumb names
   */
  getRootChildBreadcrumb(childControl: AbstractControl): string[] {
    return [
      this.form.get('name')?.value || 'Root',
      (childControl as FormGroup).get('name')?.value || 'Unknown',
    ];
  }

  /**
   * @description Returns the parent category name.
   * @param parentId The ID of the parent
   * @returns {string} Parent name or 'Root'
   */
  getParentName(parentId: string): string {
    return parentId === 'root'
      ? this.form.get('type')?.value || 'Root'
      : 'Parent Category';
  }

  /**
   * @description Returns the header for children based on level.
   * @param level Depth level of children
   * @returns {string} Header string
   */
  getChildrenHeader(level: number): string {
    return 'Sub-'.repeat(level) + 'children';
  }
}
