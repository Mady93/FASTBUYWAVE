import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminUsersListComponent } from './admin-users-list.component';
import { UserService } from 'src/app/services/path/user/user.service';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import { PageResponse } from 'src/app/interfaces/page/page_response.interface';
import Swal from 'sweetalert2';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  NO_ERRORS_SCHEMA,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableLayoutComponent } from 'my-lib-inside';

// Mock di TableLayoutComponent
@Component({
  selector: 'lib-table-layout',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockTableLayoutComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() data: any[] = [];
  @Input() columns: any[] = [];
  @Input() actions: any[] = [];
  @Input() loading: boolean = false;
  @Input() selectable: boolean = false;
  @Input() pageable: boolean = false;
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 0;
  @Input() pageSizeOptions: number[] = [5, 10, 15, 20];
  @Input() emptyStateMessage?: string;
  @Input() emptyStateSubtitle?: string;
  @Input() emptyStateLogo?: string;
  @Input() isEmptyStateFn?: () => boolean;
  @Input() getLogoSrcFn?: () => string;
  @Output() actionClicked = new EventEmitter<string>();
  @Output() pageChanged = new EventEmitter<any>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();
}

// Mock di MatIcon
@Component({
  selector: 'mat-icon',
  template: '',
  standalone: true,
})
class MockMatIcon {
  @Input() svgIcon: string = '';
}

// Mock di MatTooltip
@Component({
  selector: '[matTooltip]',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatTooltip {
  @Input() matTooltip: string = '';
  @Input() matTooltipPosition: string = 'above';
}

// Mock di MatProgressSpinner
@Component({
  selector: 'mat-progress-spinner',
  template: '',
  standalone: true,
})
class MockMatProgressSpinner {
  @Input() diameter: number = 40;
  @Input() mode: string = 'indeterminate';
}

// Mock di MatButton
@Component({
  selector: 'button[mat-button]',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatButton {}

// Mock di MatMenu
@Component({
  selector: '[mat-menu-item]',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatMenuItem {}

@Component({
  selector: 'mat-menu',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatMenu {}

// Mock di PaginationComponent (se usato)
@Component({
  selector: 'lib-pagination',
  template: '',
  standalone: true,
})
class MockPaginationComponent {
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 0;
  @Input() pageSizeOptions: number[] = [5, 10, 15, 20];
  @Output() pageChanged = new EventEmitter<any>();
}

// Mock di EmptyStateComponent (se usato)
@Component({
  selector: 'lib-empty-state',
  template: '',
  standalone: true,
})
class MockEmptyStateComponent {
  @Input() show: boolean = false;
  @Input() message?: string;
  @Input() subtitle?: string;
  @Input() logoSrc?: string;
}

// Mock di Swal
const mockSwal = jasmine.createSpyObj('Swal', ['fire']);
mockSwal.fire.and.returnValue(Promise.resolve({ isConfirmed: true }));

// Mock dei servizi
class MockUserService {
  getUsers = jasmine.createSpy().and.returnValue(
    of({
      content: [],
      totalElements: 0,
      totalPages: 0,
      pageNumber: 0,
      pageSize: 5,
      first: true,
      last: true,
      numberOfElements: 0,
    }),
  );
  getDeletedUsers = jasmine.createSpy().and.returnValue(
    of({
      content: [],
      totalElements: 0,
      totalPages: 0,
      pageNumber: 0,
      pageSize: 5,
      first: true,
      last: true,
      numberOfElements: 0,
    }),
  );
  updateUser = jasmine.createSpy().and.returnValue(of({}));
  deleteAllUsers = jasmine
    .createSpy()
    .and.returnValue(of({ message: 'All users deactivated' }));
  reactivateAllUsers = jasmine
    .createSpy()
    .and.returnValue(of({ message: 'All users reactivated' }));
}

class MockAuthGoogleService {
  getCurrentUserInfo = jasmine
    .createSpy()
    .and.returnValue({ userId: '1', roles: ['ADMIN'] });
  userInfo$ = new BehaviorSubject({
    userId: '1',
    email: 'admin@test.com',
    roles: ['ADMIN'],
  });
}

class MockMatSnackBar {
  open = jasmine.createSpy();
}

describe('AdminUsersListComponent', () => {
  let component: AdminUsersListComponent;
  let fixture: ComponentFixture<AdminUsersListComponent>;
  let userService: MockUserService;
  let authService: MockAuthGoogleService;
  let snackBar: MockMatSnackBar;

  const mockUsers: PageResponse<any> = {
    content: [
      {
        userId: 1,
        email: 'admin@test.com',
        roles: 'ADMIN',
        registrationDate: new Date(),
        lastLogin: new Date(),
        active: true,
      },
      {
        userId: 2,
        email: 'user1@test.com',
        roles: 'USER',
        registrationDate: new Date(),
        lastLogin: new Date(),
        active: true,
      },
      {
        userId: 3,
        email: 'user2@test.com',
        roles: 'USER',
        registrationDate: new Date(),
        lastLogin: new Date(),
        active: false,
      },
    ],
    totalElements: 3,
    totalPages: 1,
    pageNumber: 0,
    pageSize: 5,
    first: true,
    last: true,
    numberOfElements: 3,
  };

  beforeEach(async () => {
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({
        isConfirmed: true,
        isDenied: false,
        isDismissed: false,
      } as any),
    );

    snackBar = new MockMatSnackBar();

    await TestBed.configureTestingModule({
      imports: [CommonModule, NoopAnimationsModule, AdminUsersListComponent],
      providers: [
        { provide: UserService, useClass: MockUserService },
        { provide: AuthGoogleService, useClass: MockAuthGoogleService },
        { provide: MatSnackBar, useValue: snackBar },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AdminUsersListComponent, {
        remove: { imports: [TableLayoutComponent] },
        add: { imports: [MockTableLayoutComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AdminUsersListComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as any;
    authService = TestBed.inject(AuthGoogleService) as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load users on init', () => {
      expect(userService.getUsers).toHaveBeenCalled();
    });

    it('should load current user info', () => {
      expect(authService.getCurrentUserInfo).toHaveBeenCalled();
      expect(component.currentUserId).toBe(1);
      expect(component.currentUserIsAdmin).toBeTrue();
    });
  });

  describe('Users loading', () => {
    it('should load active users', (done) => {
      userService.getUsers.and.returnValue(of(mockUsers));
      component.loadUsers();

      component.users$.subscribe((users) => {
        expect(users.length).toBe(3);
        done();
      });
    });

    it('should load inactive users when showActive is false', () => {
      component.showActive$.next(false);
      userService.getDeletedUsers.and.returnValue(of(mockUsers));
      component.loadUsers();

      expect(userService.getDeletedUsers).toHaveBeenCalled();
    });

    it('should handle error', (done) => {
      userService.getUsers.and.returnValue(
        throwError(() => new Error('Error')),
      );
      component.loadUsers();

      component.users$.subscribe((users) => {
        expect(users).toEqual([]);
        done();
      });
    });
  });

  describe('View toggle', () => {
    it('should toggle between active and inactive view', () => {
      component.toggleUsersView();
      expect(component.showActive$.value).toBeFalse();
      expect(userService.getDeletedUsers).toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    it('should handle page change', () => {
      const event = { pageIndex: 2, pageSize: 10 };
      component.onPageChanged(event);
      expect(component.pageable.page).toBe(2);
      expect(component.pageable.size).toBe(10);
    });
  });

  describe('User update', () => {
    const user = {
      userId: 2,
      email: 'user1@test.com',
      roles: 'USER',
      active: true,
      registrationDate: new Date(),
      lastLogin: new Date(),
    };

    it('should update user', () => {
      component.updateUser(2, user as any);
      expect(userService.updateUser).toHaveBeenCalledWith(2, user);
    });
  });

  describe('Toggle user active status', () => {
    const user = {
      userId: 2,
      email: 'user1@test.com',
      roles: 'USER',
      active: true,
      registrationDate: new Date(),
      lastLogin: new Date(),
    };

    it('should toggle active status with confirmation', fakeAsync(() => {
      component.toggleActive(user as any);
      flush();
      expect(Swal.fire).toHaveBeenCalled();
    }));

    it('should not toggle if user is loading', () => {
      (component as any).setUserLoading(2, true);
      component.toggleActive(user as any);
      expect(mockSwal.fire).not.toHaveBeenCalled();
    });
  });

  describe('Delete/Reactivate all users', () => {
    it('should deactivate all users', fakeAsync(() => {
      component.deleteAllUsers();
      flush();
      expect(Swal.fire).toHaveBeenCalled();
    }));

    it('should call deleteAllUsers when confirmed', fakeAsync(() => {
      (Swal.fire as jasmine.Spy).and.returnValue(
        Promise.resolve({
          isConfirmed: true,
          isDenied: false,
          isDismissed: false,
        } as any),
      );
      component.deleteAllUsers();
      flush();
      expect(userService.deleteAllUsers).toHaveBeenCalled();
    }));

    it('should call reactivateAllUsers when showActive is false', fakeAsync(() => {
      component.showActive$.next(false);
      (Swal.fire as jasmine.Spy).and.returnValue(
        Promise.resolve({
          isConfirmed: true,
          isDenied: false,
          isDismissed: false,
        } as any),
      );
      component.deleteAllUsers();
      flush();
      expect(userService.reactivateAllUsers).toHaveBeenCalled();
    }));
  });

  describe('Mobile hints', () => {
    it('should toggle mobile hint', () => {
      component.toggleMobileHint(2);
      expect(component.showMobileHint[2]).toBeTrue();
      component.toggleMobileHint(2);
      expect(component.showMobileHint[2]).toBeFalse();
    });

    it('should close all mobile hints', () => {
      component.showMobileHint[1] = true;
      component.showMobileHint[2] = true;
      component.closeAllMobileHints();
      expect(component.showMobileHint).toEqual({});
    });
  });

  describe('User checks', () => {
    it('should check if user is current user', () => {
      expect(component.isCurrentUser(1)).toBeTrue();
      expect(component.isCurrentUser(2)).toBeFalse();
    });

    it('should check user loading state', () => {
      (component as any).setUserLoading(2, true);
      expect(component.isUserLoading(2)).toBeTrue();
      expect(component.isUserLoading(1)).toBeFalse();
    });
  });

  describe('Table actions', () => {
    it('should update table actions based on state', () => {
      component['updateTableActions']();
      expect(component.tableActions.length).toBe(2);
    });

    it('should handle table action click', () => {
      const toggleSpy = spyOn(component, 'toggleUsersView');
      component.onTableActionClicked('toggle-view');
      expect(toggleSpy).toHaveBeenCalled();
    });

    it('should handle delete all action', () => {
      const deleteSpy = spyOn(component, 'deleteAllUsers');
      component.onTableActionClicked('delete-all');
      expect(deleteSpy).toHaveBeenCalled();
    });
  });

  describe('Empty state', () => {
    it('should return true when no users', () => {
      component['currentUsers'] = [];
      expect(component.isEmptyState()).toBeTrue();
    });

    it('should return false when users exist', () => {
      component['currentUsers'] = mockUsers.content as any;
      expect(component.isEmptyState()).toBeFalse();
    });

    it('should get logo source', () => {
      expect(component.getLogoSrc()).toBe('logo_blue-removebg.png');
    });
  });

  describe('Mobile detection', () => {
    it('should detect mobile viewport', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(600);
      (component as any).checkIfMobile();
      expect(component.isMobile).toBeTrue();
    });

    it('should detect desktop viewport', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(1200);
      (component as any).checkIfMobile();
      expect(component.isMobile).toBeFalse();
    });
  });

  describe('Columns definition', () => {
    it('should have defined columns', () => {
      expect(component.columns.length).toBeGreaterThan(0);
      expect(component.columns[0].field).toBe('userId');
    });
  });

  describe('Loading state', () => {
    it('should have isLoading observable', () => {
      expect(component.isLoading$).toBeTruthy();
    });

    it('should return loading state as function', () => {
      expect(component.isLoading()).toBe(
        (component as any)['isLoadingSubject'].value,
      );
    });
  });

  describe('Cleanup', () => {
    it('should complete destroy subject on ngOnDestroy', () => {
      spyOn((component as any)['destroy$'], 'next');
      spyOn((component as any)['destroy$'], 'complete');
      component.ngOnDestroy();
      expect((component as any)['destroy$'].next).toHaveBeenCalled();
      expect((component as any)['destroy$'].complete).toHaveBeenCalled();
    });
  });
});
