import { OrderStatsDTO } from "./orderStatsDTO.interface";
import { RevenueStatsDTO } from "./revenueStatsDTO.interface";

/**
 * @category Interfaces
 * 
 * @description Represents overall statistics displayed on the dashboard, 
 * including revenue, orders, active products, and total appointments.
 * 
 * @interface DashboardStatsDTO
 * @property {RevenueStatsDTO} revenue - Revenue statistics summary.
 * @property {OrderStatsDTO} orders - Order statistics summary.
 * @property {number} activeProducts - Total number of active products.
 * @property {number} appointmentsTotal - Total number of appointments.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export interface DashboardStatsDTO {
  revenue: RevenueStatsDTO;
  orders: OrderStatsDTO;
  activeProducts: number;
  appointmentsTotal: number;
}