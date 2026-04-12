import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CategoryDTO } from 'src/app/interfaces/dtos/category_dto.interface';
import { PageResponse } from 'src/app/interfaces/page/page_response.interface';
import { Pageable } from 'src/app/interfaces/page/pageable.interface';
import { ApiConfigService } from '../../api-config/api-config.service';

/**
 * @category Services
 *
 * @description
 * Service responsible for managing categories within the application.
 * Provides methods to:
 * - Create, update, and delete categories (soft delete and full deletion)
 * - Activate or deactivate categories (individually or all at once)
 * - Retrieve categories by ID, type, path, or link
 * - Retrieve all active categories with optional pagination
 * - Notify subscribers of category updates
 *
 * Uses Angular HttpClient to communicate with the backend APIs defined in ApiConfigService.
 * Provides an observable stream to allow components to react to category updates.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  /**
   * @constructor
   * @param http - Angular HttpClient used for backend requests.
   * @param apiConfig - Service providing API endpoints configuration.
   */
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * @description Subject used to emit notifications when categories are updated.
   */
  private categoriesUpdatedSource = new BehaviorSubject<void>(undefined);

  /**
   * @description Observable stream that emits whenever categories are updated.
   */
  public categoriesUpdated$ = this.categoriesUpdatedSource.asObservable();

  /**
   * @description Notify subscribers that categories have been updated.
   */
  notifyCategoriesUpdate(): void {
    this.categoriesUpdatedSource.next(undefined);
  }

  /**
   * @description Create a new category.
   * @param category - Category data to create.
   * @returns Observable<CategoryDTO> emitting the created category.
   */
  createCategory(category: CategoryDTO): Observable<CategoryDTO> {
    return this.http.post<CategoryDTO>(
      `${this.apiConfig.apiCategory}/create`,
      category,
    );
  }

  /**
   * @description Get a category by its unique ID.
   * @param id - ID of the category to retrieve.
   * @returns Observable<CategoryDTO> emitting the requested category.
   */
  getCategoryById(id: number): Observable<CategoryDTO> {
    return this.http.get<CategoryDTO>(
      `${this.apiConfig.apiCategory}/get/${id}`,
    );
  }

  /**
   * @description Get a category by its type string.
   * @param type - Type of the category.
   * @returns Observable<CategoryDTO> emitting the requested category.
   */
  getCategoryByType(type: string): Observable<CategoryDTO> {
    return this.http.get<CategoryDTO>(
      `${this.apiConfig.apiCategory}/get/type/${type}`,
    );
  }

  /**
   * @description Check if a category exists by its type.
   * @param type - Type string to check.
   * @returns Observable<boolean> emitting true if the category exists, false otherwise.
   */
  existsByType(type: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiConfig.apiCategory}/exists/type/${type}`,
    );
  }

  /**
   * @description Get all active categories.
   * @returns Observable<CategoryDTO[]> emitting all active categories.
   */
  getAllActiveCategories(): Observable<CategoryDTO[]> {
    return this.http.get<CategoryDTO[]>(
      `${this.apiConfig.apiCategory}/get/active`,
    );
  }

  /**
   * @description Get active categories with pagination.
   * @param pageable - Pagination and sorting configuration.
   * @returns Observable<PageResponse<CategoryDTO>> emitting paginated active categories.
   */
  getActiveCategoriesPaginated(
    pageable: Pageable,
  ): Observable<PageResponse<CategoryDTO>> {
    const params = new HttpParams()
      .set('page', pageable.page.toString())
      .set('size', pageable.size.toString())
      .set('sort', pageable.sort || 'categoryId,asc');

    return this.http.get<PageResponse<CategoryDTO>>(
      `${this.apiConfig.apiCategory}/active/paginated`,
      { params },
    );
  }

  /**
   * @description Get not active categories with pagination.
   * @param pageable - Pagination and sorting configuration.
   * @returns Observable<PageResponse<CategoryDTO>> emitting paginated inactive categories.
   */
  getNotActiveCategoriesPaginated(
    pageable: Pageable,
  ): Observable<PageResponse<CategoryDTO>> {
    const params = new HttpParams()
      .set('page', pageable.page.toString())
      .set('size', pageable.size.toString())
      .set('sort', pageable.sort || 'categoryId,asc');

    return this.http.get<PageResponse<CategoryDTO>>(
      `${this.apiConfig.apiCategory}/not/active/paginated`,
      { params },
    );
  }

  /**
   * @description Update a category.
   * @param category - Category data to update.
   * @returns Observable<CategoryDTO> emitting the updated category.
   */
  updateCategory(category: CategoryDTO): Observable<CategoryDTO> {
    return this.http.put<CategoryDTO>(
      `${this.apiConfig.apiCategory}/update`,
      category,
    );
  }

  /**
   * @description Soft delete a category by ID.
   * @param id - ID of the category to delete.
   * @returns Observable<void>
   */
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiConfig.apiCategory}/delete/${id}`);
  }

  /**
   * @description Soft delete a child category by its parent category ID.
   * @param categoryId - Parent category ID.
   * @param childCategoryId - Child category ID to delete.
   * @returns Observable<void>
   */
  deleteChildByCategoryId(
    categoryId: number,
    childCategoryId: number,
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiConfig.apiCategory}/delete/${categoryId}/child/${childCategoryId}`,
    );
  }

  /**
   * @deprecated
   * @description This method permanently deletes all categories from the database and should not be used.
   * Use individual deletion methods instead.
   *
   * @returns Observable<void>
   */
  deleteAllCategories(): Observable<void> {
    return this.http.delete<void>(`${this.apiConfig.apiCategory}/delete/all`);
  }

  /**
   * @description Activate all categories.
   * @returns Observable<CategoryDTO[]> emitting all activated categories.
   */
  activateAllCategories(): Observable<CategoryDTO[]> {
    return this.http.put<CategoryDTO[]>(
      `${this.apiConfig.apiCategory}/activate/all`,
      {},
    );
  }

  /**
   * @description Deactivate all categories.
   * @returns Observable<CategoryDTO[]> emitting all deactivated categories.
   */
  deactivateAllCategories(): Observable<CategoryDTO[]> {
    return this.http.put<CategoryDTO[]>(
      `${this.apiConfig.apiCategory}/deactivate/all`,
      {},
    );
  }

  /**
   * @description Get a category by its path string.
   * @param path - Path string identifying the category.
   * @returns Observable<CategoryDTO> emitting the requested category.
   */
  getCategoryByPath(path: string): Observable<CategoryDTO> {
    return this.http.get<CategoryDTO>(
      `${this.apiConfig.apiCategory}/get/path`,
      {
        params: { path },
      },
    );
  }

  /**
   * @description Get a category by its link string.
   * @param link - Link string identifying the category.
   * @returns Observable<CategoryDTO> emitting the requested category.
   */
  getCategoryByLink(link: string): Observable<CategoryDTO> {
    return this.http.get<CategoryDTO>(
      `${this.apiConfig.apiCategory}/get/link`,
      {
        params: { link },
      },
    );
  }
}
