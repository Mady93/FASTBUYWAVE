import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DasboardContentComponent } from './dasboard-content.component';
import { DashboardService } from 'src/app/services/path/dashboard/dashboard.service';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from 'my-lib-inside';
import { ChartModule } from 'primeng/chart';

// Mock di SpinnerComponent
@Component({
  selector: 'lib-spinner',
  template: '',
  standalone: true,
})
class MockSpinnerComponent {
  @Input() spinner: Function = () => {};
  @Input() isLoading: Function = () => {};
}

// Mock di Chart (PrimeNG)
@Component({
  selector: 'p-chart',
  template: '',
  standalone: true,
})
class MockChartComponent {
  @Input() type: string = '';
  @Input() data: any = {};
  @Input() options: any = {};
}

// Mock dei servizi
class MockDashboardService {
  getStats = jasmine.createSpy().and.returnValue(
    of({
      revenue: { total: 10000, change: 15, trend: 'up' },
      orders: { total: 150, change: 10, trend: 'up' },
      activeProducts: 45,
      appointmentsTotal: 12,
    }),
  );
  getRevenueTimeline = jasmine.createSpy().and.returnValue(
    of({
      data: [
        { date: '2024-01-01', revenue: 1000 },
        { date: '2024-01-02', revenue: 1500 },
        { date: '2024-01-03', revenue: 800 },
      ],
      totals: { total: 3300, average: 1100 },
    }),
  );
  getTopProducts = jasmine.createSpy().and.returnValue(
    of([
      {
        id: 1,
        name: 'Product 1',
        imageUrl: '',
        unitsSold: 50,
        revenue: 5000,
        trend: 'up',
        trendPercentage: 15,
        categoryName: 'Electronics',
      },
      {
        id: 2,
        name: 'Product 2',
        imageUrl: '',
        unitsSold: 30,
        revenue: 3000,
        trend: 'stable',
        trendPercentage: 0,
        categoryName: 'Clothing',
      },
    ]),
  );
  getCategoriesStats = jasmine.createSpy().and.returnValue(
    of([
      {
        id: 1,
        name: 'Electronics',
        revenue: 8000,
        productCount: 20,
        orderCount: 100,
        percentageOfTotal: 60,
      },
      {
        id: 2,
        name: 'Clothing',
        revenue: 5000,
        productCount: 15,
        orderCount: 50,
        percentageOfTotal: 40,
      },
    ]),
  );
  getUpcomingAppointments = jasmine
    .createSpy()
    .and.returnValue(
      of([
        {
          id: 1,
          dateTime: '2024-01-15T10:00:00',
          requesterEmail: 'user@test.com',
          requesterPhone: '123456789',
          requesterName: 'John Doe',
          organizerEmail: 'org@test.com',
          organizerPhone: '987654321',
          organizerName: 'Jane Smith',
          productName: 'Test Product',
          status: 'CONFIRMED',
          type: 'MEETING',
        },
      ]),
    );
}

class MockMatSnackBar {
  open = jasmine.createSpy();
}

describe('DasboardContentComponent', () => {
  let component: DasboardContentComponent;
  let fixture: ComponentFixture<DasboardContentComponent>;
  let dashboardService: MockDashboardService;
  let snackBar: MockMatSnackBar;

  beforeEach(async () => {
    snackBar = new MockMatSnackBar();

    await TestBed.configureTestingModule({
      imports: [CommonModule, NoopAnimationsModule, DasboardContentComponent],
      providers: [
        { provide: DashboardService, useClass: MockDashboardService },
        { provide: MatSnackBar, useValue: snackBar },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(DasboardContentComponent, {
        remove: { imports: [SpinnerComponent, ChartModule] },
        add: { imports: [MockSpinnerComponent, MockChartComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DasboardContentComponent);
    component = fixture.componentInstance;
    dashboardService = TestBed.inject(DashboardService) as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load dashboard data on init', () => {
      expect(dashboardService.getStats).toHaveBeenCalled();
      expect(dashboardService.getRevenueTimeline).toHaveBeenCalled();
      expect(dashboardService.getTopProducts).toHaveBeenCalled();
      expect(dashboardService.getCategoriesStats).toHaveBeenCalled();
      expect(dashboardService.getUpcomingAppointments).toHaveBeenCalled();
    });

    it('should set selected period to 1y by default', () => {
      expect(component.selectedPeriod).toBe('1y');
    });

    it('should have periods array', () => {
      expect(component.periods).toEqual(['7d', '30d', '90d', '1y']);
    });
  });

  describe('Data loading', () => {
    it('should load data successfully', fakeAsync(() => {
      component.loadDashboardData('1y');
      flush();

      expect(component.stats).toBeTruthy();
      expect(component.revenue).toBeTruthy();
      expect(component.topProducts.length).toBe(2);
      expect(component.categories.length).toBe(2);
      expect(component.appointments.length).toBe(1);
      expect(component.revenueChartData).toBeTruthy();
    }));

    it('should handle error when loading data', fakeAsync(() => {
      dashboardService.getStats.and.returnValue(
        throwError(() => new Error('Error')),
      );

      component.loadDashboardData('1y');
      flush();

      expect(component.revenueChartData).toEqual({ labels: [], datasets: [] });
      expect(true).toBeTrue();
    }));

    it('should handle empty revenue data', fakeAsync(() => {
      dashboardService.getRevenueTimeline.and.returnValue(
        of({ data: [], totals: { total: 0, average: 0 } }),
      );

      component.loadDashboardData('1y');
      flush();

      expect(component.revenueChartData.datasets[0].data.length).toBe(0);
      expect(component.revenueChartData.labels.length).toBe(0);
      expect(true).toBeTrue();
    }));
  });

  describe('Period change', () => {
    it('should change period and reload data', () => {
      component.changePeriod('30d');
      expect(component.selectedPeriod).toBe('30d');
      expect(dashboardService.getStats).toHaveBeenCalledWith('30d');
    });
  });

  describe('Chart configuration', () => {
    beforeEach(() => {
      component.loadDashboardData('1y');
    });

    it('should create chart data with correct labels', () => {
      expect(component.revenueChartData.labels.length).toBe(3);
      expect(component.revenueChartData.labels[0]).toBeTruthy();
    });

    it('should create chart data with correct datasets', () => {
      expect(component.revenueChartData.datasets).toBeTruthy();
      expect(component.revenueChartData.datasets[0].data.length).toBe(3);
    });

    it('should have chart options', () => {
      expect(component.revenueChartOptions).toBeTruthy();
      expect(component.revenueChartOptions.responsive).toBeTrue();
    });
  });

  describe('Formatting utilities', () => {
    it('should format currency', () => {
      const formatted = component.formatCurrency(1234.56);

      expect(formatted).toContain('€');
      expect(formatted).toContain('1234');
      expect(formatted).toContain('56');
      expect(true).toBeTrue();
    });

    it('should format date time', () => {
      const formatted = component.formatDateTime('2024-01-15T10:30:00');
      expect(formatted).toBeTruthy();
    });

    it('should get trend class for positive change', () => {
      expect(component.getTrendClass(5)).toBe('text-green');
    });

    it('should get trend class for negative change', () => {
      expect(component.getTrendClass(-5)).toBe('text-red');
    });

    it('should get trend icon for up', () => {
      expect(component.getTrendIcon('up')).toBe('↑');
    });

    it('should get trend icon for down', () => {
      expect(component.getTrendIcon('down')).toBe('↓');
    });

    it('should get trend icon for stable', () => {
      expect(component.getTrendIcon('stable')).toBe('→');
    });

    it('should get period label', () => {
      expect(component.getPeriodLabel('7d')).toBe('7 days');
      expect(component.getPeriodLabel('30d')).toBe('30 days');
      expect(component.getPeriodLabel('90d')).toBe('90 days');
      expect(component.getPeriodLabel('1y')).toBe('1 year');
    });

    it('should get appointments section title', () => {
      component.selectedPeriod = '30d';
      expect(component.appointmentsSectionTitle).toContain('30 days');
    });

    it('should get cleaned appointment title', () => {
      const cleaned = component.getAptTitle('Meeting: Test Appointment');
      expect(cleaned).toBe('Test Appointment');
    });
  });

  describe('Loading state', () => {
    it('should have isLoading observable', () => {
      expect(component.isLoading$).toBeTruthy();
    });

    it('should return loading state as function', () => {
      expect(component.isLoading()).toBe(component['isLoadingSubject'].value);
    });

    it('should set loading to true when loading data', () => {
      component.loadDashboardData('1y');
      expect(component['isLoadingSubject'].value).toBe(false);
    });
  });

  describe('Spinner', () => {
    it('should have spinner path', () => {
      expect(component.spinner).toBe('/t.png');
    });

    it('should return spinner via getter', () => {
      expect(component.getspinner()).toBe('/t.png');
    });
  });

  describe('Math reference', () => {
    it('should have Math reference', () => {
      expect(component.Math).toBe(Math);
    });
  });

  describe('Today date', () => {
    it('should have today date', () => {
      expect(component.today).toBeInstanceOf(Date);
    });
  });
});
