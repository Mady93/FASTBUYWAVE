/**
 * @category Interfaces
 * 
 * @description Represents summary totals for a specific period, including change from the previous period.
 * 
 * @interface TotalsDTO
 * @property {number} currentPeriod - Total value for the current period.
 * @property {number} previousPeriod - Total value for the previous period.
 * @property {number} percentageChange - Percentage change between current and previous period.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export interface TotalsDTO {
  currentPeriod: number;
  previousPeriod: number;
  percentageChange: number;
}
