import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactRequestsListComponent } from './contact-requests-list.component';
import { ContactRequestService } from 'src/app/services/path/contact/contact-request/contact-request.service';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import { ProfileService } from 'src/app/services/path/profile/profile.service';
import { ApiConfigService } from 'src/app/services/api-config/api-config.service';
import { ContactMethod } from 'src/app/interfaces/dtos/contact/contactMethod.enum';
import { RequestStatus } from 'src/app/interfaces/dtos/contact/requestStatus.enum';
import Swal from 'sweetalert2';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  EmptyStateComponent,
  SpinnerComponent,
  TableLayoutComponent,
} from 'my-lib-inside';

@Component({ selector: 'lib-empty-state', template: '', standalone: true })
class MockEmptyStateComponent {
  @Input() show: boolean | (() => boolean) = false;
  @Input() logoSrc: string | (() => string) = '';
}

@Component({ selector: 'lib-spinner', template: '', standalone: true })
class MockSpinnerComponent {
  @Input() show: any;
  @Input() spinner: any;
  @Input() isLoading: any;
}

@Component({ selector: 'lib-table-layout', template: '', standalone: true })
class MockTableLayoutComponent {
  @Input() columns: any[] = [];
  @Input() data: any[] = [];
  @Input() pageSize: any;
  @Input() currentPage: any;
  @Input() totalItems: any;
  @Output() pageChanged = new EventEmitter<any>();
}

// Mock dei servizi
class MockContactRequestService {
  getRequestsByReceiver = jasmine.createSpy().and.returnValue(of([]));
  getRequestsBySender = jasmine.createSpy().and.returnValue(of([]));
  acceptRequest = jasmine.createSpy().and.returnValue(of({}));
  rejectRequest = jasmine.createSpy().and.returnValue(of({}));
  hideRequest = jasmine.createSpy().and.returnValue(of({}));
}

class MockAuthGoogleService {
  userInfo$ = new BehaviorSubject({
    userId: '1',
    email: 'test@test.com',
    roles: ['USER'],
  });
  getCurrentUserInfo = jasmine
    .createSpy()
    .and.returnValue({ userId: '1', email: 'test@test.com' });
}

class MockProfileService {
  getImageByUrl = jasmine.createSpy().and.returnValue(of(new Blob()));
}

class MockApiConfigService {
  apiProfile = 'http://localhost:8080/api/profiles';
}

class MockMatSnackBar {
  open = jasmine.createSpy();
}

describe('ContactRequestsListComponent', () => {
  let component: ContactRequestsListComponent;
  let fixture: ComponentFixture<ContactRequestsListComponent>;
  let contactService: MockContactRequestService;
  let authService: MockAuthGoogleService;

  const mockRequests = [
    {
      requestId: 1,
      sender: {
        userId: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        profileImageUrl: '/john.jpg',
        registrationDate: new Date(),
        lastLogin: new Date(),
        active: true,
        roles: 'USER',
        scopes: 'default',
      },
      receiver: {
        userId: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@test.com',
        registrationDate: new Date(),
        lastLogin: new Date(),
        active: true,
        roles: 'USER',
        scopes: 'default',
      },
      product: {
        productId: 1,
        title: 'Test Product',
        price: 100,
        active: true,
        condition: 'NEW',
        stockQuantity: 10,
        images: [],
      },
      subject: 'Interested in: Test Product',
      message: 'I am interested',
      additionalNotes: '',
      preferredContactMethod: ContactMethod.EMAIL,
      status: RequestStatus.PENDING,
      createdAt: new Date().toISOString(),
      rejectedAt: undefined,
      rejectionReason: undefined,
      emailNotificationSent: false,
      active: true,
      convertedToAppointmentId: undefined,
      senderPhone: '',
      senderContactEmail: 'john@test.com',
      hiddenBySender: false,
      hiddenByReceiver: false,
      appointmentDateTime: '',
      locationAddress: '',
      locationNotes: '',
      durationMinutes: undefined,
      latitude: undefined,
      longitude: undefined,
    },
    {
      requestId: 2,
      sender: {
        userId: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@test.com',
        registrationDate: new Date(),
        lastLogin: new Date(),
        active: true,
        roles: 'USER',
        scopes: 'default',
      },
      receiver: {
        userId: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        registrationDate: new Date(),
        lastLogin: new Date(),
        active: true,
        roles: 'USER',
        scopes: 'default',
      },
      product: {
        productId: 2,
        title: 'Another Product',
        price: 200,
        active: true,
        condition: 'USED',
        stockQuantity: 5,
        images: [],
      },
      subject: 'Interested in: Another Product',
      message: 'I am interested too',
      additionalNotes: '',
      preferredContactMethod: ContactMethod.PHONE,
      status: RequestStatus.ACCEPTED,
      createdAt: new Date().toISOString(),
      rejectedAt: undefined,
      rejectionReason: undefined,
      emailNotificationSent: false,
      active: true,
      convertedToAppointmentId: undefined,
      senderPhone: '+39123456789',
      senderContactEmail: 'jane@test.com',
      hiddenBySender: false,
      hiddenByReceiver: false,
      appointmentDateTime: '',
      locationAddress: '',
      locationNotes: '',
      durationMinutes: undefined,
      latitude: undefined,
      longitude: undefined,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactRequestsListComponent, NoopAnimationsModule],
      providers: [
        { provide: ContactRequestService, useClass: MockContactRequestService },
        { provide: AuthGoogleService, useClass: MockAuthGoogleService },
        { provide: ProfileService, useClass: MockProfileService },
        { provide: ApiConfigService, useClass: MockApiConfigService },
        { provide: MatSnackBar, useClass: MockMatSnackBar },
      ],
    })
      .overrideComponent(ContactRequestsListComponent, {
        remove: {
          imports: [
            EmptyStateComponent,
            SpinnerComponent,
            TableLayoutComponent,
          ],
        },
        add: {
          imports: [
            MockEmptyStateComponent,
            MockSpinnerComponent,
            MockTableLayoutComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ContactRequestsListComponent);
    component = fixture.componentInstance;
    contactService = TestBed.inject(ContactRequestService) as any;
    authService = TestBed.inject(AuthGoogleService) as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load requests on init', () => {
      expect(contactService.getRequestsByReceiver).toHaveBeenCalled();
      expect(contactService.getRequestsBySender).toHaveBeenCalled();
    });

    it('should set current user ID', () => {
      expect(component.currentUserId()).toBe(1);
    });
  });

  describe('Requests loading', () => {
    it('should load and sort requests', () => {
      contactService.getRequestsByReceiver.and.returnValue(
        of([mockRequests[0]]),
      );
      contactService.getRequestsBySender.and.returnValue(of([mockRequests[1]]));

      component.loadRequests();

      expect(component.requests().length).toBe(2);
      expect(component.hasDataInDb()).toBeTrue();
    });

    it('should handle error when loading requests', () => {
      contactService.getRequestsByReceiver.and.returnValue(
        throwError(() => new Error('Error')),
      );
      contactService.getRequestsBySender.and.returnValue(
        throwError(() => new Error('Error')),
      );

      component.loadRequests();

      expect(component.error()).toBe('Failed to load contact requests');
    });
  });

  describe('Filters', () => {
    beforeEach(() => {
      component.requests.set(mockRequests);
      component.filteredRequests.set(mockRequests);
    });

    it('should filter by status', () => {
      component.onStatusFilterChange(RequestStatus.PENDING);
      expect(component.statusFilter()).toBe(RequestStatus.PENDING);
      expect(component.filteredRequests().length).toBe(1);
    });

    it('should filter by method', () => {
      component.onMethodFilterChange(ContactMethod.EMAIL);
      expect(component.methodFilter()).toBe(ContactMethod.EMAIL);
      expect(component.filteredRequests().length).toBe(1);
    });

    it('should reset filters to ALL', () => {
      component.onStatusFilterChange('ALL');
      expect(component.statusFilter()).toBe('ALL');
      expect(component.filteredRequests().length).toBe(2);
    });

    it('should get badge count by status', () => {
      expect(component.getBadgeCount(RequestStatus.PENDING)).toBe(1);
      expect(component.getBadgeCount(RequestStatus.ACCEPTED)).toBe(1);
    });
  });

  describe('Accept request', () => {
    let swalSpy: jasmine.Spy;

    beforeEach(() => {
      swalSpy = spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({
          isConfirmed: true,
          isDenied: false,
          isDismissed: false,
        }) as any,
      );
    });

    it('should accept request', () => {
      component.acceptRequest(mockRequests[0]);
      expect(swalSpy).toHaveBeenCalled();
    });

    it('should show error when user not authenticated', () => {
      component.currentUserId.set(null);
      component.acceptRequest(mockRequests[0]);
      expect(contactService.acceptRequest).not.toHaveBeenCalled();
    });
  });

  describe('Reject request', () => {
    let swalSpy: jasmine.Spy;

    beforeEach(() => {
      swalSpy = spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({
          isConfirmed: true,
          isDenied: false,
          isDismissed: false,
          value: 'Test reason',
        }) as any,
      );
    });

    it('should reject request', () => {
      component.rejectRequest(mockRequests[0]);
      expect(swalSpy).toHaveBeenCalled();
    });
  });

  describe('Hide request', () => {
    let swalSpy: jasmine.Spy;

    beforeEach(() => {
      swalSpy = spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({
          isConfirmed: true,
          isDenied: false,
          isDismissed: false,
        }) as any,
      );
    });

    it('should hide request', () => {
      component.hideRequest(mockRequests[0]);
      expect(swalSpy).toHaveBeenCalled();
    });
  });

  describe('Permission checks', () => {
    beforeEach(() => {
      component.currentUserId.set(1);
    });

    it('should check if request is actionable', () => {
      expect(component.isActionable(mockRequests[0])).toBeTrue();
      expect(component.isActionable(mockRequests[1])).toBeFalse();
    });

    it('should check if user is receiver', () => {
      expect(component.isReceiver(mockRequests[0])).toBeFalse();
      expect(component.isReceiver(mockRequests[1])).toBeTrue();
    });

    it('should check if user is sender', () => {
      expect(component.isSender(mockRequests[0])).toBeTrue();
      expect(component.isSender(mockRequests[1])).toBeFalse();
    });

    it('should check if can accept meeting', () => {
      const meetingRequest = {
        ...mockRequests[0],
        preferredContactMethod: ContactMethod.MEETING,
      };
      expect(component.canAcceptMeeting(meetingRequest)).toBeFalse();
    });

    it('should check if can close non-meeting', () => {
      const nonMeetingRequest = {
        ...mockRequests[1],
        preferredContactMethod: ContactMethod.EMAIL,
        status: RequestStatus.PENDING,
        receiver: {
          ...mockRequests[1].receiver,
          userId: 1,
        },
      } as any;
      expect(component.canCloseNonMeeting(nonMeetingRequest)).toBeTrue();
    });
    it('should check if can reject', () => {
      const pendingReceivedRequest = {
        ...mockRequests[1],
        status: RequestStatus.PENDING,
        receiver: {
          ...mockRequests[1].receiver,
          userId: 1,
        },
      } as any;
      expect(component.canReject(pendingReceivedRequest)).toBeTrue();
    });

    it('should check if can hide', () => {
      const acceptedRequest = {
        ...mockRequests[1],
        status: RequestStatus.ACCEPTED,
      };
      expect(component.canHide(acceptedRequest)).toBeTrue();
    });
  });

  describe('Available actions', () => {
    it('should get available actions', () => {
      const actions = component.getAvailableActions(mockRequests[1]);
      expect(actions.length).toBeGreaterThan(0);
    });
  });

  describe('Pagination', () => {
    it('should handle page change', () => {
      component.onPageChanged({ pageIndex: 2, pageSize: 10 });
      expect(component.currentPage).toBe(2);
      expect(component.pageSize).toBe(10);
    });

    it('should calculate total pages', () => {
      component.filteredRequests.set(mockRequests);
      component.pageSize = 1;
      expect(component.getTotalPages()).toBe(2);
    });
  });

  describe('Empty state', () => {
    it('should return empty state message', () => {
      expect(component.emptyStateMessage).toBeDefined();
    });

    it('should return empty state subtitle', () => {
      expect(component.emptyStateSubtitle).toBeDefined();
    });

    it('should check if empty state', () => {
      component.filteredRequests.set([]);
      component.hasDataInDb.set(true);
      expect(component.isEmptyState()).toBeTrue();
    });

    it('should check if no data', () => {
      component.hasDataInDb.set(false);
      expect(component.isNoData()).toBeTrue();
    });

    it('should get logo source', () => {
      expect(component.getLogoSrc()).toBe('logo_blue-removebg.png');
    });
  });

  describe('Mobile detection', () => {
    it('should detect mobile viewport', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(800);
      component.checkMobile();
      expect(component.isMobile).toBeTrue();
    });

    it('should detect desktop viewport', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(1200);
      component.checkMobile();
      expect(component.isMobile).toBeFalse();
    });
  });

  describe('Info row toggle', () => {
    it('should toggle info row', () => {
      component.toggleInfo('row1');
      expect(component.isInfoOpen('row1')).toBeTrue();
      component.toggleInfo('row1');
      expect(component.isInfoOpen('row1')).toBeFalse();
    });
  });

  describe('Table columns', () => {
    it('should have defined columns', () => {
      expect(component.columns.length).toBeGreaterThan(0);
      expect(component.columns[0].field).toBe('sender');
    });
  });
});
