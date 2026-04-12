import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AppointmentProposalService } from './appointment-proposal.service';
import { ApiConfigService } from 'src/app/services/api-config/api-config.service';
import { AppointmentProposalDTO } from 'src/app/interfaces/dtos/contact/appointment_proposal_dto';
import { ProposalStatus } from 'src/app/interfaces/dtos/contact/appointment_proposal.interface';
import { provideHttpClient } from '@angular/common/http';

const mockApiBase = 'http://mock-api/appointment-proposals';

const mockApiConfigService = {
  apiAppointmentProposal: mockApiBase,
};

const mockProposal: AppointmentProposalDTO = {
  proposalId: 1,
  appointment: { appointmentId: 123 } as any,
  proposedBy: { userId: 456 } as any,
  proposedDatetime: '2025-01-01T10:00:00',
  proposedLocationAddress: 'Via Roma 1, Milano',
  proposedLocationNotes: 'Citofono 3',
  proposedDuration: 60,
  status: ProposalStatus.PENDING,
  createdAt: '2024-12-01T08:00:00',
  latitude: 45.464,
  longitude: 9.19,
};

describe('AppointmentProposalService', () => {
  let service: AppointmentProposalService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AppointmentProposalService,
        { provide: ApiConfigService, useValue: mockApiConfigService },
      ],
    });

    service = TestBed.inject(AppointmentProposalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ensures no unexpected HTTP requests
  });

  // ─── Creation ───────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ─── proposeChange ───────────────────────────────────────────────────────────

  describe('proposeChange', () => {
    it('should POST to the correct URL and return the created proposal', () => {
      const appointmentId = 123;
      const userId = 456;

      service
        .proposeChange(appointmentId, mockProposal, userId)
        .subscribe((result) => {
          expect(result).toEqual(mockProposal);
        });

      const req = httpMock.expectOne(
        `${mockApiBase}/create/${appointmentId}?userId=${userId}`,
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockProposal);
      req.flush(mockProposal);
    });

    it('should propagate the error on failure', () => {
      const consoleSpy = spyOn(console, 'error');

      service.proposeChange(123, mockProposal, 456).subscribe({
        next: () => fail('expected an error'),
        error: (err) => {
          expect(err.status).toBe(500);
          expect(consoleSpy).toHaveBeenCalledWith(
            'proposeChange:',
            jasmine.anything(),
          );
        },
      });

      const req = httpMock.expectOne(`${mockApiBase}/create/123?userId=456`);
      req.flush('Server error', {
        status: 500,
        statusText: 'Internal Server Error',
      });
    });
  });

  // ─── acceptProposal ──────────────────────────────────────────────────────────

  describe('acceptProposal', () => {
    it('should POST to the correct URL and return the accepted proposal', () => {
      const proposalId = 1;
      const userId = 456;
      const accepted = { ...mockProposal, status: ProposalStatus.ACCEPTED };

      service.acceptProposal(proposalId, userId).subscribe((result) => {
        expect(result).toEqual(accepted);
      });

      const req = httpMock.expectOne(
        `${mockApiBase}/${proposalId}/accept?userId=${userId}`,
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(accepted);
    });

    it('should propagate the error on failure', () => {
      const consoleSpy = spyOn(console, 'error');

      service.acceptProposal(1, 456).subscribe({
        next: () => fail('expected an error'),
        error: (err) => {
          expect(err.status).toBe(403);
          expect(consoleSpy).toHaveBeenCalledWith(
            'acceptProposal:',
            jasmine.anything(),
          );
        },
      });

      const req = httpMock.expectOne(`${mockApiBase}/1/accept?userId=456`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });

  // ─── rejectProposal ──────────────────────────────────────────────────────────

  describe('rejectProposal', () => {
    it('should POST to the correct URL and return the rejected proposal', () => {
      const proposalId = 1;
      const userId = 456;
      const rejected = { ...mockProposal, status: ProposalStatus.REJECTED };

      service.rejectProposal(proposalId, userId).subscribe((result) => {
        expect(result).toEqual(rejected);
      });

      const req = httpMock.expectOne(
        `${mockApiBase}/${proposalId}/reject?userId=${userId}`,
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(rejected);
    });

    it('should propagate the error on failure', () => {
      const consoleSpy = spyOn(console, 'error');

      service.rejectProposal(1, 456).subscribe({
        next: () => fail('expected an error'),
        error: (err) => {
          expect(err.status).toBe(404);
          expect(consoleSpy).toHaveBeenCalledWith(
            'rejectProposal:',
            jasmine.anything(),
          );
        },
      });

      const req = httpMock.expectOne(`${mockApiBase}/1/reject?userId=456`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  // ─── getProposals ────────────────────────────────────────────────────────────

  describe('getProposals', () => {
    it('should GET proposals for a given appointmentId', () => {
      const appointmentId = 123;
      const proposals = [mockProposal, { ...mockProposal, proposalId: 2 }];

      service.getProposals(appointmentId).subscribe((result) => {
        expect(result.length).toBe(2);
        expect(result).toEqual(proposals);
      });

      const req = httpMock.expectOne(`${mockApiBase}/${appointmentId}`);
      expect(req.request.method).toBe('GET');
      req.flush(proposals);
    });

    it('should return an empty array when no proposals exist', () => {
      service.getProposals(123).subscribe((result) => {
        expect(result).toEqual([]);
      });

      const req = httpMock.expectOne(`${mockApiBase}/123`);
      req.flush([]);
    });

    it('should propagate the error on failure', () => {
      const consoleSpy = spyOn(console, 'error');

      service.getProposals(123).subscribe({
        next: () => fail('expected an error'),
        error: (err) => {
          expect(err.status).toBe(500);
          expect(consoleSpy).toHaveBeenCalledWith(
            'getProposals:',
            jasmine.anything(),
          );
        },
      });

      const req = httpMock.expectOne(`${mockApiBase}/123`);
      req.flush('Server error', {
        status: 500,
        statusText: 'Internal Server Error',
      });
    });
  });
});
