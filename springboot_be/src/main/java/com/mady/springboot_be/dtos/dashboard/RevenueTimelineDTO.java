package com.mady.springboot_be.dtos.dashboard;

import java.io.Serializable;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

/**
 * Data Transfer Object for revenue timeline data used in dashboard charts.
 * 
 * Contains daily revenue data for the selected period plus totals comparison
 * between current and previous periods with percentage change.
 * 
 * Used as the response for the GET /api/dashboard/revenue endpoint.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class RevenueTimelineDTO implements Serializable {

    private static final long serialVersionUID = 2025042200039L;

    private List<DailyRevenueDTO> data;
    private TotalsDTO totals;

    /**
     * Default constructor.
     */
    public RevenueTimelineDTO() {
    }

    /**
     * Constructs a RevenueTimelineDTO with daily data and totals.
     * 
     * @param data   list of daily revenue data points
     * @param totals aggregated totals for current and previous periods
     */
    public RevenueTimelineDTO(List<DailyRevenueDTO> data, TotalsDTO totals) {
        this.data = data;
        this.totals = totals;
    }

    /**
     * Returns the list of daily revenue data points.
     * 
     * @return list of DailyRevenueDTO, one for each day in the period
     */
    public List<DailyRevenueDTO> getData() {
        return data;
    }

    /**
     * Sets the list of daily revenue data points.
     * 
     * @param data the list to set
     */
    public void setData(List<DailyRevenueDTO> data) {
        this.data = data;
    }

    /**
     * Returns the totals comparison data.
     * 
     * @return TotalsDTO with current period, previous period, and percentage change
     */
    public TotalsDTO getTotals() {
        return totals;
    }

    /**
     * Sets the totals comparison data.
     * 
     * @param totals the TotalsDTO to set
     */
    public void setTotals(TotalsDTO totals) {
        this.totals = totals;
    }

    /**
     * Data Transfer Object for daily revenue data point.
     * 
     * Contains revenue and order count for a single day in the timeline.
     */
    public static class DailyRevenueDTO implements Serializable {

        private static final long serialVersionUID = 2025042200040L;
        private LocalDate date;
        private BigDecimal revenue;
        private Long orders;

        /**
         * Constructs a DailyRevenueDTO with date, revenue, and orders.
         * 
         * @param date    the date of the data point
         * @param revenue total revenue for the day
         * @param orders  total number of orders for the day
         */
        public DailyRevenueDTO(LocalDate date, BigDecimal revenue, Long orders) {
            this.date = date;
            this.revenue = revenue;
            this.orders = orders;
        }

        /**
         * Returns the date of the data point.
         * 
         * @return the date
         */
        public LocalDate getDate() {
            return date;
        }

        /**
         * Sets the date of the data point.
         * 
         * @param date the date to set
         */
        public void setDate(LocalDate date) {
            this.date = date;
        }

        /**
         * Returns the total revenue for the day.
         * 
         * @return the revenue
         */
        public BigDecimal getRevenue() {
            return revenue;
        }

        /**
         * Sets the total revenue for the day.
         * 
         * @param revenue the revenue to set
         */
        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }

        /**
         * Returns the total number of orders for the day.
         * 
         * @return the orders
         */
        public Long getOrders() {
            return orders;
        }

        /**
         * Sets the total number of orders for the day.
         * 
         * @param orders the orders to set
         */
        public void setOrders(Long orders) {
            this.orders = orders;
        }
    }

    /**
     * Data Transfer Object for revenue totals comparison.
     * 
     * Contains total revenue for current period, previous period,
     * and the calculated percentage change between them.
     */
    public static class TotalsDTO implements Serializable {

        private static final long serialVersionUID = 2025042200041L;

        private BigDecimal currentPeriod;
        private BigDecimal previousPeriod;
        private Double percentageChange;

        /**
         * Constructs a TotalsDTO with current and previous period values.
         * Automatically calculates the percentage change.
         * 
         * @param currentPeriod  total revenue for the current period
         * @param previousPeriod total revenue for the previous period
         */
        public TotalsDTO(BigDecimal currentPeriod, BigDecimal previousPeriod) {
            this.currentPeriod = currentPeriod;
            this.previousPeriod = previousPeriod;
            this.percentageChange = calculateChange(currentPeriod, previousPeriod);
        }

        /**
         * Calculates percentage change between current and previous period revenue.
         * 
         * Uses BigDecimal arithmetic with 4 decimal places precision.
         * 
         * @param current  current period revenue
         * @param previous previous period revenue for comparison
         * @return percentage change (positive for increase, negative for decrease),
         *         or 100.0 if previous is 0 and current is positive,
         *         or 0.0 if both are zero
         */
        private Double calculateChange(BigDecimal current, BigDecimal previous) {
            if (previous.compareTo(BigDecimal.ZERO) == 0) {
                return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
            }
            return current.subtract(previous)
                    .divide(previous, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .doubleValue();
        }

        /**
         * Returns the total revenue for the current period.
         * 
         * @return current period revenue
         */
        public BigDecimal getCurrentPeriod() {
            return currentPeriod;
        }

        /**
         * Sets the total revenue for the current period.
         * 
         * @param currentPeriod the revenue to set
         */
        public void setCurrentPeriod(BigDecimal currentPeriod) {
            this.currentPeriod = currentPeriod;
        }

        /**
         * Returns the total revenue for the previous period.
         * 
         * @return previous period revenue
         */
        public BigDecimal getPreviousPeriod() {
            return previousPeriod;
        }

        /**
         * Sets the total revenue for the previous period.
         * 
         * @param previousPeriod the revenue to set
         */
        public void setPreviousPeriod(BigDecimal previousPeriod) {
            this.previousPeriod = previousPeriod;
        }

        /**
         * Returns the percentage change between current and previous period revenue.
         * 
         * @return percentage change (positive for increase, negative for decrease)
         */
        public Double getPercentageChange() {
            return percentageChange;
        }

        /**
         * Sets the percentage change between current and previous period revenue.
         * 
         * @param percentageChange the percentage change to set
         */
        public void setPercentageChange(Double percentageChange) {
            this.percentageChange = percentageChange;
        }
    }
}