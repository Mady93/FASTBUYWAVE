import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponseData } from 'src/app/interfaces/dettails/api_response_data';
import { AppointmentDTO } from 'src/app/interfaces/dtos/contact/appointment_dto.interface';
import { ApiConfigService } from '../../api-config/api-config.service';

/**
 * @category Services
 *
 * @description
 * Service for managing appointments. Provides methods to create, retrieve, update,
 * confirm, cancel, reschedule, complete, and update the location of appointments.
 * Also provides specialized queries like fetching today's, this week's, or calendar-based appointments.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  /**
   * @description Creates an instance of AppointmentService.
   *
   * @param {HttpClient} http - Angular HttpClient for making HTTP requests.
   * @param {ApiConfigService} apiConfig - Service providing API endpoint URLs for appointments.
   */
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * @description Get a single appointment by its ID.
   * @param {number} appointmentId - ID of the appointment to retrieve.
   * @returns {Observable<ApiResponseData<AppointmentDTO>>} Observable with the appointment data.
   */
  getAppointmentById(
    appointmentId: number,
  ): Observable<ApiResponseData<AppointmentDTO>> {
    return this.http.get<ApiResponseData<AppointmentDTO>>(
      `${this.apiConfig.apiAppointments}/${appointmentId}`,
    );
  }

  /**
   * @description Get appointments requested by a specific user.
   * @param {number} userId - ID of the requester.
   * @returns {Observable<ApiResponseData<AppointmentDTO[]>>} Observable with a list of appointments.
   */
  getAppointmentsByRequester(
    userId: number,
  ): Observable<ApiResponseData<AppointmentDTO[]>> {
    return this.http.get<ApiResponseData<AppointmentDTO[]>>(
      `${this.apiConfig.apiAppointments}/requester/${userId}`,
    );
  }

  /**
   * @description Get appointments organized by a specific user.
   * @param {number} userId - ID of the organizer.
   * @returns {Observable<ApiResponseData<AppointmentDTO[]>>} Observable with a list of appointments.
   */
  getAppointmentsByOrganizer(
    userId: number,
  ): Observable<ApiResponseData<AppointmentDTO[]>> {
    return this.http.get<ApiResponseData<AppointmentDTO[]>>(
      `${this.apiConfig.apiAppointments}/organizer/${userId}`,
    );
  }

  /**
   * @description Get all appointments for a specific user, including requested and organized.
   * @param {number} userId - ID of the user.
   * @returns {Observable<ApiResponseData<{ requested: AppointmentDTO[], organized: AppointmentDTO[] }>>} Observable with categorized appointments.
   */
  getUserAppointments(userId: number): Observable<
    ApiResponseData<{
      requested: AppointmentDTO[];
      organized: AppointmentDTO[];
    }>
  > {
    return this.http.get<ApiResponseData<any>>(
      `${this.apiConfig.apiAppointments}/user/${userId}/all`,
    );
  }

  /**
   * @description Get confirmed appointments for a user.
   * @param {number} userId - ID of the user.
   * @returns {Observable<ApiResponseData<AppointmentDTO[]>>} Observable with confirmed appointments.
   */
  getConfirmedAppointments(
    userId: number,
  ): Observable<ApiResponseData<AppointmentDTO[]>> {
    return this.http.get<ApiResponseData<AppointmentDTO[]>>(
      `${this.apiConfig.apiAppointments}/user/${userId}/confirmed`,
    );
  }

  /**
   * @description Get today's appointments for a user.
   * @param {number} userId - ID of the user.
   * @returns {Observable<ApiResponseData<AppointmentDTO[]>>} Observable with today's appointments.
   */
  getTodayAppointments(
    userId: number,
  ): Observable<ApiResponseData<AppointmentDTO[]>> {
    return this.http.get<ApiResponseData<AppointmentDTO[]>>(
      `${this.apiConfig.apiAppointments}/user/${userId}/today`,
    );
  }

  /**
   * @description Get this week's appointments for a user.
   * @param {number} userId - ID of the user.
   * @returns {Observable<ApiResponseData<AppointmentDTO[]>>} Observable with this week's appointments.
   */
  getThisWeekAppointments(
    userId: number,
  ): Observable<ApiResponseData<AppointmentDTO[]>> {
    return this.http.get<ApiResponseData<AppointmentDTO[]>>(
      `${this.apiConfig.apiAppointments}/user/${userId}/week`,
    );
  }

  /**
   * @description Get appointments for a user within a specific date range.
   * @param {number} userId - ID of the user.
   * @param {string} startDate - Start date (ISO string).
   * @param {string} endDate - End date (ISO string).
   * @returns {Observable<ApiResponseData<AppointmentDTO[]>>} Observable with appointments within the range.
   */
  getAppointmentsByDateRange(
    userId: number,
    startDate: string,
    endDate: string,
  ): Observable<ApiResponseData<AppointmentDTO[]>> {
    const params = new HttpParams().set('start', startDate).set('end', endDate);
    return this.http.get<ApiResponseData<AppointmentDTO[]>>(
      `${this.apiConfig.apiAppointments}/user/${userId}/range`,
      { params },
    );
  }

  /**
   * @description Get calendar view appointments for a specific month and year.
   * @param {number} userId - ID of the user.
   * @param {number} year - Year to query.
   * @param {number} month - Month to query (1-12).
   * @returns {Observable<ApiResponseData<any[]>>} Observable with calendar-structured appointments.
   */
  getCalendarAppointments(
    userId: number,
    year: number,
    month: number,
  ): Observable<ApiResponseData<any[]>> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    return this.http.get<ApiResponseData<any[]>>(
      `${this.apiConfig.apiAppointments}/user/${userId}/calendar`,
      { params },
    );
  }

  /**
   * @description Get appointment statistics for a user.
   * @param {number} userId - ID of the user.
   * @returns {Observable<ApiResponseData<{ [key: string]: number }>>} Observable with statistics grouped by type/status.
   */
  getAppointmentStatistics(
    userId: number,
  ): Observable<ApiResponseData<{ [key: string]: number }>> {
    return this.http.get<ApiResponseData<any>>(
      `${this.apiConfig.apiAppointments}/stats/${userId}`,
    );
  }

  /**
   * @description Confirm an appointment.
   * @param {number} appointmentId - ID of the appointment.
   * @param {number} userId - ID of the user confirming.
   * @returns {Observable<ApiResponseData<AppointmentDTO>>} Observable with updated appointment data.
   */
  confirmAppointment(
    appointmentId: number,
    userId: number,
  ): Observable<ApiResponseData<AppointmentDTO>> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.patch<ApiResponseData<AppointmentDTO>>(
      `${this.apiConfig.apiAppointments}/${appointmentId}/confirm`,
      null,
      { params },
    );
  }

  /**
   * @description Cancel an appointment with optional reason.
   * @param {number} appointmentId - ID of the appointment.
   * @param {number} userId - ID of the user cancelling.
   * @param {string} [reason] - Optional reason for cancellation.
   * @returns {Observable<ApiResponseData<AppointmentDTO>>} Observable with updated appointment data.
   */
  cancelAppointment(
    appointmentId: number,
    userId: number,
    reason?: string,
  ): Observable<ApiResponseData<AppointmentDTO>> {
    let params = new HttpParams().set('userId', userId.toString());
    if (reason) params = params.set('reason', reason);
    return this.http.patch<ApiResponseData<AppointmentDTO>>(
      `${this.apiConfig.apiAppointments}/${appointmentId}/cancel`,
      null,
      { params },
    );
  }

  /**
   * @description Reschedule an appointment to a new date and time with optional reason.
   * @param {number} appointmentId - ID of the appointment.
   * @param {string} newDatetime - New date-time string (ISO).
   * @param {string} [reason] - Optional reason for rescheduling.
   * @returns {Observable<ApiResponseData<AppointmentDTO>>} Observable with updated appointment data.
   */
  rescheduleAppointment(
    appointmentId: number,
    newDatetime: string,
    reason?: string,
  ): Observable<ApiResponseData<AppointmentDTO>> {
    let params = new HttpParams().set('newDatetime', newDatetime);
    if (reason) params = params.set('reason', reason);
    return this.http.patch<ApiResponseData<AppointmentDTO>>(
      `${this.apiConfig.apiAppointments}/${appointmentId}/reschedule`,
      null,
      { params },
    );
  }

  /**
   * @description Complete an appointment with optional rating and feedback.
   * @param {number} appointmentId - ID of the appointment.
   * @param {number} [rating] - Optional rating.
   * @param {string} [feedback] - Optional feedback comment.
   * @returns {Observable<ApiResponseData<AppointmentDTO>>} Observable with updated appointment data.
   */
  completeAppointment(
    appointmentId: number,
    rating?: number,
    feedback?: string,
  ): Observable<ApiResponseData<AppointmentDTO>> {
    let params = new HttpParams();
    if (rating !== undefined) params = params.set('rating', rating.toString());
    if (feedback) params = params.set('feedback', feedback);
    return this.http.patch<ApiResponseData<AppointmentDTO>>(
      `${this.apiConfig.apiAppointments}/${appointmentId}/complete`,
      null,
      { params },
    );
  }

  /**
   * @description Update the location and optional notes of an appointment.
   * @param {number} appointmentId - ID of the appointment.
   * @param {string} address - New address.
   * @param {string} [notes] - Optional notes.
   * @returns {Observable<ApiResponseData<AppointmentDTO>>} Observable with updated appointment data.
   */
  updateAppointmentLocation(
    appointmentId: number,
    address: string,
    notes?: string,
  ): Observable<ApiResponseData<AppointmentDTO>> {
    let params = new HttpParams().set('address', address);
    if (notes) params = params.set('notes', notes);
    return this.http.patch<ApiResponseData<AppointmentDTO>>(
      `${this.apiConfig.apiAppointments}/${appointmentId}/location`,
      null,
      { params },
    );
  }
}
