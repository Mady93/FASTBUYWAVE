/**
 * @category Interfaces
 * 
 * @description Represents revenue statistics for the dashboard, including today's revenue,
 * yesterday's revenue, and the percentage change between the two.
 * 
 * @interface RevenueStatsDTO
 * @property {number} today - Revenue generated today.
 * @property {number} yesterday - Revenue generated yesterday.
 * @property {number} percentageChange - Percentage change in revenue compared to yesterday.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export interface RevenueStatsDTO {
  today: number;
  yesterday: number;
  percentageChange: number;
}