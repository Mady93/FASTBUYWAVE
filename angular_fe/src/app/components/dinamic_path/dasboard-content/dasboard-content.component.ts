import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { SpinnerComponent } from 'my-lib-inside';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { DashboardService } from 'src/app/services/path/dashboard/dashboard.service';
import { ChartModule } from 'primeng/chart';
import { DashboardStatsDTO } from 'src/app/interfaces/dashboard/dashboardStatsDTO.interface';
import { RevenueTimelineDTO } from 'src/app/interfaces/dashboard/revenueTimelineDTO.interface';
import { TopProductDTO } from 'src/app/interfaces/dashboard/topProductDTO.interface';
import { CategoryStatsDTO } from 'src/app/interfaces/dashboard/categoryStatsDTO.interface';
import { UpcomingAppointmentDTO } from 'src/app/interfaces/dashboard/upcomingAppointmentDTO.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { showSnackBar } from 'src/app/utils/snackbar.utils';
import {
  formatDateForPeriod,
  formatFullDate,
  getAptTitle,
  getMaxTicksLimit,
  getPeriodLabel,
} from 'src/app/utils/filter-display-utils';

/**
 * @category Components
 * 
 * @description Dashboard content component responsible for loading,
 * processing and displaying statistical data, charts and upcoming appointments.
 * Handles period selection, chart configuration and UI formatting utilities.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Component({
  selector: 'app-dasboard-content',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, ChartModule],
  templateUrl: './dasboard-content.component.html',
  styleUrls: ['./dasboard-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DasboardContentComponent implements OnInit {
  /**
   * @property category
   * @description The current category passed from the DashboardComponent via `ngComponentOutletInputs`.
   *
   * @source - DashboardComponent template:
   * ```html
   * <ng-container
   *   [ngComponentOutlet]="currentComponent"
   *   [ngComponentOutletInputs]="{ category: currentCategory }">
   * </ng-container>
   * ```
   *
   * @purpose - Represents the current route value (e.g., 'contact-requests', 'products', 'users').
   * @usage - Not directly used in this component's template yet, but available for future logic.
   * @type {string}
   */
  @Input() category!: string;

  /**
   * @description Angular platform identifier used to detect browser environment.
   */
  private platformId = inject(PLATFORM_ID);

  /**
   * @description Change detector reference used to manually trigger UI updates.
   */
  private cdr = inject(ChangeDetectorRef);

  /**
   * @description Service responsible for retrieving dashboard data.
   */
  private dashboardService = inject(DashboardService);

  /**
   * @description Snackbar service used to display user notifications.
   */
  private snackBar = inject(MatSnackBar);

  /**
   * @description Path to the spinner image used during loading state.
   */
  spinner = '/t.png';

  /**
   * @description Function wrapper returning spinner path for template bindings.
   * @returns {string}
   */
  getspinner: Function = (): string => this.spinner;

  /**
   * @description Internal loading state subject.
   */
  private isLoadingSubject = new BehaviorSubject<boolean>(true);

  /**
   * @description Observable exposing loading state to the template.
   */
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  /**
   * @description Returns current loading state.
   * @returns {boolean} True if loading is active.
   */
  get isLoading(): Function {
    return (): boolean => this.isLoadingSubject.value;
  }

  /**
   * @description Dashboard statistics data retrieved from backend.
   */
  stats?: DashboardStatsDTO;

  /**
   * @description Revenue timeline data used to build chart visualization.
   */
  revenue?: RevenueTimelineDTO;

  /**
   * @description List of top performing products.
   */
  topProducts: TopProductDTO[] = [];

  /**
   * @description Category statistics used for distribution insights.
   */
  categories: CategoryStatsDTO[] = [];

  /**
   * @description List of upcoming appointments.
   */
  appointments: UpcomingAppointmentDTO[] = [];

  /**
   * @description Currently selected period for dashboard data.
   */
  selectedPeriod = '1y';

  /**
   * @description Available period options for dashboard filtering.
   */
  periods = ['7d', '30d', '90d', '1y'];

  /**
   * @description Data object used by the chart component.
   */
  revenueChartData: any = null;

  /**
   * @description Configuration options for the chart component.
   */
  revenueChartOptions: any = null;

  /**
   * @description Reference to Math object for template usage.
   */
  Math = Math;

  /**
   * @description Current date reference used in the template.
   */
  today = new Date();

  /**
   * @inheritdoc
   * @description Initializes component lifecycle and triggers data loading in browser environment.
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboardData(this.selectedPeriod);
    }
  }

  /**
   * @description Loads dashboard data and prepares chart configuration.
   * @param {string} period - Selected time period.
   * @returns {void}
   */
  loadDashboardData(period: string): void {
    this.isLoadingSubject.next(true);

    forkJoin({
      stats: this.dashboardService.getStats(period),
      revenue: this.dashboardService.getRevenueTimeline(period),
      topProducts: this.dashboardService.getTopProducts(6, period),
      categories: this.dashboardService.getCategoriesStats(period),
      appointments: this.dashboardService.getUpcomingAppointments(10, period),
    }).subscribe({
      next: (data) => {
        this.stats = data.stats;
        this.revenue = data.revenue;

        if (this.revenue?.data && Array.isArray(this.revenue.data)) {
          const chartLabels: string[] = [];
          const chartData: number[] = [];
          const chartColors: string[] = [];

          // Usa i dati completi dal backend
          this.revenue.data.forEach((d) => {
            chartLabels.push(formatDateForPeriod(d.date, period));
            chartData.push(d.revenue);
            chartColors.push(
              d.revenue > 0 ? 'rgba(59, 130, 246, 1)' : 'rgba(239, 68, 68, 1)',
            );
          });

          // Crea gradiente per il background
          const ctx = document.createElement('canvas').getContext('2d');
          let blueGradient: any = null;
          let redGradient: any = null;

          if (ctx) {
            blueGradient = ctx.createLinearGradient(0, 0, 0, 300);
            blueGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
            blueGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.15)');
            blueGradient.addColorStop(1, 'rgba(59, 130, 246, 0.02)');

            redGradient = ctx.createLinearGradient(0, 0, 0, 300);
            redGradient.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
            redGradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.1)');
            redGradient.addColorStop(1, 'rgba(239, 68, 68, 0.02)');
          }

          this.revenueChartData = {
            labels: chartLabels,
            datasets: [
              {
                label: 'Revenue',
                data: chartData,
                fill: true,
                backgroundColor: (context: any) => {
                  const index = context.dataIndex;
                  return chartData[index] > 0 ? blueGradient : redGradient;
                },
                borderColor: (context: any) => {
                  const index = context.dataIndex;
                  return chartData[index] > 0
                    ? 'rgba(59, 130, 246, 1)'
                    : 'rgba(239, 68, 68, 1)';
                },
                borderWidth: 3,
                tension: 0.4,
                pointRadius: (context: any) => {
                  return chartData[context.dataIndex] > 0 ? 5 : 3;
                },
                pointHoverRadius: 8,
                pointBackgroundColor: chartColors,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: chartColors,
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 3,
                segment: {
                  borderColor: (context: any) => {
                    const p0 = context.p0DataIndex;
                    return chartData[p0] > 0
                      ? 'rgba(59, 130, 246, 1)'
                      : 'rgba(239, 68, 68, 1)';
                  },
                  backgroundColor: (context: any) => {
                    const p0 = context.p0DataIndex;
                    return chartData[p0] > 0 ? blueGradient : redGradient;
                  },
                },
              },
            ],
          };

          this.revenueChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: (context: any) => {
                  const dataIndex = context.tooltip.dataPoints[0].dataIndex;
                  return chartData[dataIndex] > 0
                    ? 'rgba(59, 130, 246, 1)'
                    : 'rgba(239, 68, 68, 1)';
                },
                borderWidth: 2,
                padding: 12,
                displayColors: false,
                callbacks: {
                  title: (tooltipItems: any) => {
                    const dataIndex = tooltipItems[0].dataIndex;
                    const originalDate = this.revenue!.data[dataIndex].date;
                    return formatFullDate(originalDate);
                  },
                  label: (tooltipItem: any) => {
                    const value = tooltipItem.raw;
                    if (value === 0) {
                      return 'No sales yet';
                    }
                    return 'Revenue: ' + this.formatCurrency(value);
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                suggestedMax: 5000, // massimo consigliato: 5k
                border: { display: false },
                grid: {
                  color: 'rgba(0,0,0,0.05)',
                  drawTicks: false,
                },
                ticks: {
                  padding: 10,
                  color: '#6b7280',
                  font: { size: 12, weight: '500' },
                  callback: (value: number | string) =>
                    typeof value === 'number'
                      ? this.formatCurrency(value)
                      : value,
                },
              },
              x: {
                border: { display: false },
                grid: { display: false },
                ticks: {
                  padding: 10,
                  color: '#6b7280',
                  font: { size: 12, weight: '500' },
                  maxRotation: 45,
                  minRotation: 0,
                  autoSkip: true,
                  maxTicksLimit: getMaxTicksLimit(period),
                },
              },
            },
          };
        } else {
          console.warn('No revenue data available');
          this.revenueChartData = { labels: [], datasets: [] };
          this.revenueChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
          };
        }

        this.topProducts = data.topProducts || [];
        this.categories = data.categories || [];
        this.appointments = data.appointments || [];
        if (this.appointments.length > 0) {
        }

        showSnackBar(this.snackBar, 'Dashboard data loaded successfully');

        this.isLoadingSubject.next(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        showSnackBar(this.snackBar, 'Error loading dashboard data');
        this.revenueChartData = { labels: [], datasets: [] };
        this.revenueChartOptions = {
          responsive: true,
          maintainAspectRatio: false,
        };
        this.isLoadingSubject.next(false);
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * @description Changes selected period and reloads dashboard data.
   * @param {string} period - Selected time range.
   * @returns {void}
   */
  changePeriod(period: string): void {
    this.selectedPeriod = period;
    this.loadDashboardData(this.selectedPeriod);
  }

  /**
   * @description Formats a numeric value into currency format.
   * @param {number} value - Value to format.
   * @returns {string} Formatted currency string.
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  }

  /**
   * @description Formats a date and time string for display in appointments.
   * @param {string} dateStr - Date string to format.
   * @returns {string} Formatted date-time string.
   */
  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * @description Determines CSS class based on trend value.
   * @param {number} change - Numeric trend value.
   * @returns {string} CSS class name.
   */
  getTrendClass(change: number): string {
    return change >= 0 ? 'text-green' : 'text-red';
  }

  /**
   * @description Returns visual icon representing trend direction.
   * @param {string} trend - Trend direction.
   * @returns {string} Icon string.
   */
  getTrendIcon(trend: string): string {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  }

  /**
   * @description Returns formatted title for appointments section.
   * @returns {string} Section title with selected period.
   */
  get appointmentsSectionTitle(): string {
    return `Appointments · ${this.getPeriodLabel(this.selectedPeriod)}`;
  }

  /**
   * @description Converts period identifier into human-readable label.
   * @param {string} period - Period key.
   * @returns {string} Display label.
   */
  getPeriodLabel = getPeriodLabel;

  /**
   * @description Cleans appointment title by removing predefined prefixes.
   * @param {string} name - Original appointment title.
   * @returns {string} Cleaned appointment title.
   */
  getAptTitle = getAptTitle;
}
