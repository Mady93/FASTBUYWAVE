/**
 * @fileoverview Carousel item interface for footer carousel.
 *
 * @description
 * Defines the structure for items displayed in a carousel component.
 *
 * @category Interfaces
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```typescript
 * const carouselItem: CarouselItem = {
 *   label: 'Summer Sale',
 *   backgroundImage: 'assets/images/summer-sale.jpg'
 * };
 * ```
 */
export interface CarouselItem {
  /** @description Display label for the carousel item */
  label: string;

  /** @description Background image URL for the carousel slide */
  backgroundImage: string;
}
