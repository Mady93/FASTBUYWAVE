package com.mady.springboot_be.services.contact;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.mady.springboot_be.dtos.contact.AppointmentDTO;

/**
 * Service interface for appointment management operations.
 * 
 * Defines methods for retrieving, confirming, cancelling, rescheduling,
 * and completing appointments. Supports calendar views, statistics,
 * and automated reminder sending.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface AppointmentService {

    /**
     * Retrieves an appointment by its ID.
     * 
     * @param appointmentId the ID of the appointment
     * @return the AppointmentDTO
     */
    AppointmentDTO getAppointmentById(Long appointmentId);

    /**
     * Retrieves all appointments where the user is the requester.
     * 
     * @param requesterUserId the ID of the requester user
     * @return list of appointments
     */
    List<AppointmentDTO> getAppointmentsByRequester(Long requesterUserId);

    /**
     * Retrieves all appointments where the user is the organizer.
     * 
     * @param organizerUserId the ID of the organizer user
     * @return list of appointments
     */
    List<AppointmentDTO> getAppointmentsByOrganizer(Long organizerUserId);

    /**
     * Retrieves all appointments for a user, grouped by role (requested/organized).
     * 
     * @param userId the ID of the user
     * @return map with keys "requested" and "organized"
     */
    Map<String, List<AppointmentDTO>> getAppointmentsByUser(Long userId);

    /**
     * Retrieves confirmed appointments for a user.
     * 
     * @param userId the ID of the user
     * @return list of confirmed appointments
     */
    List<AppointmentDTO> getConfirmedAppointmentsByUser(Long userId);

    /**
     * Retrieves appointments for a user in a specific month, formatted for calendar
     * display.
     * 
     * @param userId the ID of the user
     * @param year   the year to filter by
     * @param month  the month to filter by (1-12)
     * @return list of appointments with date and summary for calendar display
     */
    List<Map<String, Object>> getCalendarAppointments(Long userId, int year, int month);

    /**
     * Confirms a pending or rescheduled appointment.
     * 
     * @param appointmentId the ID of the appointment
     * @param userId        the ID of the user confirming
     * @return updated AppointmentDTO
     */
    AppointmentDTO confirmAppointment(Long appointmentId, Long userId);

    /**
     * Cancels an appointment with an optional reason.
     * 
     * @param appointmentId      the ID of the appointment
     * @param userId             the ID of the user cancelling
     * @param cancellationReason the reason for cancellation
     * @return updated AppointmentDTO
     */
    AppointmentDTO cancelAppointment(Long appointmentId, Long userId, String cancellationReason);

    /**
     * Reschedules an appointment to a new date/time.
     * 
     * @param appointmentId the ID of the appointment
     * @param newDatetime   the new date and time
     * @param reason        the reason for rescheduling
     * @return updated AppointmentDTO
     */
    AppointmentDTO rescheduleAppointment(Long appointmentId, LocalDateTime newDatetime, String reason);

    /**
     * Marks an appointment as completed with rating and feedback.
     * 
     * @param appointmentId the ID of the appointment
     * @param rating        user rating (1-5)
     * @param feedback      user feedback text
     * @return updated AppointmentDTO
     */
    AppointmentDTO completeAppointment(Long appointmentId, Integer rating, String feedback);

    /**
     * Updates the location of an appointment.
     * 
     * @param appointmentId   the ID of the appointment
     * @param locationAddress the new address
     * @param locationNotes   additional notes
     * @return updated AppointmentDTO
     */
    AppointmentDTO updateAppointmentLocation(Long appointmentId, String locationAddress, String locationNotes);

    /**
     * Sends reminders for upcoming appointments.
     * Scheduled to run every hour.
     */
    void sendAppointmentReminders();

    /**
     * Returns appointment statistics for a user.
     * 
     * @param userId the ID of the user
     * @return map with counts: total, pending, confirmed, completed, cancelled
     */
    Map<String, Long> getAppointmentStatistics(Long userId);

    /**
     * Retrieves today's appointments for a user.
     * 
     * @param userId the ID of the user
     * @return list of today's appointments
     */
    List<AppointmentDTO> getTodayAppointments(Long userId);

    /**
     * Retrieves this week's appointments for a user.
     * 
     * @param userId the ID of the user
     * @return list of this week's appointments
     */
    List<AppointmentDTO> getThisWeekAppointments(Long userId);

    /**
     * Retrieves appointments within a date range for a user.
     * 
     * @param userId    the ID of the user
     * @param startDate the start of the date range
     * @param endDate   the end of the date range
     * @return list of appointments in the range
     */
    List<AppointmentDTO> getAppointmentsByDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate);
}
