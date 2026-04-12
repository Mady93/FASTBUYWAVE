import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CarouselItem } from '../../../interfaces/carousel_item.interface';
import { FooterLink } from '../../../interfaces/footer_link.interface';
import { FooterPaymentMethod } from '../../../interfaces/footer_payment_method.interface';
import { RouterLink } from '@angular/router';

/**
 * @fileoverview Footer component with navigation links and payment methods.
 *
 * @description
 * A reusable footer component that displays:
 * - Navigation links with router integration
 * - Payment method icons and links
 * - Responsive design for mobile and desktop
 * - Hover effects with metallic gradient underline
 *
 * @category Components
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```html
 * <lib-footer
 *   [footerLinkItems]="footerLinks"
 *   [footerPaymentMethodItems]="paymentMethods"
 * ></lib-footer>
 * ```
 *
 * @example
 * ```typescript
 * // In your component
 * footerLinks: FooterLink[] = [
 *   { label: 'Home', path: '/' },
 *   { label: 'About', path: '/about' },
 * ];
 *
 * paymentMethods: FooterPaymentMethod[] = [
 *   { name: 'Visa', icon: 'fa-cc-visa', url: 'https://visa.com' },
 *   { name: 'PayPal', icon: 'fa-cc-paypal', url: 'https://paypal.com' }
 * ];
 * ```
 */
@Component({
  selector: 'lib-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  /**
   * @description Carousel items to display in footer (optional).
   * Currently not used in template.
   */
  @Input() carouselItems: CarouselItem[] = [];

  /**
   * @description Navigation links for the footer.
   * Each link has a label and router path.
   */
  @Input() footerLinkItems: FooterLink[] = [];

  /**
   * @description Payment method icons and links.
   * Displays payment method names with FontAwesome icons.
   */
  @Input() footerPaymentMethodItems: FooterPaymentMethod[] = [];
  //@Input() logo: Function = () => {};
}
