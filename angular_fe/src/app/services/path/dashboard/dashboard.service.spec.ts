import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { ApiConfigService } from '../../api-config/api-config.service';
import { DashboardStatsDTO } from 'src/app/interfaces/dashboard/dashboardStatsDTO.interface';
import { RevenueTimelineDTO } from 'src/app/interfaces/dashboard/revenueTimelineDTO.interface';
import { TopProductDTO } from 'src/app/interfaces/dashboard/topProductDTO.interface';
import { CategoryStatsDTO } from 'src/app/interfaces/dashboard/categoryStatsDTO.interface';
import { UpcomingAppointmentDTO } from 'src/app/interfaces/dashboard/upcomingAppointmentDTO.interface';

class MockApiConfigService {
  apiDashboard = 'http://localhost:8080/api/dashboard';
}

const mockDashboardStats: DashboardStatsDTO = {
  revenue: {
    today: 1500,
    yesterday: 1200,
    percentageChange: 25,
  },
  orders: {
    today: 10,
    yesterday: 8,
    percentageChange: 25,
  } as any,
  activeProducts: 42,
  appointmentsTotal: 7,
};

const mockRevenueTimeline: RevenueTimelineDTO = {
  data: [
    { date: '2026-03-01', revenue: 500 } as any,
    { date: '2026-03-02', revenue: 750 } as any,
  ],
  totals: {
    currentPeriod: 1250,
    previousPeriod: 1000,
    percentageChange: 25,
  },
};

const mockTopProducts: TopProductDTO[] = [
  {
    id: 1,
    name: 'Product A',
    imageUrl: 'https://example.com/img.jpg',
    unitsSold: 50,
    revenue: 2500,
    trend: 'up',
    trendPercentage: 10,
    categoryName: 'Electronics',
  },
  {
    id: 2,
    name: 'Product B',
    imageUrl: 'https://example.com/img2.jpg',
    unitsSold: 30,
    revenue: 1500,
    trend: 'stable',
    trendPercentage: 0,
    categoryName: 'Books',
  },
];

const mockCategoryStats: CategoryStatsDTO[] = [
  {
    id: 1,
    name: 'Electronics',
    revenue: 5000,
    productCount: 20,
    orderCount: 15,
    percentageOfTotal: 60,
  },
  {
    id: 2,
    name: 'Books',
    revenue: 2000,
    productCount: 10,
    orderCount: 8,
    percentageOfTotal: 40,
  },
];

const mockUpcomingAppointments: UpcomingAppointmentDTO[] = [
  {
    id: 1,
    dateTime: '2026-04-01T10:00:00',
    requesterEmail: 'buyer@test.com',
    requesterPhone: '+39123456789',
    requesterName: 'Mario Rossi',
    organizerEmail: 'seller@test.com',
    organizerPhone: '+39987654321',
    organizerName: 'Luigi Bianchi',
    productName: 'Product A',
    status: 'CONFIRMED',
    type: 'IN_PERSON',
  },
];

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    spyOn(console, 'error');
    spyOn(console, 'log');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        DashboardService,
        { provide: ApiConfigService, useValue: new MockApiConfigService() },
      ],
    });

    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ============================================
  // CREATION TEST
  // ============================================

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ============================================
  // getStats
  // ============================================

  describe('getStats', () => {
    it('should GET stats for period "month"', () => {
      service.getStats('month').subscribe((result) => {
        expect(result).toEqual(mockDashboardStats);
        expect(result.activeProducts).toBe(42);
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === 'http://localhost:8080/api/dashboard/stats' &&
          r.params.get('period') === 'month',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockDashboardStats);
    });

    it('should GET stats for period "week"', () => {
      service.getStats('week').subscribe((result) => {
        expect(result).toBeTruthy();
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === 'http://localhost:8080/api/dashboard/stats' &&
          r.params.get('period') === 'week',
      );
      req.flush(mockDashboardStats);
    });

    it('should handle error on getStats', () => {
      service.getStats('month').subscribe({
        error: (err) => expect(err.status).toBe(500),
      });

      const req = httpMock.expectOne(
        (r) => r.url === 'http://localhost:8080/api/dashboard/stats',
      );
      req.flush('Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });
    });
  });

  // ============================================
  // getRevenueTimeline
  // ============================================

  describe('getRevenueTimeline', () => {
    it('should GET revenue timeline for period "month"', () => {
      service.getRevenueTimeline('month').subscribe((result) => {
        expect(result).toEqual(mockRevenueTimeline);
        expect(result.totals.currentPeriod).toBe(1250);
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === 'http://localhost:8080/api/dashboard/revenue' &&
          r.params.get('period') === 'month',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockRevenueTimeline);
    });

    it('should GET revenue timeline for period "day"', () => {
      service.getRevenueTimeline('day').subscribe((result) => {
        expect(result.data).toBeDefined();
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === 'http://localhost:8080/api/dashboard/revenue' &&
          r.params.get('period') === 'day',
      );
      req.flush(mockRevenueTimeline);
    });

    it('should handle error on getRevenueTimeline', () => {
      service.getRevenueTimeline('month').subscribe({
        error: (err) => expect(err.status).toBe(403),
      });

      const req = httpMock.expectOne(
        (r) => r.url === 'http://localhost:8080/api/dashboard/revenue',
      );
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });

  // ============================================
  // getTopProducts
  // ============================================

  describe('getTopProducts', () => {
    it('should GET top 5 products for period "month"', () => {
      service.getTopProducts(5, 'month').subscribe((result) => {
        expect(result.length).toBe(2);
        expect(result[0].name).toBe('Product A');
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === 'http://localhost:8080/api/dashboard/top-products' &&
          r.params.get('limit') === '5' &&
          r.params.get('period') === 'month',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTopProducts);
    });

    it('should GET top 10 products for period "week"', () => {
      service.getTopProducts(10, 'week').subscribe((result) => {
        expect(result).toBeTruthy();
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === 'http://localhost:8080/api/dashboard/top-products' &&
          r.params.get('limit') === '10' &&
          r.params.get('period') === 'week',
      );
      req.flush(mockTopProducts);
    });

    it('should return empty array when no top products', () => {
      service.getTopProducts(5, 'month').subscribe((result) => {
        expect(result.length).toBe(0);
      });

      const req = httpMock.expectOne(
        (r) => r.url === 'http://localhost:8080/api/dashboard/top-products',
      );
      req.flush([]);
    });

    it('should handle error on getTopProducts', () => {
      service.getTopProducts(5, 'month').subscribe({
        error: (err) => expect(err.status).toBe(500),
      });

      const req = httpMock.expectOne(
        (r) => r.url === 'http://localhost:8080/api/dashboard/top-products',
      );
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  // ============================================
  // getCategoriesStats
  // ============================================

  describe('getCategoriesStats', () => {
    it('should GET category stats for period "month"', () => {
      service.getCategoriesStats('month').subscribe((result) => {
        expect(result.length).toBe(2);
        expect(result[0].name).toBe('Electronics');
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === 'http://localhost:8080/api/dashboard/categories' &&
          r.params.get('period') === 'month',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockCategoryStats);
    });

    it('should GET category stats for period "week"', () => {
      service.getCategoriesStats('week').subscribe((result) => {
        expect(result).toBeTruthy();
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === 'http://localhost:8080/api/dashboard/categories' &&
          r.params.get('period') === 'week',
      );
      req.flush(mockCategoryStats);
    });

    it('should return empty array when no categories', () => {
      service.getCategoriesStats('month').subscribe((result) => {
        expect(result.length).toBe(0);
      });

      const req = httpMock.expectOne(
        (r) => r.url === 'http://localhost:8080/api/dashboard/categories',
      );
      req.flush([]);
    });

    it('should handle error on getCategoriesStats', () => {
      service.getCategoriesStats('month').subscribe({
        error: (err) => expect(err.status).toBe(401),
      });

      const req = httpMock.expectOne(
        (r) => r.url === 'http://localhost:8080/api/dashboard/categories',
      );
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  // ============================================
  // getUpcomingAppointments
  // ============================================

  describe('getUpcomingAppointments', () => {
    it('should GET upcoming appointments with limit and period', () => {
      service.getUpcomingAppointments(10, 'week').subscribe((result) => {
        expect(result.length).toBe(1);
        expect(result[0].productName).toBe('Product A');
        expect(result[0].status).toBe('CONFIRMED');
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === 'http://localhost:8080/api/dashboard/appointments' &&
          r.params.get('limit') === '10' &&
          r.params.get('period') === 'week',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockUpcomingAppointments);
    });

    it('should GET upcoming appointments for period "month"', () => {
      service.getUpcomingAppointments(5, 'month').subscribe((result) => {
        expect(result).toBeTruthy();
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === 'http://localhost:8080/api/dashboard/appointments' &&
          r.params.get('limit') === '5' &&
          r.params.get('period') === 'month',
      );
      req.flush(mockUpcomingAppointments);
    });

    it('should return empty array when no upcoming appointments', () => {
      service.getUpcomingAppointments(10, 'week').subscribe((result) => {
        expect(result.length).toBe(0);
      });

      const req = httpMock.expectOne(
        (r) => r.url === 'http://localhost:8080/api/dashboard/appointments',
      );
      req.flush([]);
    });

    it('should handle error on getUpcomingAppointments', () => {
      service.getUpcomingAppointments(10, 'week').subscribe({
        error: (err) => expect(err.status).toBe(500),
      });

      const req = httpMock.expectOne(
        (r) => r.url === 'http://localhost:8080/api/dashboard/appointments',
      );
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
