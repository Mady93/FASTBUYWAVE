import { UserProfileDTO } from "../comment/user_profile_dto.interface";
import { ProductDTO } from "../product_dto.interface";
import { AppointmentStatus } from "./appointmentStatus.enum";
import { LocationType } from "./locationType.enum";

/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) representing an appointment or meeting.
 * Contains detailed information about the appointment, including requester, organizer,
 * associated product, timing, location, status, reminders, and optional feedback.
 * Tracks the full lifecycle of an appointment (created, confirmed, cancelled, completed)
 * and supports geolocation, ratings, and notes.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface AppointmentDTO
 * @property {number} appointmentId - Unique identifier of the appointment.
 * @property {UserProfileDTO} requester - User who requested the appointment.
 * @property {UserProfileDTO} organizer - User who organizes the appointment.
 * @property {ProductDTO} product - Product associated with the appointment.
 * @property {string} title - Title or subject of the appointment.
 * @property {string} [description] - Optional detailed description of the appointment.
 * @property {string} appointmentDatetime - Scheduled datetime in ISO format.
 * @property {number} durationMinutes - Duration of the appointment in minutes.
 * @property {LocationType} locationType - Type of location (e.g., online, in-person).
 * @property {string} locationAddress - Address for the appointment location.
 * @property {string} [locationNotes] - Optional notes about the location.
 * @property {string} [meetingLink] - Optional link for online meetings.
 * @property {AppointmentStatus} status - Current status of the appointment.
 * @property {string} createdAt - Datetime when the appointment was created.
 * @property {string} [confirmedAt] - Datetime when the appointment was confirmed.
 * @property {string} [cancelledAt] - Datetime when the appointment was cancelled.
 * @property {string} [completedAt] - Datetime when the appointment was completed.
 * @property {string} [cancellationReason] - Optional reason for cancellation.
 * @property {number} [cancelledByUserId] - Optional ID of the user who cancelled.
 * @property {boolean} reminderSent - Whether a reminder was sent.
 * @property {string} [reminderSentAt] - Datetime when the reminder was sent.
 * @property {boolean} active - Whether the appointment is currently active.
 * @property {number} [rating] - Optional rating given for the appointment.
 * @property {string} [feedback] - Optional feedback text.
 * @property {number} [latitude] - Optional latitude for geolocation.
 * @property {number} [longitude] - Optional longitude for geolocation.
 */
export interface AppointmentDTO {
  appointmentId: number;
  requester: UserProfileDTO;
  organizer: UserProfileDTO;
  product: ProductDTO;
  title: string;
  description?: string;
  appointmentDatetime: string; // ISO format
  durationMinutes: number;
  locationType: LocationType;
  locationAddress: string;
  locationNotes?: string;
  meetingLink?: string;
  status: AppointmentStatus;
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  completedAt?: string;
  cancellationReason?: string;
  cancelledByUserId?: number;
  reminderSent: boolean;
  reminderSentAt?: string;
  active: boolean;
  rating?: number;
  feedback?: string;
  latitude?: number;
  longitude?: number;
}

