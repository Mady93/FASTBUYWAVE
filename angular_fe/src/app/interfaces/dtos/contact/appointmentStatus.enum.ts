/**
 * @category Enumerations
 * 
 * @fileoverview Enum representing the status of an appointment.
 * Includes all possible stages an appointment can be in, from pending to completed or cancelled.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @enum {string}
 */
export enum AppointmentStatus {
  /** @description Appointment has been created but not yet confirmed */
  PENDING = 'PENDING',

  /** @description Appointment has been confirmed by the organizer and/or requester */
  CONFIRMED = 'CONFIRMED',

  /** @description Appointment has been cancelled either by requester or organizer */
  CANCELLED = 'CANCELLED',

  /** @description Appointment has taken place and has been completed successfully */
  COMPLETED = 'COMPLETED',

  /** @description Appointment has been rescheduled to a different date/time */
  RESCHEDULED = 'RESCHEDULED',

  /** @description Appointment was scheduled but the requester or organizer did not show up */
  NO_SHOW = 'NO_SHOW'
}