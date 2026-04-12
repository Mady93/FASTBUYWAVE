/**
 * @category Interfaces
 * 
 * @description Represents daily revenue statistics.
 * 
 * @interface DailyRevenueDTO
 * @property {string} date - The date for the revenue data (LocalDate as a string, e.g., "YYYY-MM-DD").
 * @property {number} revenue - Total revenue for the given date.
 * @property {number} orders - Total number of orders placed on the given date.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export interface DailyRevenueDTO {
  date: string; // LocalDate come stringa
  revenue: number;
  orders: number;
}
