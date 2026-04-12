import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponseData } from 'src/app/interfaces/dettails/api_response_data';
import { LikeRequestDTO } from 'src/app/interfaces/dtos/like_request_dto';
import { LikeStatusDto } from 'src/app/interfaces/dtos/like_status_dto.interface';
import { ApiConfigService } from '../../api-config/api-config.service';
import { LikeUserDTO } from 'src/app/interfaces/dtos/like-user.dto';

/**
 * @category Services
 *
 * @description
 * Provides methods to update likes, fetch likes by user, and retrieve likes for a specific advertisement.
 * Handles HTTP communication with the backend API.
 *
 * @example
 * ```typescript
 * constructor(private likesService: AdvertisementLikesService) {}
 *
 * // Update a like for an advertisement
 * this.likesService.updateLike(123, 456, { liked: true }).subscribe(response => console.log(response));
 *
 * // Get all likes by a user
 * this.likesService.getAllLikesByUser(123).subscribe(likes => console.log(likes));
 *
 * // Get all users who liked a specific advertisement
 * this.likesService.getLikesByAdvertisement(456).subscribe(users => console.log(users));
 * ```
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class AdvertisementLikesService {
  /**
   * @constructor
   * @description Initializes AdvertisementLikesService with required dependencies.
   *
   * @param {HttpClient} http - Angular HttpClient for making API requests
   * @param {ApiConfigService} apiConfig - Service providing API base URLs and configuration
   */
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * @description Creates or updates a like for a specific advertisement by a user.
   *
   * @param {number} userId - ID of the user performing the like action
   * @param {number} advertisementId - ID of the advertisement to like/unlike
   * @param {LikeRequestDTO} likeRequest - Payload containing the like status
   * @returns {Observable<ApiResponseData<number>>} Observable containing the number of likes for the advertisement
   */
  updateLike(
    userId: number,
    advertisementId: number,
    likeRequest: LikeRequestDTO,
  ): Observable<ApiResponseData<number>> {
    const url = `${this.apiConfig.apiLikes}/create/update/${userId}/${advertisementId}`;
    return this.http.put<ApiResponseData<number>>(url, likeRequest);
  }

  /**
   * @description Retrieves all like statuses for a specific user.
   *
   * @param {number} userId - ID of the user
   * @returns {Observable<ApiResponseData<LikeStatusDto[]>>} Observable array of like statuses
   */
  getAllLikesByUser(
    userId: number,
  ): Observable<ApiResponseData<LikeStatusDto[]>> {
    const url = `${this.apiConfig.apiLikes}/likes/user`;
    return this.http.get<ApiResponseData<LikeStatusDto[]>>(url, {
      params: { userId: String(userId) },
    });
  }

  /**
   * @description Retrieves all users who liked a specific advertisement.
   *
   * @param {number} advertisementId - ID of the advertisement
   * @returns {Observable<ApiResponseData<LikeUserDTO[]>>} Observable array of users who liked the advertisement
   */
  getLikesByAdvertisement(
    advertisementId: number,
  ): Observable<ApiResponseData<LikeUserDTO[]>> {
    const url = `${this.apiConfig.apiLikes}/advertisement/${advertisementId}`;
    return this.http.get<ApiResponseData<LikeUserDTO[]>>(url);
  }
}
