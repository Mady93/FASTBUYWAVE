import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryStatsDTO } from 'src/app/interfaces/dashboard/categoryStatsDTO.interface';
import { DashboardStatsDTO } from 'src/app/interfaces/dashboard/dashboardStatsDTO.interface';
import { RevenueTimelineDTO } from 'src/app/interfaces/dashboard/revenueTimelineDTO.interface';
import { TopProductDTO } from 'src/app/interfaces/dashboard/topProductDTO.interface';
import { UpcomingAppointmentDTO } from 'src/app/interfaces/dashboard/upcomingAppointmentDTO.interface';
import { ApiConfigService } from '../../api-config/api-config.service';

/**
 * @category Services
 * 
 * @description
 * Provides methods to retrieve dashboard statistics, revenue timelines, top products,
 * category-specific statistics, and upcoming appointments for the application.
 * All data is fetched from the backend via HTTP GET requests.
 *
 * @example
 * ```typescript
 * constructor(private dashboardService: DashboardService) {}
 *
 * // Get overall stats for the current month
 * this.dashboardService.getStats('month').subscribe(stats => console.log(stats));
 *
 * // Get revenue timeline
 * this.dashboardService.getRevenueTimeline('month').subscribe(revenue => console.log(revenue));
 *
 * // Get top 5 products for the last month
 * this.dashboardService.getTopProducts(5, 'month').subscribe(topProducts => console.log(topProducts));
 *
 * // Get category statistics
 * this.dashboardService.getCategoriesStats('month').subscribe(categories => console.log(categories));
 *
 * // Get upcoming appointments
 * this.dashboardService.getUpcomingAppointments(10, 'week').subscribe(appointments => console.log(appointments));
 * ```
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  /**
   * @constructor
   * @description Initializes the DashboardService with required dependencies.
   *
   * @param {HttpClient} http - Angular HttpClient for making API requests
   * @param {ApiConfigService} apiConfig - Service providing API base URLs and configuration
   */
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * @description Retrieves overall dashboard statistics for a given period.
   *
   * @param {string} period - Period for statistics (e.g., 'day', 'week', 'month', 'year')
   * @returns {Observable<DashboardStatsDTO>} Observable containing overall dashboard stats
   */
  getStats(period: string): Observable<DashboardStatsDTO> {
    const params = new HttpParams().set('period', period);
    return this.http.get<DashboardStatsDTO>(
      `${this.apiConfig.apiDashboard}/stats`,
      { params },
    );
  }

  /**
   * @description Retrieves revenue timeline data for a given period.
   *
   * @param {string} period - Period for revenue timeline (e.g., 'day', 'week', 'month')
   * @returns {Observable<RevenueTimelineDTO>} Observable containing revenue timeline
   */
  getRevenueTimeline(period: string): Observable<RevenueTimelineDTO> {
    const params = new HttpParams().set('period', period);
    return this.http.get<RevenueTimelineDTO>(
      `${this.apiConfig.apiDashboard}/revenue`,
      { params },
    );
  }

  /**
   * @description Retrieves the top products based on sales for a given period.
   *
   * @param {number} limit - Maximum number of top products to return
   * @param {string} period - Period for top products (e.g., 'day', 'week', 'month')
   * @returns {Observable<TopProductDTO[]>} Observable array of top product data
   */
  getTopProducts(limit: number, period: string): Observable<TopProductDTO[]> {
    const params = new HttpParams().set('limit', limit).set('period', period);
    return this.http.get<TopProductDTO[]>(
      `${this.apiConfig.apiDashboard}/top-products`,
      { params },
    );
  }

  /**
   * @description Retrieves statistics for product categories for a given period.
   *
   * @param {string} period - Period for category statistics (e.g., 'week', 'month')
   * @returns {Observable<CategoryStatsDTO[]>} Observable array of category statistics
   */
  getCategoriesStats(period: string): Observable<CategoryStatsDTO[]> {
    const params = new HttpParams().set('period', period);
    return this.http.get<CategoryStatsDTO[]>(
      `${this.apiConfig.apiDashboard}/categories`,
      { params },
    );
  }

  /**
   * @description Retrieves upcoming appointments within a specific period.
   *
   * @param {number} limit - Maximum number of appointments to return
   * @param {string} period - Period for upcoming appointments (e.g., 'week', 'month')
   * @returns {Observable<UpcomingAppointmentDTO[]>} Observable array of upcoming appointments
   */
  getUpcomingAppointments(
    limit: number,
    period: string,
  ): Observable<UpcomingAppointmentDTO[]> {
    const params = new HttpParams().set('limit', limit).set('period', period);
    return this.http.get<UpcomingAppointmentDTO[]>(
      `${this.apiConfig.apiDashboard}/appointments`,
      { params },
    );
  }
}
