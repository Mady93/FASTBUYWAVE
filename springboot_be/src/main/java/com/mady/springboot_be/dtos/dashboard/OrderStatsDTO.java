package com.mady.springboot_be.dtos.dashboard;

import java.io.Serializable;

/**
 * Data Transfer Object for order statistics with period comparison.
 * 
 * Contains order counts for current period (today) and previous period
 * (yesterday),
 * along with an automatically calculated percentage change.
 * 
 * The percentage change is computed in the constructor using the formula:
 * ((current - previous) * 100.0) / previous
 * 
 * Used as a component of DashboardStatsDTO for the main dashboard overview.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class OrderStatsDTO implements Serializable {

    private static final long serialVersionUID = 2025042200037L;

    private Long today;
    private Long yesterday;
    private Double percentageChange;

    /**
     * Default constructor.
     */
    public OrderStatsDTO() {
    }

    /**
     * Constructs an OrderStatsDTO with today and yesterday order counts.
     * 
     * The percentage change is automatically calculated from the provided values.
     * 
     * @param today     order count for the current period (e.g., today)
     * @param yesterday order count for the previous period (e.g., yesterday)
     */
    public OrderStatsDTO(Long today, Long yesterday) {
        this.today = today;
        this.yesterday = yesterday;
        this.percentageChange = calculatePercentageChange(today, yesterday);
    }

    /**
     * Calculates percentage change between current and previous period values.
     * 
     * @param current  current period value
     * @param previous previous period value for comparison
     * @return percentage change (positive for increase, negative for decrease),
     *         or 100.0 if previous is 0 and current is positive,
     *         or 0.0 if both are zero
     */
    private Double calculatePercentageChange(Long current, Long previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return ((current - previous) * 100.0) / previous;
    }

    /**
     * Returns the order count for the current period (today).
     * 
     * @return today's order count
     */
    public Long getToday() {
        return today;
    }

    /**
     * Sets the order count for the current period.
     * 
     * @param today the order count to set
     */
    public void setToday(Long today) {
        this.today = today;
    }

    /**
     * Returns the order count for the previous period (yesterday).
     * 
     * @return yesterday's order count
     */
    public Long getYesterday() {
        return yesterday;
    }

    /**
     * Sets the order count for the previous period.
     * 
     * @param yesterday the order count to set
     */
    public void setYesterday(Long yesterday) {
        this.yesterday = yesterday;
    }

    /**
     * Returns the percentage change between current and previous period values.
     * 
     * @return percentage change (positive for increase, negative for decrease)
     */
    public Double getPercentageChange() {
        return percentageChange;
    }

    /**
     * Sets the percentage change value.
     * 
     * @param percentageChange the percentage change to set
     */
    public void setPercentageChange(Double percentageChange) {
        this.percentageChange = percentageChange;
    }
}