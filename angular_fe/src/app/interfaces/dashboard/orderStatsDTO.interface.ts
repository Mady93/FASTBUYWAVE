/**
 * @category Interfaces
 * 
 * @description Represents order statistics for the dashboard, including today's orders,
 * yesterday's orders, and the percentage change between the two.
 * 
 * @interface OrderStatsDTO
 * @property {number} today - Number of orders placed today.
 * @property {number} yesterday - Number of orders placed yesterday.
 * @property {number} percentageChange - Percentage change in orders compared to yesterday.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export interface OrderStatsDTO {
  today: number;
  yesterday: number;
  percentageChange: number;
}