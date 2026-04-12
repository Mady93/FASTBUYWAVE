import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from 'src/app/interfaces/dettails/api_response';
import { AddressDTO } from 'src/app/interfaces/dtos/adress_dto.interface';
import { AdvertisementDTO } from 'src/app/interfaces/dtos/advertisement_dto.interface';
import { CategoryDTO } from 'src/app/interfaces/dtos/category_dto.interface';
import { ProductDTO } from 'src/app/interfaces/dtos/product_dto.interface';
import { ApiConfigService } from '../../api-config/api-config.service';

/**
 * @category Services
 *
 * @description
 * Service responsible for managing advertisements.
 * Provides methods to create new advertisements (with multipart/form-data),
 * including associated product, address, category, images, and user information,
 * as well as renewing existing advertisements.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class AdvetisementService {
  /**
   * @description Creates an instance of AdvetisementService.
   *
   * @param {HttpClient} http - Angular HttpClient for making HTTP requests.
   * @param {ApiConfigService} apiConfig - Service providing API endpoint URLs.
   */
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * @description Creates a new advertisement with associated product, address, category, images, and user ID.
   * Sends data as multipart/form-data with JSON blobs for structured data and files for images.
   *
   * @param {AdvertisementDTO} advertisement - Advertisement metadata.
   * @param {ProductDTO} product - Product details associated with the advertisement.
   * @param {AddressDTO} address - Address details for the advertisement.
   * @param {CategoryDTO} category - Optional category associated with the advertisement.
   * @param {File[]} images - Array of image files to upload with the advertisement.
   * @param {number} userId - ID of the user creating the advertisement.
   * @returns {Observable<ApiResponse>} Observable emitting the API response with status and messages.
   */
  createAdvertisement(
    advertisement: AdvertisementDTO,
    product: ProductDTO,
    address: AddressDTO,
    category: CategoryDTO,
    images: File[],
    userId: number,
  ): Observable<ApiResponse> {
    const formData = new FormData();
    formData.append(
      'advertisement',
      new Blob([JSON.stringify(advertisement)], { type: 'application/json' }),
    );
    formData.append(
      'product',
      new Blob([JSON.stringify(product)], { type: 'application/json' }),
    );
    formData.append(
      'address',
      new Blob([JSON.stringify(address)], { type: 'application/json' }),
    );

    if (category && category !== undefined) {
      formData.append(
        'category',
        new Blob([JSON.stringify(category)], { type: 'application/json' }),
      );
    }

    images.forEach((file) => formData.append('images', file, file.name));

    let params = new HttpParams().set('userId', userId.toString());

    return this.http.post<ApiResponse>(
      `${this.apiConfig.apiAdvertisements}/create`,
      formData,
      { params },
    );
  }

  /**
   * @description Renews an existing advertisement.
   *
   * @param {AdvertisementDTO} advertisement - Advertisement object to renew.
   * @returns {Observable<AdvertisementDTO>} Observable emitting the updated advertisement.
   */
  renewAdvertisement(
    advertisement: AdvertisementDTO,
  ): Observable<AdvertisementDTO> {
    return this.http.put<AdvertisementDTO>(
      `${this.apiConfig.apiAdvertisements}/renew`,
      advertisement,
    );
  }
}
