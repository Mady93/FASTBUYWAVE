import { DailyRevenueDTO } from "./dailyRevenueDTO.interface";
import { TotalsDTO } from "./totalsDTO.interface";

/**
 * @category Interfaces
 * 
 * @description Represents the revenue timeline for reporting purposes, including daily revenue data
 * and aggregated totals.
 * 
 * @interface RevenueTimelineDTO
 * @property {DailyRevenueDTO[]} data - Array of daily revenue records.
 * @property {TotalsDTO} totals - Aggregated totals across the timeline.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export interface RevenueTimelineDTO {
  data: DailyRevenueDTO[];
  totals: TotalsDTO;
}