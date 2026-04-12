import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * @fileoverview Layout container component for page structure.
 *
 * @description
 * A flexible layout component that serves as a container for page content.
 * Uses Angular Material Sidenav for sidebar navigation and provides a responsive
 * flex-based layout structure. Implements drag prevention for better UX.
 *
 * @category Components
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```html
 * <lib-layout>
 *   <app-header></app-header>
 *   <main>Page content goes here</main>
 *   <app-footer></app-footer>
 * </lib-layout>
 * ```
 *
 * @example
 * ```typescript
 * // Using with sidenav
 * <lib-layout>
 *   <mat-sidenav-container>
 *     <mat-sidenav #sidenav mode="side" opened>
 *       <app-sidebar></app-sidebar>
 *     </mat-sidenav>
 *     <mat-sidenav-content>
 *       <router-outlet></router-outlet>
 *     </mat-sidenav-content>
 *   </mat-sidenav-container>
 * </lib-layout>
 * ```
 */
@Component({
  selector: 'lib-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent implements OnInit {
  /**
   * @inheritdoc
   * @description Lifecycle hook: initializes the component.
   */
  ngOnInit(): void {}

  /**
   *@description Prevents drag events on the layout container.
   * This improves user experience by preventing accidental text or image dragging
   * when interacting with the layout.
   *
   * @param event - The drag event to prevent
   */
  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent) {
    event.preventDefault();
  }
}
