import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ModalAction } from '../../../interfaces/modal/modal_action.interface';

/**
 * @fileoverview Modal dialog component with animations and flexible layout.
 *
 * @description
 * A fully customizable modal dialog component with:
 * - Smooth enter/exit animations
 * - Backdrop with optional transparency
 * - Header with title, subtitle, and icon
 * - Scrollable body content
 * - Action buttons in footer with loading states
 * - Responsive design (full-screen on mobile)
 *
 * @implements {OnChanges}
 *
 * @category Components
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```html
 * <lib-modal
 *   [isOpen]="isModalOpen"
 *   [title]="'Confirm Action'"
 *   [subtitle]="'This action cannot be undone'"
 *   [icon]="'warning'"
 *   [actions]="modalActions"
 *   (close)="closeModal()"
 *   (actionClicked)="handleAction($event)"
 * >
 *   <p>Are you sure you want to proceed?</p>
 * </lib-modal>
 * ```
 *
 * @example
 * ```typescript
 * // In your component
 * modalActions: ModalAction[] = [
 *   { id: 'cancel', label: 'Cancel', type: 'secondary' },
 *   { id: 'confirm', label: 'Confirm', type: 'primary' }
 * ];
 * ```
 */
@Component({
  selector: 'lib-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('backdropAnim', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('220ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('180ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('modalAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.93) translateY(14px)' }),
        animate(
          '280ms cubic-bezier(0.34,1.56,0.64,1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' }),
        ),
      ]),
      transition(':leave', [
        animate(
          '180ms ease-in',
          style({ opacity: 0, transform: 'scale(0.95) translateY(8px)' }),
        ),
      ]),
    ]),
  ],
})
export class ModalComponent implements OnChanges {
  /** @description Change detector reference for manual change detection */
  private cdr: ChangeDetectorRef;

  /** @description Controls modal visibility (open/close) */
  @Input() isOpen = false;

  /**
   * @description Whether the backdrop is transparent.
   * Useful for secondary modals or when backdrop should be invisible.
   */
  @Input() transparentBackdrop = false;

  /** @description Title displayed in the modal header */
  @Input() title = '';

  /** @description Optional subtitle displayed below the title */
  @Input() subtitle = '';

  /** @description Material icon name to display in the header (e.g., 'send', 'shopping_cart') */
  @Input() icon = '';

  /** @description Whether to show the close (x) button in the header */
  @Input() showClose = true;

  /** @description Whether clicking on the backdrop closes the modal */
  @Input() closeOnBackdrop = true;

  /** @description Maximum width of the modal panel (CSS value) */
  @Input() maxWidth = '580px';

  /** @description Maximum height of the scrollable body (CSS value) */
  @Input() maxHeight = '90vh';

  /**
   * @description Action buttons displayed in the footer.
   * If empty array, the footer is not rendered.
   */
  @Input() actions: ModalAction[] = [];

  /** @description Emitted when modal is closed (x button or backdrop click) */
  @Output() close = new EventEmitter<void>();

  /** @description Emitted when an action button is clicked — emits the action ID */
  @Output() actionClicked = new EventEmitter<string>();

  constructor(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  /**
   * @description Handles click on the backdrop overlay.
   * Emits close event only if `closeOnBackdrop` is true.
   */
  onBackdropClick(): void {
    if (this.closeOnBackdrop) this.close.emit();
  }

  /**
   * @inheritdoc
   * @description Lifecycle hook: triggers change detection when inputs change.
   */
  ngOnChanges(): void {
    this.cdr.markForCheck();
  }
}
