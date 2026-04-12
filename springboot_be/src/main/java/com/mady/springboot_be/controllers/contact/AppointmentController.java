package com.mady.springboot_be.controllers.contact;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mady.springboot_be.dettails.ApiResponseData;
import com.mady.springboot_be.dtos.contact.AppointmentDTO;
import com.mady.springboot_be.services_impl.contact.AppointmentServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST controller for appointment management operations.
 * 
 * Supports appointment CRUD operations, confirmation, cancellation,
 * rescheduling, and calendar views.
 * Documentation is provided via Swagger/OpenAPI annotations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestController
@RequestMapping("/api/appointments")
@Tag(name = "Appointments", description = "Endpoints for managing appointments between users")
public class AppointmentController {

    private final AppointmentServiceImpl appointmentService;

    @Autowired
    public AppointmentController(AppointmentServiceImpl appointmentService) {
        this.appointmentService = appointmentService;
    }

    @Operation(summary = "Get appointment by ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Appointment found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Appointment not found")
    })
    @GetMapping("/{appointmentId}")
    public ResponseEntity<ApiResponseData<AppointmentDTO>> getAppointmentById(@PathVariable Long appointmentId) {
        AppointmentDTO dto = appointmentService.getAppointmentById(appointmentId);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Appuntamento trovato", dto));
    }

    @Operation(summary = "Get appointments where user is the requester")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Appointments retrieved successfully")
    })
    @GetMapping("/requester/{userId}")
    public ResponseEntity<ApiResponseData<List<AppointmentDTO>>> getAppointmentsByRequester(@PathVariable Long userId) {
        List<AppointmentDTO> list = appointmentService.getAppointmentsByRequester(userId);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Appuntamenti richiesti trovati", list));
    }

    @Operation(summary = "Get appointments where user is the organizer")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Appointments retrieved successfully")
    })
    @GetMapping("/organizer/{userId}")
    public ResponseEntity<ApiResponseData<List<AppointmentDTO>>> getAppointmentsByOrganizer(@PathVariable Long userId) {
        List<AppointmentDTO> list = appointmentService.getAppointmentsByOrganizer(userId);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Appuntamenti organizzati trovati", list));
    }

    @Operation(summary = "Get all appointments for a user (both as requester and organizer)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Appointments retrieved successfully")
    })
    @GetMapping("/user/{userId}/all")
    public ResponseEntity<ApiResponseData<Map<String, List<AppointmentDTO>>>> getAppointmentsByUser(
            @PathVariable Long userId) {
        Map<String, List<AppointmentDTO>> map = appointmentService.getAppointmentsByUser(userId);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Appuntamenti utente trovati", map));
    }

    @Operation(summary = "Get confirmed appointments for a user")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Confirmed appointments retrieved successfully")
    })
    @GetMapping("/user/{userId}/confirmed")
    public ResponseEntity<ApiResponseData<List<AppointmentDTO>>> getConfirmedAppointments(@PathVariable Long userId) {
        List<AppointmentDTO> list = appointmentService.getConfirmedAppointmentsByUser(userId);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Appuntamenti confermati trovati", list));
    }

    @Operation(summary = "Get calendar appointments for a specific month", description = "Returns appointments formatted for calendar display (year, month)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Calendar appointments retrieved successfully")
    })
    @GetMapping("/user/{userId}/calendar")
    public ResponseEntity<ApiResponseData<List<Map<String, Object>>>> getCalendarAppointments(
            @PathVariable Long userId,
            @RequestParam int year,
            @RequestParam int month) {
        List<Map<String, Object>> list = appointmentService.getCalendarAppointments(userId, year, month);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Appuntamenti calendario recuperati", list));
    }

    @Operation(summary = "Get today's appointments for a user")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Today's appointments retrieved successfully")
    })
    @GetMapping("/user/{userId}/today")
    public ResponseEntity<ApiResponseData<List<AppointmentDTO>>> getTodayAppointments(@PathVariable Long userId) {
        List<AppointmentDTO> list = appointmentService.getTodayAppointments(userId);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Appuntamenti di oggi", list));
    }

    @Operation(summary = "Get this week's appointments for a user")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "This week's appointments retrieved successfully")
    })
    @GetMapping("/user/{userId}/week")
    public ResponseEntity<ApiResponseData<List<AppointmentDTO>>> getThisWeekAppointments(@PathVariable Long userId) {
        List<AppointmentDTO> list = appointmentService.getThisWeekAppointments(userId);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Appuntamenti di questa settimana", list));
    }

    @Operation(summary = "Get appointments by date range")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Appointments in date range retrieved successfully")
    })
    @GetMapping("/user/{userId}/range")
    public ResponseEntity<ApiResponseData<List<AppointmentDTO>>> getAppointmentsByDateRange(
            @PathVariable Long userId,
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<AppointmentDTO> list = appointmentService.getAppointmentsByDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Appuntamenti nel range temporale trovati", list));
    }

    @Operation(summary = "Get appointment statistics for a user", description = "Returns counts of total, pending, confirmed, completed and cancelled appointments")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Statistics retrieved successfully")
    })
    @GetMapping("/stats/{userId}")
    public ResponseEntity<ApiResponseData<Map<String, Long>>> getAppointmentStatistics(@PathVariable Long userId) {
        Map<String, Long> stats = appointmentService.getAppointmentStatistics(userId);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Statistiche appuntamenti utente", stats));
    }

    // ============================================
    // ACTION ENDPOINTS
    // ============================================

    @Operation(summary = "Confirm an appointment", description = "Confirms a PENDING or RESCHEDULED appointment")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Appointment confirmed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid appointment status"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User not authorized to confirm"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Appointment not found")
    })
    @PatchMapping("/{appointmentId}/confirm")
    public ResponseEntity<ApiResponseData<AppointmentDTO>> confirmAppointment(
            @PathVariable Long appointmentId,
            @RequestParam Long userId) {
        AppointmentDTO dto = appointmentService.confirmAppointment(appointmentId, userId);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Appuntamento confermato", dto));
    }

    @Operation(summary = "Cancel an appointment", description = "Cancels an appointment with optional reason")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Appointment cancelled successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User not authorized to cancel"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Appointment not found")
    })
    @PatchMapping("/{appointmentId}/cancel")
    public ResponseEntity<ApiResponseData<AppointmentDTO>> cancelAppointment(
            @PathVariable Long appointmentId,
            @RequestParam Long userId,
            @RequestParam(required = false) String reason) {
        AppointmentDTO dto = appointmentService.cancelAppointment(appointmentId, userId, reason);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Appuntamento annullato", dto));
    }

    @Operation(summary = "Reschedule an appointment", description = "Changes the date/time of an appointment")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Appointment rescheduled successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid date"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Appointment not found")
    })
    @PatchMapping("/{appointmentId}/reschedule")
    public ResponseEntity<ApiResponseData<AppointmentDTO>> rescheduleAppointment(
            @PathVariable Long appointmentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime newDatetime,
            @RequestParam(required = false) String reason) {
        AppointmentDTO dto = appointmentService.rescheduleAppointment(appointmentId, newDatetime, reason);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Appuntamento riprogrammato", dto));
    }

    @Operation(summary = "Complete an appointment", description = "Marks appointment as completed with optional rating and feedback")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Appointment completed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Appointment not found")
    })
    @PatchMapping("/{appointmentId}/complete")
    public ResponseEntity<ApiResponseData<AppointmentDTO>> completeAppointment(
            @PathVariable Long appointmentId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) String feedback) {
        AppointmentDTO dto = appointmentService.completeAppointment(appointmentId, rating, feedback);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Appuntamento completato", dto));
    }

    @Operation(summary = "Update appointment location", description = "Updates the address and notes for an appointment location")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Location updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Appointment not found")
    })
    @PatchMapping("/{appointmentId}/location")
    public ResponseEntity<ApiResponseData<AppointmentDTO>> updateAppointmentLocation(
            @PathVariable Long appointmentId,
            @RequestParam String address,
            @RequestParam(required = false) String notes) {
        AppointmentDTO dto = appointmentService.updateAppointmentLocation(appointmentId, address, notes);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Luogo aggiornato", dto));
    }
}