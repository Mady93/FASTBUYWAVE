package com.mady.springboot_be.services.dashboard;

import java.util.List;

import com.mady.springboot_be.dtos.dashboard.CategoryStatsDTO;
import com.mady.springboot_be.dtos.dashboard.DashboardStatsDTO;
import com.mady.springboot_be.dtos.dashboard.RevenueTimelineDTO;
import com.mady.springboot_be.dtos.dashboard.TopProductDTO;
import com.mady.springboot_be.dtos.dashboard.UpcomingAppointmentDTO;

/**
 * Service interface for dashboard statistics and analytics.
 * 
 * Provides methods for retrieving key business metrics including:
 * - Revenue statistics (total, period comparison)
 * - Order statistics
 * - Top selling products with trend analysis
 * - Category sales distribution
 * - Upcoming appointments for user dashboard
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface DashboardService {

    /**
     * Retrieves main dashboard statistics for a given period.
     * 
     * @param period time period (7d, 30d, 90d, 1y)
     * @return DashboardStatsDTO with revenue, orders, products, appointments
     */
    public DashboardStatsDTO getDashboardStats(String period);

    /**
     * Retrieves revenue timeline data for dashboard charts.
     * 
     * @param period time period (7d, 30d, 90d, 1y)
     * @return RevenueTimelineDTO with daily revenue and totals
     */
    public RevenueTimelineDTO getRevenueTimeline(String period);

    /**
     * Retrieves top selling products with trend analysis.
     * 
     * @param limit  maximum number of products to return
     * @param period time period for sales calculation
     * @return list of TopProductDTO with trend (up/down/stable)
     */
    public List<TopProductDTO> getTopProducts(int limit, String period);

    /**
     * Retrieves sales statistics grouped by category.
     * 
     * @param period time period for sales calculation
     * @return list of CategoryStatsDTO with revenue and percentage of total
     */
    public List<CategoryStatsDTO> getCategoriesStats(String period);

    /**
     * Retrieves upcoming confirmed appointments for a user.
     * 
     * @param limit  maximum number of appointments to return
     * @param period time period to consider
     * @param userId the ID of the user
     * @return list of UpcomingAppointmentDTO
     */
    public List<UpcomingAppointmentDTO> getUpcomingAppointments(int limit, String period, Long userId);

}
