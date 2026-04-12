package com.mady.springboot_be.enums.contact;

/**
 * Represents the possible statuses of an appointment in the system.
 * 
 * The status tracks the lifecycle of an appointment from creation to
 * completion,
 * including confirmation, cancellation, rescheduling, and no-show scenarios.
 * 
 * Status flow:
 * 
 * <pre>
 * PENDING → CONFIRMED → COMPLETED
 *    ↓          ↓
 * CANCELLED  CANCELLED
 *    ↓
 * RESCHEDULED → PENDING → ...
 * </pre>
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public enum AppointmentStatus {

    /**
     * Appointment is waiting for confirmation from both parties.
     * Initial status when an appointment is first created.
     */
    PENDING,

    /**
     * Appointment has been confirmed by both parties.
     * The appointment is locked and scheduled.
     */
    CONFIRMED,

    /**
     * Appointment has been cancelled by one of the parties.
     * Terminal state - no further changes possible.
     */
    CANCELLED,

    /**
     * Appointment has been successfully completed.
     * Terminal state - can include rating and feedback.
     */
    COMPLETED,

    /**
     * Appointment date/time has been modified by one party,
     * waiting for reconfirmation from the other party.
     * Returns to PENDING state after rescheduling.
     */
    RESCHEDULED,

    /**
     * One party did not show up for the appointment.
     * Terminal state - used for tracking reliability.
     */
    NO_SHOW
}
