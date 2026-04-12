package com.mady.springboot_be.dtos.dashboard;

import java.io.Serializable;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Data Transfer Object for revenue statistics with period comparison.
 * 
 * Contains revenue amounts for current period (today) and previous period
 * (yesterday),
 * along with an automatically calculated percentage change using precise
 * BigDecimal arithmetic.
 * 
 * The percentage change is computed in the constructor using the formula:
 * ((current - previous) / previous) * 100, with 4 decimal places precision.
 * 
 * Used as a component of DashboardStatsDTO for the main dashboard overview.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class RevenueStatsDTO implements Serializable {

    private static final long serialVersionUID = 2025042200038L;

    private BigDecimal today;
    private BigDecimal yesterday;
    private Double percentageChange;

    /**
     * Default constructor.
     */
    public RevenueStatsDTO() {
    }

    /**
     * Constructs a RevenueStatsDTO with today and yesterday revenue amounts.
     * 
     * The percentage change is automatically calculated from the provided values
     * using precise BigDecimal arithmetic to avoid floating-point precision issues.
     * 
     * @param today     revenue amount for the current period (e.g., today)
     * @param yesterday revenue amount for the previous period (e.g., yesterday)
     */
    public RevenueStatsDTO(BigDecimal today, BigDecimal yesterday) {
        this.today = today;
        this.yesterday = yesterday;
        this.percentageChange = calculatePercentageChange(today, yesterday);
    }

    /**
     * Calculates percentage change between current and previous period revenue.
     * 
     * Uses BigDecimal arithmetic with 4 decimal places precision
     * (RoundingMode.HALF_UP)
     * to ensure accurate percentage calculations without floating-point errors.
     * 
     * @param current  current period revenue
     * @param previous previous period revenue for comparison
     * @return percentage change (positive for increase, negative for decrease),
     *         or 100.0 if previous is 0 and current is positive,
     *         or 0.0 if both are zero
     */
    private Double calculatePercentageChange(BigDecimal current, BigDecimal previous) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .doubleValue();
    }

    /**
     * Returns the revenue amount for the current period (today).
     * 
     * @return today's revenue
     */
    public BigDecimal getToday() {
        return today;
    }

    /**
     * Sets the revenue amount for the current period.
     * 
     * @param today the revenue amount to set
     */

    public void setToday(BigDecimal today) {
        this.today = today;
    }

    /**
     * Returns the revenue amount for the previous period (yesterday).
     * 
     * @return yesterday's revenue
     */
    public BigDecimal getYesterday() {
        return yesterday;
    }

    /**
     * Sets the revenue amount for the previous period.
     * 
     * @param yesterday the revenue amount to set
     */
    public void setYesterday(BigDecimal yesterday) {
        this.yesterday = yesterday;
    }

    /**
     * Returns the percentage change between current and previous period revenues.
     * 
     * @return percentage change (positive for increase, negative for decrease)
     */
    public Double getPercentageChange() {
        return percentageChange;
    }

    /**
     * Sets the percentage change.
     * 
     * @param percentageChange the percentage to set
     */
    public void setPercentageChange(Double percentageChange) {
        this.percentageChange = percentageChange;
    }
}