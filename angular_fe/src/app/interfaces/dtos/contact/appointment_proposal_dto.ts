import { UserProfileDTO } from '../comment/user_profile_dto.interface';
import { AppointmentDTO } from './appointment_dto.interface';
import { ProposalStatus } from './appointment_proposal.interface';

/**
 * @category Interfaces
 *
 * @fileoverview Data Transfer Object (DTO) representing a proposal for an appointment.
 * Contains information about who proposed it, the proposed date/time and location,
 * optional duration, status, and geolocation coordinates. Tracks creation timestamp
 * and supports optional updates to location notes or timing.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface AppointmentProposalDTO
 * @property {number} [proposalId] - Unique identifier of the proposal (optional, may be undefined before creation).
 * @property {AppointmentDTO} appointment - The original appointment this proposal is associated with.
 * @property {UserProfileDTO} proposedBy - User who created the proposal.
 * @property {string} proposedDatetime - Proposed date and time in ISO format.
 * @property {string} proposedLocationAddress - Address for the proposed location.
 * @property {string} [proposedLocationNotes] - Optional notes about the proposed location.
 * @property {number} [proposedDuration] - Optional duration in minutes for the proposed appointment.
 * @property {ProposalStatus} status - Current status of the proposal (e.g., PENDING, ACCEPTED, REJECTED).
 * @property {string} [createdAt] - Datetime when the proposal was created (ISO string).
 * @property {number} [latitude] - Optional latitude for the proposed location.
 * @property {number} [longitude] - Optional longitude for the proposed location.
 */
export interface AppointmentProposalDTO {
  proposalId?: number;
  appointment: AppointmentDTO;
  proposedBy: UserProfileDTO;
  proposedDatetime: string;
  proposedLocationAddress: string;
  proposedLocationNotes?: string;
  proposedDuration?: number;
  status: ProposalStatus;
  createdAt?: string;
  latitude?: number;
  longitude?: number;
}
