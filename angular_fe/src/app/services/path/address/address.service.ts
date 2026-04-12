import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddressDTO } from 'src/app/interfaces/dtos/adress_dto.interface';
import { PageResponse } from 'src/app/interfaces/page/page_response.interface';
import { Pageable } from 'src/app/interfaces/page/pageable.interface';
import { ApiConfigService } from '../../api-config/api-config.service';

/**
 * @category Services
 *
 * @description
 * Service responsible for performing CRUD operations on addresses.
 * Provides methods for creating, updating, deleting, retrieving single or multiple addresses,
 * paginated fetching, and counting active/inactive records.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class AddressService {
  /**
   * @description Creates an instance of AddressService.
   *
   * @param {HttpClient} http - Angular HttpClient for making HTTP requests.
   * @param {ApiConfigService} apiConfig - Service that provides API endpoint URLs.
   */
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * @description Creates a new address.
   * @param {AddressDTO} address - The address object to create.
   * @returns {Observable<AddressDTO>} The created address.
   */
  create(address: AddressDTO): Observable<AddressDTO> {
    return this.http.post<AddressDTO>(
      `${this.apiConfig.apiAddress}/create`,
      address,
    );
  }

  /**
   * @description Updates an existing address.
   * @param {AddressDTO} address - The address object with updated data.
   * @returns {Observable<AddressDTO>} The updated address.
   */
  update(address: AddressDTO): Observable<AddressDTO> {
    return this.http.put<AddressDTO>(
      `${this.apiConfig.apiAddress}/update`,
      address,
    );
  }

  /**
   * @description Performs a soft delete of an address by ID.
   * @param {number} id - The ID of the address to delete.
   * @returns {Observable<void>} Observable that completes once deletion is done.
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiConfig.apiAddress}/delete/${id}`);
  }

  /**
   * @description Retrieves an address by its ID.
   * @param {number} id - The ID of the address to retrieve.
   * @returns {Observable<AddressDTO>} The requested address.
   */
  getById(id: number): Observable<AddressDTO> {
    return this.http.get<AddressDTO>(`${this.apiConfig.apiAddress}/get/${id}`);
  }

  /**
   * @description Retrieves all addresses.
   * @returns {Observable<AddressDTO[]>} Array of all addresses.
   */
  getAll(): Observable<AddressDTO[]> {
    return this.http.get<AddressDTO[]>(`${this.apiConfig.apiAddress}/get/all`);
  }

  /**
   * @description Retrieves all active addresses.
   * @returns {Observable<AddressDTO[]>} Array of active addresses.
   */
  getAllActive(): Observable<AddressDTO[]> {
    return this.http.get<AddressDTO[]>(
      `${this.apiConfig.apiAddress}/get/all/active`,
    );
  }

  /**
   * @description Retrieves all inactive addresses.
   * @returns {Observable<AddressDTO[]>} Array of inactive addresses.
   */
  getAllInactive(): Observable<AddressDTO[]> {
    return this.http.get<AddressDTO[]>(
      `${this.apiConfig.apiAddress}/get/all/inactive`,
    );
  }

  /**
   * @description Retrieves active addresses with pagination.
   * @param {Pageable} pageable - Pagination and sorting information.
   * @returns {Observable<PageResponse<AddressDTO>>} Paginated response of active addresses.
   */
  getActivePaginated(pageable: Pageable): Observable<PageResponse<AddressDTO>> {
    const params = new HttpParams()
      .set('page', pageable.page.toString())
      .set('size', pageable.size.toString())
      .set('sort', pageable.sort || '');
    return this.http.get<PageResponse<AddressDTO>>(
      `${this.apiConfig.apiAddress}/get/all/active/paginated`,
      { params },
    );
  }

  /**
   * @description Retrieves inactive addresses with pagination.
   * @param {Pageable} pageable - Pagination and sorting information.
   * @returns {Observable<PageResponse<AddressDTO>>} Paginated response of inactive addresses.
   */
  getInactivePaginated(
    pageable: Pageable,
  ): Observable<PageResponse<AddressDTO>> {
    const params = new HttpParams()
      .set('page', pageable.page.toString())
      .set('size', pageable.size.toString())
      .set('sort', pageable.sort || '');
    return this.http.get<PageResponse<AddressDTO>>(
      `${this.apiConfig.apiAddress}/get/all/inactive/paginated`,
      { params },
    );
  }

  /**
   * @description Counts the total number of active addresses.
   * @returns {Observable<number>} The count of active addresses.
   */
  countActive(): Observable<number> {
    return this.http.get<number>(`${this.apiConfig.apiAddress}/count/active`);
  }

  /**
   * @description Counts the total number of inactive addresses.
   * @returns {Observable<number>} The count of inactive addresses.
   */
  countInactive(): Observable<number> {
    return this.http.get<number>(`${this.apiConfig.apiAddress}/count/inactive`);
  }
}
