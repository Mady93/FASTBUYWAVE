import { UserProfileDTO } from "../comment/user_profile_dto.interface";
import { ProductDTO } from "../product_dto.interface";
import { ContactMethod } from "./contactMethod.enum";
import { RequestStatus } from "./requestStatus.enum";

/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) representing a contact request between users.
 * Includes details about the sender, receiver, related product, message content,
 * preferred contact method, status, timestamps, notifications, optional appointment conversion,
 * location, duration, and geolocation.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface ContactRequestDTO
 * @property {number} [requestId] - Unique identifier of the contact request.
 * @property {UserProfileDTO} sender - User who sends the request.
 * @property {UserProfileDTO} receiver - User who receives the request.
 * @property {ProductDTO} product - Product related to the contact request.
 * @property {string} subject - Subject of the request message.
 * @property {string} message - Main content of the request message.
 * @property {string} [additionalNotes] - Optional additional notes for the request.
 * @property {ContactMethod} preferredContactMethod - Preferred method of contact.
 * @property {RequestStatus} [status] - Current status of the request.
 * @property {string} [createdAt] - Datetime when the request was created.
 * @property {string} [rejectedAt] - Datetime when the request was rejected, if applicable.
 * @property {string} [rejectionReason] - Optional reason for rejection.
 * @property {boolean} [emailNotificationSent] - Whether an email notification was sent.
 * @property {boolean} [active] - Whether the request is currently active.
 * @property {number} [convertedToAppointmentId] - Optional appointment ID if request was converted.
 * @property {string} [senderPhone] - Optional phone of the sender.
 * @property {string} [senderContactEmail] - Optional email for the sender contact.
 * @property {boolean} [hiddenBySender] - Whether the request is hidden by the sender.
 * @property {boolean} [hiddenByReceiver] - Whether the request is hidden by the receiver.
 * @property {string} appointmentDateTime - Scheduled datetime if converted to appointment.
 * @property {string} locationAddress - Address for the appointment or meeting.
 * @property {string} [locationNotes] - Optional notes about the location.
 * @property {number} [durationMinutes] - Optional duration of the appointment in minutes.
 * @property {number} [latitude] - Optional latitude for geolocation.
 * @property {number} [longitude] - Optional longitude for geolocation.
 */
export interface ContactRequestDTO {
  requestId?: number;
  sender: UserProfileDTO;
  receiver: UserProfileDTO;
  product: ProductDTO;
  subject: string;
  message: string;
  additionalNotes?: string;
  preferredContactMethod: ContactMethod;
  status?: RequestStatus;
  createdAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  emailNotificationSent?: boolean;
  active?: boolean;
  convertedToAppointmentId?: number;
  senderPhone?: string;
  senderContactEmail?: string;
  hiddenBySender?: boolean;
  hiddenByReceiver?: boolean;
  appointmentDateTime: string;
  locationAddress: string;
  locationNotes?: string;
  durationMinutes?: number;
  latitude?: number;
  longitude?: number;
}