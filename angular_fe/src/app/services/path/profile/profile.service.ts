import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AddressDTO } from 'src/app/interfaces/dtos/adress_dto.interface';
import { ProfileDTO } from 'src/app/interfaces/dtos/profile_dto.interface';
import { PageResponse } from 'src/app/interfaces/page/page_response.interface';
import { ApiConfigService } from '../../api-config/api-config.service';

/**
 * @category Services
 *
 * @description
 * Service responsible for managing user profiles. Supports CRUD operations,
 * file uploads via multipart/form-data, paginated queries, and notifications
 * when profiles are updated.
 *
 * @example
 * ```typescript
 * constructor(private profileService: ProfileService) {}
 *
 * // Create a profile
 * this.profileService.createProfile(profile, address, userId, file).subscribe();
 *
 * // Subscribe to profile updates
 * this.profileService.profileUpdated$.subscribe(updatedProfile => console.log(updatedProfile));
 * ```
 *
 * @author Popa Madalina
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  /**
   * @constructor
   * @description Initializes ProfileService with HttpClient and ApiConfigService.
   *
   * @param {HttpClient} http - Angular HttpClient for performing HTTP requests
   * @param {ApiConfigService} apiConfig - Service providing API endpoint URLs
   */
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /** @description Subject to notify subscribers when a profile is updated */
  private profileUpdatedSubject = new BehaviorSubject<ProfileDTO | null>(null);

  /** @description Observable for profile updates */
  public profileUpdated$ = this.profileUpdatedSubject.asObservable();

  /**
   * @description Creates a new profile with associated address and optional profile picture.
   *
   * @param profile Profile data to create
   * @param address Address data associated with the profile
   * @param userId ID of the user owning the profile
   * @param profilePicture Optional profile picture file
   * @returns Observable emitting the created ProfileDTO
   *
   * @example
   * ```typescript
   * this.profileService.createProfile(profile, address, 123, file).subscribe({
   *   next: profile => console.log('Profile created:', profile)
   * });
   * ```
   */
  createProfile(
    profile: ProfileDTO,
    address: AddressDTO,
    userId: number,
    profilePicture: File,
  ): Observable<ProfileDTO> {
    const formData = new FormData();

    formData.append(
      'profile',
      new Blob([JSON.stringify(profile)], { type: 'application/json' }),
    );
    formData.append(
      'address',
      new Blob([JSON.stringify(address)], { type: 'application/json' }),
    );

    if (profilePicture) {
      formData.append('profilePicture', profilePicture, profilePicture.name);
    }

    const params = new HttpParams().set('userId', userId.toString());

    return this.http.post<ProfileDTO>(
      `${this.apiConfig.apiProfile}/create`,
      formData,
      { params },
    );
  }

  /**
   * @description Updates an existing profile.
   *
   * @param userId ID of the user owning the profile
   * @param profile Updated profile data
   * @param address Updated address data
   * @param profilePicture Optional new profile picture
   * @returns Observable emitting the updated ProfileDTO
   *
   * @example
   * ```typescript
   * this.profileService.updateProfile(123, profile, address, file).subscribe({
   *   next: profile => console.log('Profile updated:', profile)
   * });
   * ```
   */
  updateProfile(
    userId: number,
    profile: ProfileDTO,
    address: AddressDTO,
    profilePicture: File,
  ): Observable<ProfileDTO> {
    const formData = new FormData();

    formData.append(
      'profile',
      new Blob([JSON.stringify(profile)], { type: 'application/json' }),
    );
    formData.append(
      'address',
      new Blob([JSON.stringify(address)], { type: 'application/json' }),
    );

    if (profilePicture) {
      formData.append('profilePicture', profilePicture, profilePicture.name);
    }

    const params = new HttpParams().set('userId', userId.toString());

    return this.http.put<ProfileDTO>(
      `${this.apiConfig.apiProfile}/update`,
      formData,
      { params },
    );
  }

  /**
   * @description Retrieves a profile by its profile ID.
   *
   * @param profileId ID of the profile to fetch
   * @returns Observable emitting the ProfileDTO
   */
  getProfileById(profileId: number): Observable<ProfileDTO> {
    return this.http.get<ProfileDTO>(
      `${this.apiConfig.apiProfile}/${profileId}`,
    );
  }

  /**
   * @description Deletes a profile by ID.
   *
   * @param profileId ID of the profile to delete
   * @returns Observable emitting the deletion result
   */
  deleteProfile(profileId: number): Observable<any> {
    return this.http.delete(`${this.apiConfig.apiProfile}/${profileId}`);
  }

  /**
   * @description Deletes all profiles in the system.
   *
   * @returns Observable emitting the deletion result
   */
  deleteAllProfiles(): Observable<any> {
    return this.http.delete(`${this.apiConfig.apiProfile}/all`);
  }

  /**
   * @description Returns the total number of profiles not deleted.
   *
   * @returns Observable emitting the count
   */
  countProfiles(): Observable<number> {
    return this.http.get<number>(`${this.apiConfig.apiProfile}/count`);
  }

  /**
   * @description Returns the total number of profiles marked as deleted.
   *
   * @returns Observable emitting the count
   */
  countDeletedProfiles(): Observable<number> {
    return this.http.get<number>(`${this.apiConfig.apiProfile}/count-deleted`);
  }

  /**
   * @description Returns a paginated list of profiles that are not deleted.
   *
   * @param page Page number
   * @param size Number of profiles per page
   * @returns Observable emitting a PageResponse of ProfileDTO
   */
  getProfilesNotDeleted(
    page: number,
    size: number,
  ): Observable<PageResponse<ProfileDTO>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<ProfileDTO>>(
      `${this.apiConfig.apiProfile}`,
      { params },
    );
  }

  /**
   * @description Returns a paginated list of profiles that are deleted.
   *
   * @param page Page number
   * @param size Number of profiles per page
   * @returns Observable emitting a PageResponse of ProfileDTO
   */
  getProfilesDeleted(
    page: number,
    size: number,
  ): Observable<PageResponse<ProfileDTO>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<ProfileDTO>>(
      `${this.apiConfig.apiProfile}/deleted`,
      { params },
    );
  }

  /**
   * @description Returns the profile for a given userId.
   *
   * @param userId ID of the user
   * @returns Observable emitting the ProfileDTO
   */
  getProfileByUserId(userId: number): Observable<ProfileDTO> {
    return this.http.get<ProfileDTO>(
      `${this.apiConfig.apiProfile}/user/${userId}`,
    );
  }

  /**
   * @description Returns the profile picture as Blob for a given userId.
   *
   * @param userId ID of the user
   * @returns Observable emitting the profile picture Blob
   */
  getProfilePictureByUserId(userId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiConfig.apiProfile}/user/${userId}/picture`,
      { responseType: 'blob' },
    );
  }

  /**
   * @description Retrieves an image by URL.
   *
   * @param url Image URL
   * @returns Observable emitting the image Blob
   */
  getImageByUrl(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' });
  }

  /**
   * @description Notifies subscribers that a profile has been updated.
   *
   * @param profile Updated profile data
   */
  public notifyProfileUpdated(profile: ProfileDTO): void {
    this.profileUpdatedSubject.next(profile);
  }

  /**
   * @description Retrieves the current user's profile picture as a Base64 string.
   *
   * @param userId ID of the user
   * @returns Observable emitting Base64 string
   */
  getCurrentUserProfileImageBase64(userId: number): Observable<string> {
    return this.http.get(
      `${this.apiConfig.apiProfile}/user/${userId}/picture-base64`,
      {
        responseType: 'text',
      },
    );
  }
}
