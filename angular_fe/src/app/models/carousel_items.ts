import { CarouselItem } from 'my-lib-inside';

/**
 * @category Models
 * 
 * @fileoverview Class representing a collection of carousel items for a UI carousel component.
 * Each item contains a label and a background image URL. Provides a method to retrieve
 * the list of items for display in a carousel.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export class CarouselItems {
  
   /**
   * @description Array of carousel items to display in the UI.
   * Each item contains:
   * - label: string representing the item's label (can be empty)
   * - backgroundImage: URL or path to the item's background image
   */
  carouselItems: CarouselItem[] = [
    {
      label: '',
      backgroundImage: '/c1.webp',
    },
    {
      label: '',
      backgroundImage: '/c2.jpeg',
    },
    {
      label: '',
      backgroundImage: '/c3.jpeg',
    },
    {
      label: '',
      backgroundImage: '/c4.jpg',
    },
    {
      label: '',
      backgroundImage: '/c5.jpeg',
    },
    {
      label: '',
      backgroundImage: '/c6.webp',
    },
    {
      label: '',
      backgroundImage: '/c7.jpg',
    },
    {
      label: '',
      backgroundImage: '/c8.jpg',
    },
    {
      label: '',
      backgroundImage: '/c9.webp',
    },
    {
      label: '',
      backgroundImage: '/c10.webp',
    },
  ];

  /**
   * @description Returns the array of carousel items.
   *
   * @returns {CarouselItem[]} Array of CarouselItem objects for the carousel.
   */
  getCarouselItems(): CarouselItem[] {
    return this.carouselItems;
  }
}
