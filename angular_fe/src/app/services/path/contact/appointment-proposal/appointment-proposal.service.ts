import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { AppointmentProposalDTO } from 'src/app/interfaces/dtos/contact/appointment_proposal_dto';
import { ApiConfigService } from 'src/app/services/api-config/api-config.service';

/**
 * @category Services
 *
 * @description
 * Provides methods to create, accept, reject, and fetch appointment proposals.
 * Handles HTTP communication with the backend API and error logging.
 *
 * @example
 * ```typescript
 * constructor(private proposalService: AppointmentProposalService) {}
 *
 * // Propose a change
 * this.proposalService.proposeChange(123, dto, 456).subscribe({
 *   next: proposal => console.log('Proposal created:', proposal),
 *   error: err => console.error(err)
 * });
 *
 * // Accept a proposal
 * this.proposalService.acceptProposal(789, 456).subscribe();
 *
 * // Fetch all proposals for an appointment
 * this.proposalService.getProposals(123).subscribe(proposals => console.log(proposals));
 * ```
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class AppointmentProposalService {
  /**
   * @constructor
   * @description Initializes the AppointmentProposalService with required dependencies.
   *
   * @param {HttpClient} http - Angular HttpClient for making API requests.
   * @param {ApiConfigService} apiConfig - Service providing API base URLs and configuration.
   */
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * @description Base URL for appointment proposals API.
   */
  private get base(): string {
    return this.apiConfig.apiAppointmentProposal;
  }

  /**
   * @description Proposes a change for a specific appointment.
   *
   * @param {number} appointmentId - ID of the appointment
   * @param {AppointmentProposalDTO} dto - Proposal data transfer object
   * @param {number} userId - ID of the user making the proposal
   * @returns {Observable<AppointmentProposalDTO>} Observable of the created proposal
   */
  proposeChange(
    appointmentId: number,
    dto: AppointmentProposalDTO,
    userId: number,
  ): Observable<AppointmentProposalDTO> {
    return this.http
      .post<AppointmentProposalDTO>(
        `${this.base}/create/${appointmentId}?userId=${userId}`,
        dto,
      )
      .pipe(
        catchError((err) => {
          console.error('proposeChange:', err);
          throw err;
        }),
      );
  }

  /**
   * @description Accepts an existing appointment proposal.
   *
   * @param {number} proposalId - ID of the proposal to accept
   * @param {number} userId - ID of the user accepting the proposal
   * @returns {Observable<AppointmentProposalDTO>} Observable of the updated proposal
   */
  acceptProposal(
    proposalId: number,
    userId: number,
  ): Observable<AppointmentProposalDTO> {
    return this.http
      .post<AppointmentProposalDTO>(
        `${this.base}/${proposalId}/accept?userId=${userId}`,
        {},
      )
      .pipe(
        catchError((err) => {
          console.error('acceptProposal:', err);
          throw err;
        }),
      );
  }

  /**
   * @description Rejects an existing appointment proposal.
   *
   * @param {number} proposalId - ID of the proposal to reject
   * @param {number} userId - ID of the user rejecting the proposal
   * @returns {Observable<AppointmentProposalDTO>} Observable of the updated proposal
   */
  rejectProposal(
    proposalId: number,
    userId: number,
  ): Observable<AppointmentProposalDTO> {
    return this.http
      .post<AppointmentProposalDTO>(
        `${this.base}/${proposalId}/reject?userId=${userId}`,
        {},
      )
      .pipe(
        catchError((err) => {
          console.error('rejectProposal:', err);
          throw err;
        }),
      );
  }

  /**
   * @description Retrieves all proposals for a specific appointment.
   *
   * @param {number} appointmentId - ID of the appointment
   * @returns {Observable<AppointmentProposalDTO[]>} Observable of proposals array
   */
  getProposals(appointmentId: number): Observable<AppointmentProposalDTO[]> {
    return this.http
      .get<AppointmentProposalDTO[]>(`${this.base}/${appointmentId}`)
      .pipe(
        catchError((err) => {
          console.error('getProposals:', err);
          throw err;
        }),
      );
  }
}
