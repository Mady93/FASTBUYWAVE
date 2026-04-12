package com.mady.springboot_be.repositories.contact;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mady.springboot_be.entities.contact.Appointment;
import com.mady.springboot_be.enums.contact.AppointmentStatus;

/**
 * Repository interface for Appointment entity operations.
 * 
 * Provides custom queries for finding appointments by requester, organizer,
 * user involvement, status, date ranges, and dashboard statistics.
 * 
 * The repository uses named queries defined in the Appointment entity for
 * complex queries with JOIN FETCH to prevent N+1 problems.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

        /**
         * Finds appointments where user is the requester.
         * 
         * @param requesterId the ID of the requester user
         * @return list of active appointments
         */
        @Query(name = "Appointment.findByRequesterIdAndActiveTrue")
        List<Appointment> findByRequesterIdAndActiveTrue(@Param("requesterId") Long requesterId);

        /**
         * Finds appointments where user is the requester with specific status.
         * 
         * @param requesterId the ID of the requester user
         * @param status      the appointment status (PENDING, CONFIRMED, CANCELLED,
         *                    COMPLETED, RESCHEDULED)
         * @return list of matching appointments
         */
        @Query(name = "Appointment.findByRequesterIdAndStatusAndActiveTrue")
        List<Appointment> findByRequesterIdAndStatusAndActiveTrue(
                        @Param("requesterId") Long requesterId,
                        @Param("status") AppointmentStatus status);

        /**
         * Finds appointments where user is the organizer.
         * 
         * @param organizerId the ID of the organizer user
         * @return list of active appointments
         */
        @Query(name = "Appointment.findByOrganizerIdAndActiveTrue")
        List<Appointment> findByOrganizerIdAndActiveTrue(@Param("organizerId") Long organizerId);

        /**
         * Finds appointments where user is the organizer with specific status.
         * 
         * @param organizerId the ID of the organizer user
         * @param status      the appointment status
         * @return list of matching appointments
         */
        @Query(name = "Appointment.findByOrganizerIdAndStatusAndActiveTrue")
        List<Appointment> findByOrganizerIdAndStatusAndActiveTrue(
                        @Param("organizerId") Long organizerId,
                        @Param("status") AppointmentStatus status);

        /**
         * Finds all appointments where user is involved (as requester or organizer).
         * Uses JOIN FETCH to eagerly load requester and organizer profiles.
         * 
         * @param userId the ID of the user
         * @return list of appointments ordered by appointment datetime ascending
         */
        @Query(name = "Appointment.findByUserInvolved")
        List<Appointment> findByUserInvolved(@Param("userId") Long userId);

        /**
         * Finds confirmed appointments for a specific user.
         * 
         * @param userId the ID of the user
         * @return list of confirmed appointments ordered by appointment datetime
         *         ascending
         */
        @Query(name = "Appointment.findConfirmedByUser")
        List<Appointment> findConfirmedByUser(@Param("userId") Long userId);

        /**
         * Finds appointments for a specific product.
         * 
         * @param productId the ID of the product
         * @return list of active appointments
         */
        @Query(name = "Appointment.findByProductIdAndActiveTrue")
        List<Appointment> findByProductIdAndActiveTrue(@Param("productId") Long productId);

        /**
         * Finds appointments for a specific user within a date range.
         * 
         * @param userId    the ID of the user
         * @param startDate the start date of the range (inclusive)
         * @param endDate   the end date of the range (inclusive)
         * @return list of matching appointments ordered by appointment datetime
         *         ascending
         */
        @Query(name = "Appointment.findByUserAndDateRange")
        List<Appointment> findByUserAndDateRange(
                        @Param("userId") Long userId,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        /**
         * Finds appointments for a specific user on the current day.
         * 
         * @param userId the ID of the user
         * @return list of matching appointments ordered by appointment datetime
         *         ascending
         */
        @Query(name = "Appointment.findTodayAppointmentsByUser")
        List<Appointment> findTodayAppointmentsByUser(@Param("userId") Long userId);

        /**
         * Finds appointments for a specific user in the current week.
         * 
         * @param userId the ID of the user
         * @return list of matching appointments ordered by appointment datetime
         *         ascending
         */
        @Query(name = "Appointment.findThisWeekAppointmentsByUser")
        List<Appointment> findThisWeekAppointmentsByUser(@Param("userId") Long userId);

        /**
         * Finds confirmed appointments that need a reminder.
         * 
         * @param reminderTime the time to check for reminders (typically now + 24
         *                     hours)
         * @return list of appointments needing reminders
         */
        @Query(name = "Appointment.findAppointmentsNeedingReminder")
        List<Appointment> findAppointmentsNeedingReminder(@Param("reminderTime") LocalDateTime reminderTime);

        /**
         * Counts appointments by status and active flag.
         * 
         * @param status the appointment status
         * @return the count of matching appointments
         */
        @Query(name = "Appointment.countByStatusAndActiveTrue")
        long countByStatusAndActiveTrue(@Param("status") AppointmentStatus status);

        /**
         * Finds calendar appointments for a specific month (optimized query).
         * Returns a map with keys: id, title, datetime, status, duration.
         * 
         * @param userId the ID of the user
         * @param year   the year
         * @param month  the month (1-12)
         * @return list of appointment maps for calendar display
         */
        @Query(name = "Appointment.findCalendarAppointments")
        List<Map<String, Object>> findCalendarAppointments(
                        @Param("userId") Long userId,
                        @Param("year") int year,
                        @Param("month") int month);

        /**
         * Gets appointment statistics grouped by status for a specific organizer.
         * 
         * @param organizerId the ID of the organizer
         * @return list of Object arrays where each element is [status, count]
         */
        @Query(name = "Appointment.getAppointmentStatsByOrganizer")
        List<Object[]> getAppointmentStatsByOrganizer(@Param("organizerId") Long organizerId);

        // ========== DASHBOARD QUERIES ==========

        /**
         * Counts active appointments within a date range for dashboard statistics.
         * 
         * @param startDate start of the range (inclusive)
         * @param endDate   end of the range (inclusive)
         * @return count of appointments in the period
         */
        @Query(name = "Appointment.countAppointmentsByPeriod")
        Long countAppointmentsByPeriod(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        /**
         * Retrieves upcoming appointments for a specific user within a period.
         * 
         * Returns an array of objects containing:
         * - [0] appointmentId
         * - [1] appointmentDatetime
         * - [2] requesterEmail
         * - [3] requesterPhone
         * - [4] organizerEmail
         * - [5] organizerPhone
         * - [6] status
         * - [7] locationType
         * - [8] title (product name)
         * 
         * @param startDate start of the range (inclusive)
         * @param endDate   end of the range (inclusive)
         * @param userId    the ID of the user
         * @return list of Object arrays with appointment data
         */
        @Query(name = "Appointment.getUpcomingAppointmentsByPeriodAndUser")
        List<Object[]> getUpcomingAppointmentsByPeriodAndUser(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("userId") Long userId);
}