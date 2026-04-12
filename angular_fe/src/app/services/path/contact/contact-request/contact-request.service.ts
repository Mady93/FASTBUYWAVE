import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponseData } from 'src/app/interfaces/dettails/api_response_data';
import { ContactRequestDTO } from 'src/app/interfaces/dtos/contact/contactRequestDTO.interface';
import { CreateContactRequestPayload } from 'src/app/interfaces/dtos/contact/createContactRequestPayload.interface';
import { ApiConfigService } from 'src/app/services/api-config/api-config.service';

/**
 * @category Services
 *
 * @description
 * Provides methods to create, retrieve, accept, reject, and hide contact requests.
 * Handles HTTP communication with the backend API and standardizes error handling.
 *
 * @example
 * ```typescript
 * constructor(private contactService: ContactRequestService) {}
 *
 * // Fetch requests for a specific receiver
 * this.contactService.getRequestsByReceiver(123).subscribe(requests => console.log(requests));
 *
 * // Create a new contact request
 * this.contactService.createContactRequest(payload).subscribe(request => console.log(request));
 *
 * // Accept a request
 * this.contactService.acceptRequest(456).subscribe();
 *
 * // Reject a request
 * this.contactService.rejectRequest(789, 'Not relevant').subscribe();
 *
 * // Hide a request
 * this.contactService.hideRequest(789).subscribe();
 * ```
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class ContactRequestService {
  /**
   * @constructor
   * @description Initializes the ContactRequestService with required dependencies.
   *
   * @param {HttpClient} http - Angular HttpClient for API requests
   * @param {ApiConfigService} apiConfig - Service providing API base URLs and configuration
   */
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * @description Retrieves all contact requests received by a specific user.
   *
   * @param {number} receiverUserId - ID of the receiving user
   * @returns {Observable<ContactRequestDTO[]>} Observable of contact requests
   * @throws Error if user ID is invalid or API returns an error
   */
  getRequestsByReceiver(
    receiverUserId: number,
  ): Observable<ContactRequestDTO[]> {
    if (!receiverUserId || receiverUserId <= 0) {
      return throwError(() => new Error('Invalid receiver user ID'));
    }

    return this.http
      .get<
        ApiResponseData<ContactRequestDTO[]>
      >(`${this.apiConfig.apiContact}/receiver/${receiverUserId}`)
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('No data received from server');
          }
          return response.data;
        }),
        catchError((error) => {
          console.error('❌ Error getting requests by receiver:', error);

          if (error.status === 406) {
            throw new Error('Invalid user ID format');
          } else if (error.status === 404) {
            throw new Error('User not found');
          } else if (error.status === 401) {
            throw new Error('Authentication required');
          } else {
            throw new Error('Failed to load contact requests');
          }
        }),
      );
  }

  /**
   * @description Retrieves all contact requests sent by a specific user.
   *
   * @param {number} senderUserId - ID of the sending user
   * @returns {Observable<ContactRequestDTO[]>} Observable of contact requests
   */
  getRequestsBySender(senderUserId: number): Observable<ContactRequestDTO[]> {
    return this.http
      .get<
        ApiResponseData<ContactRequestDTO[]>
      >(`${this.apiConfig.apiContact}/sender/${senderUserId}`)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error getting requests by sender:', error);
          throw error;
        }),
      );
  }

  /**
   * @description Retrieves a contact request by its unique ID.
   *
   * @param {number} requestId - ID of the contact request
   * @returns {Observable<ContactRequestDTO>} Observable of the contact request
   */
  getRequestById(requestId: number): Observable<ContactRequestDTO> {
    return this.http
      .get<
        ApiResponseData<ContactRequestDTO>
      >(`${this.apiConfig.apiContact}/${requestId}`)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error getting request by ID:', error);
          throw error;
        }),
      );
  }

  /**
   * @description Creates a new contact request.
   *
   * @param {CreateContactRequestPayload} payload - Data payload for the request
   * @returns {Observable<ContactRequestDTO>} Observable of the created request
   */
  createContactRequest(
    payload: CreateContactRequestPayload,
  ): Observable<ContactRequestDTO> {
    return this.http
      .post<
        ApiResponseData<ContactRequestDTO>
      >(`${this.apiConfig.apiContact}`, payload)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error creating contact request:', error);
          throw error;
        }),
      );
  }

  /**
   * @description Accepts an existing contact request.
   *
   * @param {number} requestId - ID of the request to accept
   * @returns {Observable<ContactRequestDTO>} Observable of the updated request
   */
  acceptRequest(requestId: number): Observable<ContactRequestDTO> {
    return this.http
      .patch<
        ApiResponseData<ContactRequestDTO>
      >(`${this.apiConfig.apiContact}/${requestId}/accept`, null)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error accepting request:', error);
          throw error;
        }),
      );
  }

  /**
   * @description Rejects a contact request with a reason.
   *
   * @param {number} requestId - ID of the request to reject
   * @param {string} rejectionReason - Reason for rejection
   * @returns {Observable<ContactRequestDTO>} Observable of the updated request
   */
  rejectRequest(
    requestId: number,
    rejectionReason: string,
  ): Observable<ContactRequestDTO> {
    const payload = { rejectionReason };

    console.log('Sending reject payload:', payload);

    return this.http
      .patch<ApiResponseData<ContactRequestDTO>>(
        `${this.apiConfig.apiContact}/${requestId}/reject`,
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      )
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('No data received from server');
          }
          return response.data;
        }),
        catchError((error) => {
          throw error;
        }),
      );
  }

  /**
   * @description Hides a contact request for the current user (soft delete).
   *
   * @param {number} requestId - ID of the request to hide
   * @returns {Observable<void>} Observable that completes when the request is hidden
   * @throws Error if request not found, forbidden, or other server issues
   */
  hideRequest(requestId: number): Observable<void> {
    return this.http
      .patch<
        ApiResponseData<void>
      >(`${this.apiConfig.apiContact}/${requestId}/hide`, {})
      .pipe(
        map((response) => {
          return;
        }),
        catchError((error) => {
          console.error('Error hiding request:', error);

          if (error.status === 404) {
            throw new Error('Request not found');
          } else if (error.status === 403) {
            throw new Error('You are not involved in this request');
          } else if (error.status === 401) {
            throw new Error('Authentication required');
          } else {
            throw new Error('Failed to hide request');
          }
        }),
      );
  }
}
