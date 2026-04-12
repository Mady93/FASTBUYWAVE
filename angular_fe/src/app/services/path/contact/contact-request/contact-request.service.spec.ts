import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ContactRequestService } from './contact-request.service';
import { ApiConfigService } from 'src/app/services/api-config/api-config.service';
import { ContactRequestDTO } from 'src/app/interfaces/dtos/contact/contactRequestDTO.interface';
import { CreateContactRequestPayload } from 'src/app/interfaces/dtos/contact/createContactRequestPayload.interface';
import { ApiResponseData } from 'src/app/interfaces/dettails/api_response_data';
import { ContactMethod } from 'src/app/interfaces/dtos/contact/contactMethod.enum';

const mockApiBase = 'http://mock-api/contact';

const mockApiConfigService = {
  apiContact: mockApiBase,
};

const mockContactRequest: ContactRequestDTO = {
  requestId: 1,
  sender: { userId: 10 } as any,
  receiver: { userId: 20 } as any,
  status: 'PENDING' as ContactRequestDTO['status'],
  createdAt: '2024-01-01T10:00:00',
} as ContactRequestDTO;

const mockResponse = <T>(data: T): ApiResponseData<T> =>
  ({ data }) as ApiResponseData<T>;

describe('ContactRequestService', () => {
  let service: ContactRequestService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    spyOn(console, 'error');
    spyOn(console, 'log');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ContactRequestService,
        { provide: ApiConfigService, useValue: mockApiConfigService },
      ],
    });

    service = TestBed.inject(ContactRequestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ─── getRequestsByReceiver ─────────────────────────────────────────────────

  describe('getRequestsByReceiver', () => {
    it('should GET requests for a valid receiver ID', () => {
      const requests = [mockContactRequest];

      service.getRequestsByReceiver(20).subscribe((result) => {
        expect(result).toEqual(requests);
      });

      const req = httpMock.expectOne(`${mockApiBase}/receiver/20`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse(requests));
    });

    it('should throw immediately for invalid receiver ID (0)', () => {
      service.getRequestsByReceiver(0).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.message).toBe('Invalid receiver user ID'),
      });

      httpMock.expectNone(`${mockApiBase}/receiver/0`);
    });

    it('should throw immediately for negative receiver ID', () => {
      service.getRequestsByReceiver(-5).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.message).toBe('Invalid receiver user ID'),
      });

      httpMock.expectNone(`${mockApiBase}/receiver/-5`);
    });

    it('should throw "Invalid user ID format" on 406', () => {
      service.getRequestsByReceiver(20).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.message).toBe('Invalid user ID format'),
      });

      httpMock
        .expectOne(`${mockApiBase}/receiver/20`)
        .flush('Not Acceptable', { status: 406, statusText: 'Not Acceptable' });
    });

    it('should throw "User not found" on 404', () => {
      service.getRequestsByReceiver(20).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.message).toBe('User not found'),
      });

      httpMock
        .expectOne(`${mockApiBase}/receiver/20`)
        .flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should throw "Authentication required" on 401', () => {
      service.getRequestsByReceiver(20).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.message).toBe('Authentication required'),
      });

      httpMock
        .expectOne(`${mockApiBase}/receiver/20`)
        .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should throw "Failed to load contact requests" on generic error', () => {
      service.getRequestsByReceiver(20).subscribe({
        next: () => fail('expected an error'),
        error: (err) =>
          expect(err.message).toBe('Failed to load contact requests'),
      });

      httpMock
        .expectOne(`${mockApiBase}/receiver/20`)
        .flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should throw if response data is null', () => {
      service.getRequestsByReceiver(20).subscribe({
        next: () => fail('expected an error'),
        error: (err) =>
          expect(err.message).toBe('Failed to load contact requests'),
      });

      httpMock
        .expectOne(`${mockApiBase}/receiver/20`)
        .flush(mockResponse(null));
    });
  });

  // ─── getRequestsBySender ───────────────────────────────────────────────────

  describe('getRequestsBySender', () => {
    it('should GET requests for a given sender ID', () => {
      const requests = [mockContactRequest];

      service.getRequestsBySender(10).subscribe((result) => {
        expect(result).toEqual(requests);
      });

      const req = httpMock.expectOne(`${mockApiBase}/sender/10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse(requests));
    });

    it('should propagate error on failure', () => {
      service.getRequestsBySender(10).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500),
      });

      httpMock
        .expectOne(`${mockApiBase}/sender/10`)
        .flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  // ─── getRequestById ────────────────────────────────────────────────────────

  describe('getRequestById', () => {
    it('should GET a request by ID', () => {
      service.getRequestById(1).subscribe((result) => {
        expect(result).toEqual(mockContactRequest);
      });

      const req = httpMock.expectOne(`${mockApiBase}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse(mockContactRequest));
    });

    it('should propagate error on failure', () => {
      service.getRequestById(1).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(404),
      });

      httpMock
        .expectOne(`${mockApiBase}/1`)
        .flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  // ─── createContactRequest ──────────────────────────────────────────────────

  describe('createContactRequest', () => {
    it('should POST and return the created request', () => {
      const payload: CreateContactRequestPayload = {
        sender: { userId: 10 },
        receiver: { userId: 20 },
        product: { productId: 1 },
        subject: 'Test subject',
        message: 'Hello!',
        preferredContactMethod: 'EMAIL' as ContactMethod,
        senderContactEmail: 'test@test.com',
      };

      service.createContactRequest(payload).subscribe((result) => {
        expect(result).toEqual(mockContactRequest);
      });

      const req = httpMock.expectOne(mockApiBase);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse(mockContactRequest));
    });

    it('should propagate error on failure', () => {
      const payload = {} as CreateContactRequestPayload;

      service.createContactRequest(payload).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(400),
      });

      httpMock
        .expectOne(mockApiBase)
        .flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });
  });

  // ─── acceptRequest ─────────────────────────────────────────────────────────

  describe('acceptRequest', () => {
    it('should PATCH and return the accepted request', () => {
      const accepted = {
        ...mockContactRequest,
        status: 'ACCEPTED' as ContactRequestDTO['status'],
      };

      service.acceptRequest(1).subscribe((result) => {
        expect(result).toEqual(accepted);
      });

      const req = httpMock.expectOne(`${mockApiBase}/1/accept`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toBeNull();
      req.flush(mockResponse(accepted));
    });

    it('should propagate error on failure', () => {
      service.acceptRequest(1).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(403),
      });

      httpMock
        .expectOne(`${mockApiBase}/1/accept`)
        .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });

  // ─── rejectRequest ─────────────────────────────────────────────────────────

  describe('rejectRequest', () => {
    it('should PATCH with rejectionReason and return the rejected request', () => {
      const rejected = {
        ...mockContactRequest,
        status: 'REJECTED' as ContactRequestDTO['status'],
      };
      const reason = 'Not relevant';

      service.rejectRequest(1, reason).subscribe((result) => {
        expect(result).toEqual(rejected);
      });

      const req = httpMock.expectOne(`${mockApiBase}/1/reject`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ rejectionReason: reason });
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(mockResponse(rejected));
    });

    it('should throw if response data is null', () => {
      service.rejectRequest(1, 'reason').subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.message).toBe('No data received from server'),
      });

      httpMock
        .expectOne(`${mockApiBase}/1/reject`)
        .flush(mockResponse(null));
    });

    it('should propagate error on failure', () => {
      service.rejectRequest(1, 'reason').subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500),
      });

      httpMock
        .expectOne(`${mockApiBase}/1/reject`)
        .flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  // ─── hideRequest ───────────────────────────────────────────────────────────

  describe('hideRequest', () => {
    it('should PATCH and complete without returning data', () => {
      service.hideRequest(1).subscribe((result) => {
        expect(result).toBeUndefined();
      });

      const req = httpMock.expectOne(`${mockApiBase}/1/hide`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse(undefined));
    });

    it('should throw "Request not found" on 404', () => {
      service.hideRequest(1).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.message).toBe('Request not found'),
      });

      httpMock
        .expectOne(`${mockApiBase}/1/hide`)
        .flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should throw "You are not involved in this request" on 403', () => {
      service.hideRequest(1).subscribe({
        next: () => fail('expected an error'),
        error: (err) =>
          expect(err.message).toBe('You are not involved in this request'),
      });

      httpMock
        .expectOne(`${mockApiBase}/1/hide`)
        .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });

    it('should throw "Authentication required" on 401', () => {
      service.hideRequest(1).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.message).toBe('Authentication required'),
      });

      httpMock
        .expectOne(`${mockApiBase}/1/hide`)
        .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should throw "Failed to hide request" on generic error', () => {
      service.hideRequest(1).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.message).toBe('Failed to hide request'),
      });

      httpMock
        .expectOne(`${mockApiBase}/1/hide`)
        .flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});