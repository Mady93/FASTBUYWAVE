package com.mady.springboot_be.controllers.dasboard;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mady.springboot_be.dtos.dashboard.CategoryStatsDTO;
import com.mady.springboot_be.dtos.dashboard.DashboardStatsDTO;
import com.mady.springboot_be.dtos.dashboard.RevenueTimelineDTO;
import com.mady.springboot_be.dtos.dashboard.TopProductDTO;
import com.mady.springboot_be.dtos.dashboard.UpcomingAppointmentDTO;
import com.mady.springboot_be.services_impl.dashboard.DashboardServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST controller for dashboard statistics and analytics.
 * 
 * Provides key metrics including revenue, top products, category statistics,
 * and upcoming appointments for admin and user dashboards.
 * Documentation is provided via Swagger/OpenAPI annotations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Endpoints for dashboard statistics and analytics")
public class DashboardController {

    private final DashboardServiceImpl dashboardService;

    @Autowired
    public DashboardController(DashboardServiceImpl dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Operation(summary = "Get dashboard statistics", description = "Returns key metrics: revenue, orders, active products and appointments for the specified period")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Statistics retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid period parameter")
    })
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats(
            @RequestParam(defaultValue = "30d") String period) {
        return ResponseEntity.ok(dashboardService.getDashboardStats(period));
    }

    @Operation(summary = "Get revenue timeline", description = "Returns daily revenue data for the specified period with comparison to previous period")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Revenue timeline retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid period parameter")
    })
    @GetMapping("/revenue")
    public ResponseEntity<RevenueTimelineDTO> getRevenueTimeline(
            @RequestParam(defaultValue = "30d") String period) {
        return ResponseEntity.ok(dashboardService.getRevenueTimeline(period));
    }

    @Operation(summary = "Get top selling products", description = "Returns the best-selling products with units sold, revenue and trend analysis")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Top products retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid parameters")
    })
    @GetMapping("/top-products")
    public ResponseEntity<List<TopProductDTO>> getTopProducts(
            @RequestParam(defaultValue = "6") int limit,
            @RequestParam(defaultValue = "30d") String period) {
        return ResponseEntity.ok(dashboardService.getTopProducts(limit, period));
    }

    @Operation(summary = "Get categories statistics", description = "Returns sales statistics grouped by category with revenue and percentage of total")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Category statistics retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid period parameter")
    })
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryStatsDTO>> getCategoriesStats(
            @RequestParam(defaultValue = "30d") String period) {
        return ResponseEntity.ok(dashboardService.getCategoriesStats(period));
    }

    @Operation(summary = "Get upcoming appointments", description = "Returns upcoming confirmed appointments for the authenticated user")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Appointments retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid parameters"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "User not authenticated")
    })
    @GetMapping("/appointments")
    public ResponseEntity<List<UpcomingAppointmentDTO>> getUpcomingAppointments(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "30d") String period,
            @AuthenticationPrincipal String currentUserId) {

        Long userId = Long.valueOf(currentUserId);
        return ResponseEntity.ok(dashboardService.getUpcomingAppointments(limit, period, userId));
    }
}
