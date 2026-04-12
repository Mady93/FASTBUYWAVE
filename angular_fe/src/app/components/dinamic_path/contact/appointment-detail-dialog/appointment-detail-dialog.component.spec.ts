// ─────────────────────────────────────────────────────────────────────────────
// SECTION: IMPORTS
// ─────────────────────────────────────────────────────────────────────────────

import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { AppointmentDetailDialogComponent } from './appointment-detail-dialog.component';
import { AppointmentProposalService } from 'src/app/services/path/contact/appointment-proposal/appointment-proposal.service';
import { AppointmentStatus } from 'src/app/interfaces/dtos/contact/appointmentStatus.enum';
import { ProposalStatus } from 'src/app/interfaces/dtos/contact/appointment_proposal.interface';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  NO_ERRORS_SCHEMA,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from 'my-lib-inside';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: MOCK COMPONENTS (NON USANO inject)
// ─────────────────────────────────────────────────────────────────────────────

// Mock di ModalComponent che NON usa inject
@Component({
  selector: 'lib-modal',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() icon: string = '';
  @Input() showClose: boolean = true;
  @Input() closeOnBackdrop: boolean = false;
  @Input() maxWidth: string = '';
  @Input() maxHeight: string = '';
  @Input() actions: any[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() actionClicked = new EventEmitter<string>();
}

@Component({ selector: 'lib-map', template: '', standalone: true })
class MockMapComponent {
  @Input() coordinates: any;
  @Input() zoom: number = 12;
}

// Mock componenti Material
@Component({
  selector: 'mat-dialog-content',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatDialogContent {}

@Component({
  selector: 'mat-dialog-actions',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatDialogActions {}

@Component({
  selector: 'button[mat-button]',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatButton {}

@Component({ selector: 'mat-icon', template: '', standalone: true })
class MockMatIcon {}

@Component({ selector: 'mat-divider', template: '', standalone: true })
class MockMatDivider {}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: MOCK SERVICES
// ─────────────────────────────────────────────────────────────────────────────

class MockAppointmentProposalService {
  getProposals = jasmine.createSpy().and.returnValue(of([]));
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: TEST SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('AppointmentDetailDialogComponent', () => {
  let component: AppointmentDetailDialogComponent;
  let fixture: ComponentFixture<AppointmentDetailDialogComponent>;
  let proposalService: MockAppointmentProposalService;

  const mockDialogRef = {
    close: jasmine.createSpy(),
  };

  const mockAppointment = {
    appointmentId: 1,
    title: 'Meeting: Test Appointment',
    status: AppointmentStatus.PENDING,
    requester: { userId: 1, firstName: 'John', lastName: 'Doe' },
    organizer: { userId: 2, firstName: 'Jane', lastName: 'Smith' },
    product: { productId: 1, title: 'Test Product' },
    appointmentDatetime: '2024-01-15T10:00:00Z',
    durationMinutes: 60,
    locationType: 'IN_PERSON',
    locationAddress: 'Via Roma 1, Rome',
    createdAt: '2024-01-10T10:00:00Z',
    active: true,
    reminderSent: false,
    latitude: 41.9028,
    longitude: 12.4964,
  } as any;

  const mockDialogData = {
    apt: mockAppointment,
    currentUserId: 1,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NoopAnimationsModule,
        AppointmentDetailDialogComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        {
          provide: AppointmentProposalService,
          useClass: MockAppointmentProposalService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AppointmentDetailDialogComponent, {
        remove: { imports: [ModalComponent] },
        add: { imports: [MockModalComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AppointmentDetailDialogComponent);
    component = fixture.componentInstance;
    proposalService = TestBed.inject(AppointmentProposalService) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should have appointment data injected', () => {
      expect(component.apt.appointmentId).toBe(1);
      expect(component.apt.title).toBe('Meeting: Test Appointment');
    });

    it('should have currentUserId injected', () => {
      expect(component.currentUserId).toBe(1);
    });

    it('should load proposals on construction', () => {
      expect(proposalService.getProposals).toHaveBeenCalledWith(1);
    });
  });

  describe('Modal title and subtitle', () => {
    it('should return modal title without "Meeting:" prefix', () => {
      expect(component.modalTitle).toBe('Test Appointment');
    });

    it('should return modal subtitle from status', () => {
      expect(component.modalSubtitle).toBe('Pending');
    });

    it('should get status label', () => {
      expect(component.getStatusLabel(AppointmentStatus.CONFIRMED)).toBe(
        'Confirmed',
      );
      expect(component.getStatusLabel(AppointmentStatus.CANCELLED)).toBe(
        'Cancelled',
      );
      expect(component.getStatusLabel(AppointmentStatus.COMPLETED)).toBe(
        'Completed',
      );
    });
  });

  describe('Permissions', () => {
    it('should return false if current user is not organizer', () => {
      expect(component.isOrganizer).toBe(false);
    });

    it('should return true when user is organizer', () => {
      component['apt'] = { ...mockAppointment, organizer: { userId: 1 } };
      component['currentUserId'] = 1;
      fixture.detectChanges();
      expect(component.isOrganizer).toBeTrue();
    });
  });

  describe('Proposals', () => {
    const mockProposals = [
      {
        proposalId: 1,
        status: ProposalStatus.PENDING,
        proposedBy: { userId: 1, firstName: 'John', lastName: 'Doe' },
        proposedDatetime: '2024-02-01T10:00:00Z',
        proposedLocationAddress: 'Via Roma 1',
        appointment: { appointmentId: 1 },
        proposedDuration: 60,
      },
      {
        proposalId: 2,
        status: ProposalStatus.PENDING,
        proposedBy: { userId: 2, firstName: 'Jane', lastName: 'Smith' },
        proposedDatetime: '2024-02-02T10:00:00Z',
        proposedLocationAddress: 'Via Milano 2',
        appointment: { appointmentId: 1 },
        proposedDuration: 30,
      },
    ] as any;

    it('should load proposals successfully', () => {
      proposalService.getProposals.and.returnValue(of(mockProposals));
      component['loadProposals']();
      fixture.detectChanges();
      expect(component.proposals.length).toBe(2);
    });

    it('should handle error when loading proposals', () => {
      proposalService.getProposals.and.returnValue(
        throwError(() => new Error('Error')),
      );
      component['loadProposals']();
      fixture.detectChanges();
      expect(component.proposals).toEqual([]);
    });

    it('should filter only pending proposals', () => {
      const mixedProposals = [
        {
          proposalId: 1,
          status: ProposalStatus.PENDING,
          proposedBy: { userId: 1, firstName: 'A', lastName: 'B' },
          proposedDatetime: '2024-02-01T10:00:00Z',
          proposedLocationAddress: 'X',
          appointment: { appointmentId: 1 },
        },
        {
          proposalId: 2,
          status: ProposalStatus.ACCEPTED,
          proposedBy: { userId: 2, firstName: 'C', lastName: 'D' },
          proposedDatetime: '2024-02-02T10:00:00Z',
          proposedLocationAddress: 'Y',
          appointment: { appointmentId: 1 },
        },
        {
          proposalId: 3,
          status: ProposalStatus.REJECTED,
          proposedBy: { userId: 3, firstName: 'E', lastName: 'F' },
          proposedDatetime: '2024-02-03T10:00:00Z',
          proposedLocationAddress: 'Z',
          appointment: { appointmentId: 1 },
        },
      ];
      proposalService.getProposals.and.returnValue(of(mixedProposals));
      component['loadProposals']();
      fixture.detectChanges();
      expect(component.proposals.length).toBe(1);
    });
  });

  describe('Dialog actions', () => {
    it('should have empty modal actions array', () => {
      expect(component.modalActions).toEqual([]);
    });

    it('should close dialog on close action', () => {
      component.onModalAction('close');
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should close dialog', () => {
      component.closeDialog();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('Star rating', () => {
    it('should have star range array', () => {
      expect(component.starRange).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('Map initialization', () => {
    it('should initialize map after view init when coordinates exist', fakeAsync(() => {
      component.mapContainer = {
        nativeElement: document.createElement('div'),
      } as any;

      const initMapSpy = spyOn(component as any, 'initMap');
      component.ngAfterViewInit();

      tick(150); // drena il setTimeout(150)

      expect(initMapSpy).toHaveBeenCalled();
    }));

    it('should not initialize map without coordinates', () => {
      component['apt'] = {
        ...mockAppointment,
        latitude: undefined,
        longitude: undefined,
      };
      fixture.detectChanges();
      spyOn(component as any, 'initMap');
      component.ngAfterViewInit();
      expect((component as any).initMap).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup map on destroy', () => {
      const mockMap = { setTarget: jasmine.createSpy() };
      (component as any).olMap = mockMap;

      component.ngOnDestroy();

      expect(mockMap.setTarget).toHaveBeenCalledWith(undefined as any);
      expect((component as any).olMap).toBeNull();
    });
  });
});
