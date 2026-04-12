import { Injectable } from '@angular/core';
import { CategoryDTO } from 'src/app/interfaces/dtos/category_dto.interface';

/**
 * @category Utils
 *
 * @description
 * Service providing utility methods to sort data structures used in the application.
 * Currently, it implements alphabetical sorting for categories, supporting nested
 * children categories recursively. Useful for dashboard displays and admin category lists.
 *
 * @example
 * ```typescript
 * constructor(private sortService: SortService) {}
 *
 * const sortedCategories = this.sortService.sortCategoriesAlphabetically(categories);
 * console.log(sortedCategories);
 * ```
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class SortService {
  /**
   * Creates an instance of SortService.
   *
   * @description
   * No initialization is required for this service. The constructor is provided
   * to allow Angular dependency injection and maintain consistency in service setup.
   */
  constructor() {}

  /**
   * Sorts an array of categories alphabetically by their `label` property.
   *
   * @description
   * This method creates a shallow copy of the input array to avoid mutating the original.
   * Sorting is applied recursively to any children categories, ensuring that nested structures
   * are also sorted alphabetically.
   *
   * @param {CategoryDTO[]} categories - Array of categories to be sorted.
   * @returns {CategoryDTO[]} A new array of categories sorted alphabetically, with
   *                          children arrays also sorted recursively.
   *
   * @example
   * ```typescript
   * const categories: CategoryDTO[] = [
   *   { label: 'Books', children: [] },
   *   { label: 'Art', children: [] }
   * ];
   *
   * const sorted = sortService.sortCategoriesAlphabetically(categories);
   * console.log(sorted);
   * // Output: [{ label: 'Art', ...}, { label: 'Books', ...}]
   * ```
   */
  sortCategoriesAlphabetically(categories: CategoryDTO[]): CategoryDTO[] {
    return categories
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((cat) => ({
        ...cat,
        children:
          cat.children && cat.children.length > 0
            ? this.sortCategoriesAlphabetically([...cat.children])
            : [],
      }));
  }
}
