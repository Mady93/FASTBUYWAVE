import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * @category Components
 *
 * @fileoverview Root application component that serves as the entry point and bootstrap
 * component for the Angular application. It provides the main layout structure and
 * hosts the router outlet for navigation.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @description
 * The root component bootstrapped in main.ts. It acts as a shell that contains
 * only the `<router-outlet>`, which dynamically renders components based on
 * the active route. Uses OnPush change detection strategy for performance.
 *
 * @example
 * ```html
 * <!-- Template (app.component.html) -->
 * <router-outlet></router-outlet>
 * ```
 *
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title: string = 'angular_fe';
}
