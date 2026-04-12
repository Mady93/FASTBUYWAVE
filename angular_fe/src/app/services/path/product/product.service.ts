import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductSearchCriteriaDTO } from 'src/app/interfaces/dtos/criteria_dto/product_search_criteria_dto.interface';
import { ProductDTO } from 'src/app/interfaces/dtos/product_dto.interface';
import { ApiConfigService } from '../../api-config/api-config.service';

/**
 * @category Services
 *
 * @description
 * Service responsible for managing product-related operations.
 * Provides methods to fetch active products for a user and search
 * products by criteria. Handles HTTP communication with the backend API.
 *
 * @example
 * ```typescript
 * constructor(private productService: ProductService) {}
 *
 * // Fetch active products for a user
 * this.productService.getActiveProductsByUserId(123).subscribe(products => {
 *   console.log(products);
 * });
 *
 * // Search products not deleted by criteria
 * const criteria: ProductSearchCriteriaDTO = { type: 'electronics', page: 1, size: 20 };
 * this.productService.getProductsNotDeletedByType(criteria).subscribe(results => {
 *   console.log(results);
 * });
 * ```
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  /**
   * @constructor
   * @description Initializes the ProductService with HttpClient and ApiConfigService dependencies.
   *
   * @param {HttpClient} http - Angular HttpClient for making HTTP requests
   * @param {ApiConfigService} apiConfig - Service providing API endpoint URLs
   */
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * @description Fetches all active products for a specific user.
   * Includes images, related advertisements, and relations due to bidirectional associations.
   *
   * @param {number} userId - ID of the user
   * @returns {Observable<ProductDTO[]>} Observable emitting an array of active products
   */
  getActiveProductsByUserId(userId: number): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(
      `${this.apiConfig.apiProducts}/getProduct/active/${userId}`,
    );
  }

  /**
   * @description Fetches products that are not deleted filtered by criteria.
   * Supports complex search queries via the ProductSearchCriteriaDTO.
   *
   * @param {ProductSearchCriteriaDTO} criteria - Criteria for searching products
   * @returns {Observable<ProductDTO[]>} Observable emitting an array of products matching the criteria
   */
  getProductsNotDeletedByType(
    criteria: ProductSearchCriteriaDTO,
  ): Observable<ProductDTO[]> {
    return this.http.post<ProductDTO[]>(
      `${this.apiConfig.apiProducts}/list/not/delete`,
      criteria,
    );
  }
}
