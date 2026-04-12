import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AppointmentService } from './appointment.service';
import { ApiConfigService } from '../../api-config/api-config.service';
import { AppointmentDTO } from 'src/app/interfaces/dtos/contact/appointment_dto.interface';
import { ApiResponseData } from 'src/app/interfaces/dettails/api_response_data';

class MockApiConfigService {
  apiAppointments = 'http://localhost:8080/api/appointments';
}

const mockAppointment: AppointmentDTO = {
  appointmentId: 1,
  requester: { userId: 1, username: 'requester' } as any,
  organizer: { userId: 2, username: 'organizer' } as any,
  product: { productId: 1, price: 100, active: true, condition: 'NEW', stockQuantity: 1 } as any,
  title: 'Test Appointment',
  description: 'Test description',
  appointmentDatetime: '2026-04-01T10:00:00Z',
  durationMinutes: 60,
  locationType: 'IN_PERSON' as any,
  locationAddress: 'Via Roma 10, Rome',
  status: 'PENDING' as any,
  createdAt: '2026-03-01T00:00:00Z',
  reminderSent: false,
  active: true,
};

const mockResponse = <T>(data: T): ApiResponseData<T> => ({
  status: 'success',
  message: 'OK',
  data,
});

describe('AppointmentService', () => {
  let service: AppointmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        AppointmentService,
        { provide: ApiConfigService, useValue: new MockApiConfigService() },
      ],
    });

    service = TestBed.inject(AppointmentService);
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
  // GET BY ID
  // ============================================

  it('should get appointment by id', () => {
    service.getAppointmentById(1).subscribe((result) => {
      expect(result.data).toEqual(mockAppointment);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/appointments/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse(mockAppointment));
  });

  // ============================================
  // GET BY REQUESTER / ORGANIZER
  // ============================================

  it('should get appointments by requester', () => {
    service.getAppointmentsByRequester(1).subscribe((result) => {
      expect(result.data.length).toBe(1);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/appointments/requester/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse([mockAppointment]));
  });

  it('should get appointments by organizer', () => {
    service.getAppointmentsByOrganizer(2).subscribe((result) => {
      expect(result.data.length).toBe(1);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/appointments/organizer/2');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse([mockAppointment]));
  });

  // ============================================
  // GET USER APPOINTMENTS
  // ============================================

  it('should get all user appointments', () => {
    const mockData = { requested: [mockAppointment], organized: [] };

    service.getUserAppointments(1).subscribe((result) => {
      expect(result.data.requested.length).toBe(1);
      expect(result.data.organized.length).toBe(0);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/appointments/user/1/all');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse(mockData));
  });

  // ============================================
  // GET CONFIRMED / TODAY / WEEK
  // ============================================

  it('should get confirmed appointments', () => {
    service.getConfirmedAppointments(1).subscribe((result) => {
      expect(result.data).toEqual([mockAppointment]);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/appointments/user/1/confirmed');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse([mockAppointment]));
  });

  it('should get today appointments', () => {
    service.getTodayAppointments(1).subscribe((result) => {
      expect(result.data).toEqual([mockAppointment]);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/appointments/user/1/today');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse([mockAppointment]));
  });

  it('should get this week appointments', () => {
    service.getThisWeekAppointments(1).subscribe((result) => {
      expect(result.data).toEqual([mockAppointment]);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/appointments/user/1/week');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse([mockAppointment]));
  });

  // ============================================
  // GET BY DATE RANGE
  // ============================================

  it('should get appointments by date range', () => {
    const start = '2026-04-01T00:00:00Z';
    const end = '2026-04-30T23:59:59Z';

    service.getAppointmentsByDateRange(1, start, end).subscribe((result) => {
      expect(result.data).toEqual([mockAppointment]);
    });

    const req = httpMock.expectOne((r) =>
      r.url === 'http://localhost:8080/api/appointments/user/1/range' &&
      r.params.get('start') === start &&
      r.params.get('end') === end
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse([mockAppointment]));
  });

  // ============================================
  // GET CALENDAR
  // ============================================

  it('should get calendar appointments', () => {
    service.getCalendarAppointments(1, 2026, 4).subscribe((result) => {
      expect(result.data).toEqual([]);
    });

    const req = httpMock.expectOne((r) =>
      r.url === 'http://localhost:8080/api/appointments/user/1/calendar' &&
      r.params.get('year') === '2026' &&
      r.params.get('month') === '4'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse([]));
  });

  // ============================================
  // GET STATISTICS
  // ============================================

  it('should get appointment statistics', () => {
    const mockStats = { PENDING: 2, CONFIRMED: 1, CANCELLED: 0 };

    service.getAppointmentStatistics(1).subscribe((result) => {
      expect(result.data['PENDING']).toBe(2);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/appointments/stats/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse(mockStats));
  });

  // ============================================
  // CONFIRM
  // ============================================

  it('should confirm an appointment', () => {
    service.confirmAppointment(1, 2).subscribe((result) => {
      expect(result.data).toEqual(mockAppointment);
    });

    const req = httpMock.expectOne((r) =>
      r.url === 'http://localhost:8080/api/appointments/1/confirm' &&
      r.params.get('userId') === '2'
    );
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse(mockAppointment));
  });

  // ============================================
  // CANCEL
  // ============================================

  it('should cancel an appointment without reason', () => {
    service.cancelAppointment(1, 2).subscribe((result) => {
      expect(result.data).toEqual(mockAppointment);
    });

    const req = httpMock.expectOne((r) =>
      r.url === 'http://localhost:8080/api/appointments/1/cancel' &&
      r.params.get('userId') === '2'
    );
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse(mockAppointment));
  });

  it('should cancel an appointment with reason', () => {
    service.cancelAppointment(1, 2, 'Not available').subscribe((result) => {
      expect(result.data).toEqual(mockAppointment);
    });

    const req = httpMock.expectOne((r) =>
      r.url === 'http://localhost:8080/api/appointments/1/cancel' &&
      r.params.get('reason') === 'Not available'
    );
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse(mockAppointment));
  });

  // ============================================
  // RESCHEDULE
  // ============================================

  it('should reschedule an appointment', () => {
    const newDatetime = '2026-04-10T14:00:00Z';

    service.rescheduleAppointment(1, newDatetime).subscribe((result) => {
      expect(result.data).toEqual(mockAppointment);
    });

    const req = httpMock.expectOne((r) =>
      r.url === 'http://localhost:8080/api/appointments/1/reschedule' &&
      r.params.get('newDatetime') === newDatetime
    );
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse(mockAppointment));
  });

  it('should reschedule an appointment with reason', () => {
    const newDatetime = '2026-04-10T14:00:00Z';

    service.rescheduleAppointment(1, newDatetime, 'Conflict').subscribe((result) => {
      expect(result.data).toEqual(mockAppointment);
    });

    const req = httpMock.expectOne((r) =>
      r.url === 'http://localhost:8080/api/appointments/1/reschedule' &&
      r.params.get('reason') === 'Conflict'
    );
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse(mockAppointment));
  });

  // ============================================
  // COMPLETE
  // ============================================

  it('should complete an appointment without rating', () => {
    service.completeAppointment(1).subscribe((result) => {
      expect(result.data).toEqual(mockAppointment);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/appointments/1/complete');
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse(mockAppointment));
  });

  it('should complete an appointment with rating and feedback', () => {
    service.completeAppointment(1, 5, 'Great!').subscribe((result) => {
      expect(result.data).toEqual(mockAppointment);
    });

    const req = httpMock.expectOne((r) =>
      r.url === 'http://localhost:8080/api/appointments/1/complete' &&
      r.params.get('rating') === '5' &&
      r.params.get('feedback') === 'Great!'
    );
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse(mockAppointment));
  });

  // ============================================
  // UPDATE LOCATION
  // ============================================

  it('should update appointment location', () => {
    service.updateAppointmentLocation(1, 'Via Napoli 5, Rome').subscribe((result) => {
      expect(result.data).toEqual(mockAppointment);
    });

    const req = httpMock.expectOne((r) =>
      r.url === 'http://localhost:8080/api/appointments/1/location' &&
      r.params.get('address') === 'Via Napoli 5, Rome'
    );
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse(mockAppointment));
  });

  it('should update appointment location with notes', () => {
    service.updateAppointmentLocation(1, 'Via Napoli 5, Rome', 'Ring bell 2').subscribe((result) => {
      expect(result.data).toEqual(mockAppointment);
    });

    const req = httpMock.expectOne((r) =>
      r.url === 'http://localhost:8080/api/appointments/1/location' &&
      r.params.get('notes') === 'Ring bell 2'
    );
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse(mockAppointment));
  });
});