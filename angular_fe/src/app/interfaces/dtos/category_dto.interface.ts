/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) for product categories.
 * Represents a category including hierarchy (parent/children), display information, 
 * activation status, and navigation link.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface CategoryDTO
 * @property {number} [categoryId] - Optional unique identifier of the category.
 * @property {string} label - Display label of the category.
 * @property {string} icon - Icon associated with the category.
 * @property {boolean} active - Indicates whether the category is active.
 * @property {string} link - Navigation link or URL for the category.
 * @property {string} name - Internal name of the category.
 * @property {CategoryDTO | null} [parent] - Optional parent category; null if top-level.
 * @property {CategoryDTO[]} [children] - Optional list of child categories.
 */
export interface CategoryDTO {
    categoryId?: number;
    label: string;
    icon: string;
    active: boolean;
    link: string;
    name: string;
    parent?: CategoryDTO | null; // opzionale per evitare errori se è null
    children?: CategoryDTO[]; // opzionale se non sempre presente
  }
  