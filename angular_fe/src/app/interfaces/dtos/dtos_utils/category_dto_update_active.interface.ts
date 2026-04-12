/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) for updating the active status of a category.
 * Allows enabling or disabling a category in the system by specifying its ID and new active state.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface CategoryDTOUpdateActive
 * @property {number} categoryId - Unique identifier of the category to be updated.
 * @property {boolean} active - New active status of the category (true for active, false for inactive).
 */
export interface CategoryDTOUpdateActive {
    categoryId: number;
    active: boolean;
  }
  