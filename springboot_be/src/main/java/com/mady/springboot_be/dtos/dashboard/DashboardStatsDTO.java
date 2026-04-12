package com.mady.springboot_be.dtos.dashboard;

import java.io.Serializable;

/**
 * Data Transfer Object for main dashboard statistics.
 * 
 * Aggregates all key performance indicators (KPIs) for the dashboard overview,
 * including revenue statistics, order statistics, active products count,
 * and total appointments in the selected period.
 * 
 * Used as the main response for the GET /api/dashboard/stats endpoint.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class DashboardStatsDTO implements Serializable {

    private static final long serialVersionUID = 2025042200036L;

    private RevenueStatsDTO revenue;
    private OrderStatsDTO orders;
    private Integer activeProducts;
    private Integer appointmentsTotal;

    /**
     * Default constructor.
     */
    public DashboardStatsDTO() {
    }

    /**
     * Constructs a DashboardStatsDTO with all statistics.
     * 
     * @param revenue           revenue statistics (total and previous period
     *                          comparison)
     * @param orders            order statistics (total and previous period
     *                          comparison)
     * @param activeProducts    number of active products in the system
     * @param appointmentsTotal total number of appointments in the selected period
     */
    public DashboardStatsDTO(RevenueStatsDTO revenue, OrderStatsDTO orders,
            Integer activeProducts, Integer appointmentsTotal) {
        this.revenue = revenue;
        this.orders = orders;
        this.activeProducts = activeProducts;
        this.appointmentsTotal = appointmentsTotal;
    }

    /**
     * Returns the revenue statistics.
     * 
     * @return RevenueStatsDTO containing total revenue and previous period
     *         comparison
     */
    public RevenueStatsDTO getRevenue() {
        return revenue;
    }

    /**
     * Sets the revenue statistics.
     * 
     * @param revenue the revenue statistics to set
     */
    public void setRevenue(RevenueStatsDTO revenue) {
        this.revenue = revenue;
    }

    /**
     * Returns the order statistics.
     * 
     * @return OrderStatsDTO containing total orders and previous period comparison
     */
    public OrderStatsDTO getOrders() {
        return orders;
    }

    /**
     * Sets the order statistics.
     * 
     * @param orders the order statistics to set
     */
    public void setOrders(OrderStatsDTO orders) {
        this.orders = orders;
    }

    /**
     * Returns the number of active products.
     * 
     * @return count of active (not deleted) products
     */
    public Integer getActiveProducts() {
        return activeProducts;
    }

    /**
     * Sets the number of active products.
     * 
     * @param activeProducts the count of active products to set
     */
    public void setActiveProducts(Integer activeProducts) {
        this.activeProducts = activeProducts;
    }

    /**
     * Returns the total number of appointments in the selected period.
     * 
     * @return total count of appointments
     */
    public Integer getAppointmentsTotal() {
        return appointmentsTotal;
    }

    /**
     * Sets the total number of appointments in the selected period.
     * 
     * @param appointmentsTotal the total count of appointments to set
     */
    public void setAppointmentsTotal(Integer appointmentsTotal) {
        this.appointmentsTotal = appointmentsTotal;
    }
}