import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppointmentsListComponent } from './appointments-list.component';
import { AppointmentService } from 'src/app/services/path/appointment/appointment.service';
import { AppointmentProposalService } from 'src/app/services/path/contact/appointment-proposal/appointment-proposal.service';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import { AppointmentStatus } from 'src/app/interfaces/dtos/contact/appointmentStatus.enum';
import { ProposalStatus } from 'src/app/interfaces/dtos/contact/appointment_proposal.interface';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EmptyStateComponent } from 'my-lib-inside';
import { AppointmentsCalendarComponent } from 'src/app/components/calendar/appointments-calendar/appointments-calendar.component';
import Swal from 'sweetalert2';

// Mock per EmptyStateComponent
@Component({ selector: 'lib-empty-state', template: '', standalone: true })
class MockEmptyStateComponent {
  @Input() show: boolean = false;
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() icon: string = '';
  @Input() logoSrc: string = '';
}

// Mock per AppointmentsCalendarComponent
@Component({
  selector: 'app-appointments-calendar',
  template: '',
  standalone: true,
})
class MockAppointmentsCalendarComponent {
  @Input() events: any[] = [];
  @Input() isOrganizer: any;
  @Output() action = new EventEmitter<any>();
}

// Mock dei servizi
class MockAppointmentService {
  getUserAppointments = jasmine.createSpy().and.returnValue(
    of({
      data: {
        requested: [],
        organized: [],
      },
    }),
  );
  confirmAppointment = jasmine.createSpy().and.returnValue(of({ data: {} }));
  cancelAppointment = jasmine.createSpy().and.returnValue(of({ data: {} }));
}

class MockAppointmentProposalService {
  getProposals = jasmine.createSpy().and.returnValue(of([]));
  acceptProposal = jasmine.createSpy().and.returnValue(of({}));
  rejectProposal = jasmine.createSpy().and.returnValue(of({}));
  proposeChange = jasmine.createSpy().and.returnValue(of({}));
}

class MockAuthGoogleService {
  getCurrentUserInfo = jasmine
    .createSpy()
    .and.returnValue({ userId: '1', email: 'test@test.com' });
  userInfo$ = new BehaviorSubject({ userId: '1', email: 'test@test.com' });
}

class MockMatDialog {
  open = jasmine.createSpy().and.returnValue({
    afterClosed: () => of(null),
  });
}

describe('AppointmentsListComponent', () => {
  let component: AppointmentsListComponent;
  let fixture: ComponentFixture<AppointmentsListComponent>;
  let appointmentService: MockAppointmentService;
  let proposalService: MockAppointmentProposalService;
  let authService: MockAuthGoogleService;
  let dialog: MockMatDialog;

  const mockAppointmentsData = {
    requested: [
      {
        appointmentId: 1,
        title: 'Meeting: Test 1',
        status: AppointmentStatus.PENDING,
        appointmentDatetime: new Date().toISOString(),
        requester: {
          userId: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
        },
        organizer: {
          userId: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@test.com',
        },
        product: {
          productId: 1,
          title: 'Test Product',
          price: 100,
          active: true,
          condition: 'NEW',
          stockQuantity: 10,
        },
        durationMinutes: 60,
        locationType: 'IN_PERSON',
        locationAddress: 'Via Roma 1, Rome',
        locationNotes: '',
        createdAt: new Date().toISOString(),
        active: true,
        reminderSent: false,
        description: '',
        meetingLink: '',
      },
      {
        appointmentId: 2,
        title: 'Meeting: Test 2',
        status: AppointmentStatus.CONFIRMED,
        appointmentDatetime: new Date().toISOString(),
        requester: {
          userId: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@test.com',
        },
        organizer: {
          userId: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
        },
        product: {
          productId: 2,
          title: 'Another Product',
          price: 200,
          active: true,
          condition: 'NEW',
          stockQuantity: 5,
        },
        durationMinutes: 90,
        locationType: 'IN_PERSON',
        locationAddress: 'Via Roma 2, Rome',
        locationNotes: '',
        createdAt: new Date().toISOString(),
        active: true,
        reminderSent: false,
        description: '',
        meetingLink: '',
      },
    ],
    organized: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsListComponent, NoopAnimationsModule],
      providers: [
        { provide: AppointmentService, useClass: MockAppointmentService },
        {
          provide: AppointmentProposalService,
          useClass: MockAppointmentProposalService,
        },
        { provide: AuthGoogleService, useClass: MockAuthGoogleService },
        { provide: MatDialog, useClass: MockMatDialog },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy() } },
      ],
    })
      .overrideComponent(AppointmentsListComponent, {
        remove: {
          imports: [EmptyStateComponent, AppointmentsCalendarComponent],
        },
        add: {
          imports: [MockEmptyStateComponent, MockAppointmentsCalendarComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AppointmentsListComponent);
    component = fixture.componentInstance;
    appointmentService = TestBed.inject(AppointmentService) as any;
    proposalService = TestBed.inject(AppointmentProposalService) as any;
    authService = TestBed.inject(AuthGoogleService) as any;
    dialog = TestBed.inject(MatDialog) as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should get current user ID on init', () => {
      expect(authService.getCurrentUserInfo).toHaveBeenCalled();
      expect(component.currentUserId).toBe(1);
    });

    it('should load appointments on init', () => {
      expect(appointmentService.getUserAppointments).toHaveBeenCalledWith(1);
    });
  });

  describe('Appointments loading', () => {
    it('should load appointments successfully', () => {
      appointmentService.getUserAppointments.and.returnValue(
        of({
          data: mockAppointmentsData,
        }),
      );

      component.loadAppointments();

      expect(component.appointments().length).toBe(2);
      expect(component.loading()).toBeFalse();
    });

    it('should handle error when loading appointments', () => {
      appointmentService.getUserAppointments.and.returnValue(
        throwError(() => new Error('Error')),
      );

      component.loadAppointments();

      expect(component.error()).toBe('Failed to load appointments');
      expect(component.loading()).toBeFalse();
    });
  });

  describe('Calendar events', () => {
    beforeEach(() => {
      appointmentService.getUserAppointments.and.returnValue(
        of({
          data: mockAppointmentsData,
        }),
      );
      component.loadAppointments();
    });

    it('should generate calendar events from appointments', () => {
      const events = component.calendarEvents();
      expect(events.length).toBe(2);
      expect(events[0].title).toBe('Test 1');
    });
  });

  describe('Proposals loading', () => {
    it('should load proposals for appointments', () => {
      const mockProposals = [
        {
          proposalId: 1,
          status: ProposalStatus.PENDING,
          proposedBy: { userId: 2, firstName: 'Jane', lastName: 'Smith' },
          proposedDatetime: new Date().toISOString(),
          proposedLocationAddress: 'Via Roma 3',
        },
      ];

      proposalService.getProposals.and.returnValue(of(mockProposals));

      appointmentService.getUserAppointments.and.returnValue(
        of({
          data: mockAppointmentsData,
        }),
      );

      component.loadAppointments();

      expect(proposalService.getProposals).toHaveBeenCalled();
    });
  });

  describe('Calendar actions', () => {
    let swalSpy: jasmine.Spy;

    beforeEach(() => {
      component.appointments.set(mockAppointmentsData.requested as any);
      component.currentUserId = 1;
      swalSpy = spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({
          isConfirmed: true,
          isDenied: false,
          isDismissed: false,
          value: 'Test cancellation reason'
        }) as any,
      );
    });

    it('should handle confirm action', () => {
      const action = { type: 'confirm', event: { id: 1 } };
      component.onCalendarAction(action as any);
      expect(swalSpy).toHaveBeenCalled();
    });

    it('should handle cancel action', () => {
      const action = { type: 'cancel', event: { id: 1 } };
      component.onCalendarAction(action as any);
      expect(swalSpy).toHaveBeenCalled();
    });
  });

  describe('Helpers', () => {
    beforeEach(() => {
      component.appointments.set(mockAppointmentsData.requested as any);
    });

    it('should count by status', () => {
      expect(component.countByStatus(AppointmentStatus.PENDING)).toBe(1);
      expect(component.countByStatus(AppointmentStatus.CONFIRMED)).toBe(1);
    });

    it('should check if empty state', () => {
      expect(component.isEmptyState()).toBeFalse();
      component.appointments.set([]);
      expect(component.isEmptyState()).toBeTrue();
    });

    it('should get logo source', () => {
      expect(component.getLogoSrc()).toBe('logo_blue-removebg.png');
    });
  });

  describe('Appointment updates', () => {
    it('should emit appointmentUpdated event', () => {
      const spy = jasmine.createSpy();
      component.appointmentUpdated.subscribe(spy);

      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true }) as any,
      );

      component.appointmentUpdated.emit();

      expect(spy).toHaveBeenCalled();
    });
  });
});
