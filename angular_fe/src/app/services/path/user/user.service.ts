import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDTO } from 'src/app/interfaces/dtos/user_dto.interface';
import { PageResponse } from 'src/app/interfaces/page/page_response.interface';
import { Pageable } from 'src/app/interfaces/page/pageable.interface';
import { ApiConfigService } from '../../api-config/api-config.service';

/**
 * @category Services
 *
 * @description
 * Handles CRUD operations for users, including retrieval of active and deleted users,
 * paginated queries, and bulk actions like reactivation or deletion.
 *
 * @example
 * ```typescript
 * constructor(private userService: UserService) {}
 *
 * // Get user by email
 * this.userService.getUserByEmail('test@example.com').subscribe(user => console.log(user));
 *
 * // Get paginated active users
 * this.userService.getUsers({ page: 0, size: 10 }).subscribe(page => console.log(page));
 *
 * // Delete a user
 * this.userService.deleteUser(123).subscribe(() => console.log('User deleted'));
 * ```
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  /**
   * @description Initializes UserService.
   *
   * @param http Angular HttpClient for performing HTTP requests
   * @param apiConfig Service providing API endpoints
   */
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * @description Retrieves a user by email.
   *
   * @param email Email of the user
   * @returns Observable emitting the UserDTO
   */
  getUserByEmail(email: string): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiConfig.apiUser}/email`, {
      params: new HttpParams().set('email', email),
    });
  }

  /**
   * @description Returns the total number of active users.
   *
   * @returns Observable emitting the count of active users
   */
  countUsers(): Observable<number> {
    return this.http.get<number>(`${this.apiConfig.apiUser}/count`);
  }

  /**
   * @description Retrieves a paginated list of active users.
   *
   * @param pageable Pageable object containing page, size, and optional sort
   * @returns Observable emitting a PageResponse of UserDTO
   */
  getUsers(pageable: Pageable): Observable<PageResponse<UserDTO>> {
    const params = new HttpParams()
      .set('page', pageable.page)
      .set('size', pageable.size)
      .set('sort', pageable.sort || '');

    return this.http.get<PageResponse<UserDTO>>(
      `${this.apiConfig.apiUser}/all`,
      { params },
    );
  }

  /**
   * @description Returns the total number of deleted users.
   *
   * @returns Observable emitting the count of deleted users
   */
  countDeletedUsers(): Observable<number> {
    return this.http.get<number>(`${this.apiConfig.apiUser}/count-deleted`);
  }

  /**
   * @description Retrieves a paginated list of deleted users.
   *
   * @param pageable Pageable object containing page, size, and optional sort
   * @returns Observable emitting a PageResponse of UserDTO
   */
  getDeletedUsers(pageable: Pageable): Observable<PageResponse<UserDTO>> {
    const params = new HttpParams()
      .set('page', pageable.page)
      .set('size', pageable.size)
      .set('sort', pageable.sort || '');

    return this.http.get<PageResponse<UserDTO>>(
      `${this.apiConfig.apiUser}/deleted`,
      { params },
    );
  }

  /**
   * @description Retrieves a user by their ID.
   *
   * @param userId ID of the user
   * @returns Observable emitting the UserDTO
   */
  getUserById(userId: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiConfig.apiUser}/get/${userId}`);
  }

  /**
   * @description Updates an existing user.
   *
   * @param userId ID of the user to update
   * @param user Updated user data
   * @returns Observable emitting the updated UserDTO
   */
  updateUser(userId: number, user: UserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(
      `${this.apiConfig.apiUser}/update/${userId}`,
      user,
    );
  }

  /**
   * @description Deletes a user by ID.
   *
   * @param userId ID of the user to delete
   * @returns Observable emitting the result
   */
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiConfig.apiUser}/delete/${userId}`);
  }

  /**
   * @description Deletes all users except ADMIN.
   *
   * @returns Observable emitting void
   */
  deleteAllUsers(): Observable<void> {
    return this.http.delete<void>(`${this.apiConfig.apiUser}/delete/all`);
  }

  /**
   * @description Reactivates all users (bulk action).
   *
   * @returns Observable emitting the result
   */
  reactivateAllUsers(): Observable<any> {
    return this.http.put(`${this.apiConfig.apiUser}/reactivate/all`, {});
  }

  /**
   * @description Retrieves all active users (non-paginated).
   *
   * @returns Observable emitting an array of UserDTO
   */
  getAllActiveUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiConfig.apiUser}/list/active`);
  }
}
