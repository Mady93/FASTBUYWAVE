import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TableAction, TableColumn, TableLayoutComponent } from 'my-lib-inside';
import {
  BehaviorSubject,
  map,
  Observable,
  of,
  ReplaySubject,
  Subject,
} from 'rxjs';
import { UserDTO } from 'src/app/interfaces/dtos/user_dto.interface';
import { PageResponse } from 'src/app/interfaces/page/page_response.interface';
import { Pageable } from 'src/app/interfaces/page/pageable.interface';
import { UserService } from 'src/app/services/path/user/user.service';
import { ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, filter, finalize, take, timeout } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { showSnackBar } from 'src/app/utils/snackbar.utils';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import Swal from 'sweetalert2';

/**
 * @category Components
 *
 * @description
 * Component for displaying, managing, and interacting with a paginated table of users.
 * Supports activating/deactivating individual or all users, mobile-friendly hints, and table actions.
 *
 * Features:
 * - Paginated and sortable user table
 * - Toggle active/inactive users
 * - Activate/deactivate all users with confirmation dialogs
 * - Mobile responsive hints for user actions
 * - Integration with TableLayoutComponent for columns and actions
 *
 * Lifecycle:
 * - Loads users and current logged-in user info on OnInit
 * - Cleans up subscriptions on OnDestroy
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Component({
  selector: 'app-admin-users-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    TableLayoutComponent,
  ],
  templateUrl: './admin-users-list.component.html',
  styleUrl: './admin-users-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersListComponent implements OnInit, OnDestroy {
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
   * @description Subject tracking global loading state
   */
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  /**
   * @description Observable exposing global loading state
   */
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  /**
   * @description Getter function returning current loading state
   */
  get isLoading(): Function {
    return () => this.isLoadingSubject.value;
  }

  /**
   * @description Subject holding the list of users
   */
  private usersSubject = new ReplaySubject<UserDTO[]>(1);

  /**
   * @description Observable exposing users list
   */
  users$: Observable<UserDTO[]> = this.usersSubject.asObservable();

  /**
   * @description Observable holding pagination info
   */
  pagination$: BehaviorSubject<any> = new BehaviorSubject({
    totalItems: 0,
    totalPages: 0,
    currentPage: 0,
  });

  /**
   * @description Pageable parameters for API requests
   */
  pageable: Pageable = { page: 0, size: 5 };

  /**
   * @description Observable controlling whether to show active users
   */
  showActive$ = new BehaviorSubject<boolean>(true);

  /**
   * @description Tracks mobile hint visibility per user ID
   */
  showMobileHint: { [userId: number]: boolean } = {};

  /**
   * @description Flag if device is mobile
   */
  isMobile = false;

  /**
   * @description Map of loading state per user ID
   */
  private userLoadingStates = new Map<number, boolean>();

  /**
   * @description Subject used for component destruction cleanup
   */
  private destroy$ = new Subject<void>();

  /**
   * @description Columns definition for table layout
   */
  columns: TableColumn[] = [
    { field: 'userId', label: '#', width: '60px' },
    { field: 'email', label: 'Email', template: true },
    { field: 'roles', label: 'Roles', template: true },
    { field: 'registrationDate', label: 'Registration', template: true },
    { field: 'lastLogin', label: 'Last Login', template: true },
    { field: 'active', label: 'Active', template: true, width: '80px' },
  ];

  /**
   * @description Table header actions
   */
  tableActions: TableAction[] = [];

  /**
   * @description Current loaded users
   */
  private currentUsers: UserDTO[] = [];

  /**
   * @description Wrapper getter for checking if the users list is empty.
   * Used to drive empty state display in the template.
   */
  isEmptyState: () => boolean = () => this.currentUsers.length === 0;

  /**
   * @description Wrapper getter returning the logo image source.
   * Used in template to render the logo.
   */
  getLogoSrc: () => string = () => 'logo_blue-removebg.png';

  /**
   * @description Handles clicks on table action buttons.
   * Dispatches actions like toggle view or delete all.
   * @param actionId ID of the clicked action
   */
  onTableActionClicked(actionId: string): void {
    if (actionId === 'toggle-view') this.toggleUsersView();
    else if (actionId === 'delete-all') this.deleteAllUsers();
  }

  /**
   * @description Internal method to update table actions based on current state.
   * Handles button labels, icons, disabled state, and loading.
   */
  private updateTableActions(): void {
    const isActive = this.showActive$.value;
    const isLoading = this.isLoadingSubject.value;
    const isEmpty = this.currentUsers.length === 0;
    const allAdmins =
      !isEmpty && this.currentUsers.every((u) => u.roles === 'ADMIN');

    this.tableActions = [
      {
        id: 'delete-all',
        label: isActive ? 'Deactivate All' : 'Reactivate All',
        icon: isActive ? '🗑' : '✅',
        type: isActive ? 'danger-outline' : 'secondary',
        disabled: isLoading || isEmpty || allAdmins,
        tooltip: allAdmins
          ? 'All users are admins — cannot bulk deactivate'
          : '',
        loading: isLoading,
      },
      {
        id: 'toggle-view',
        label: isActive ? 'View Inactive Users' : 'View Active Users',
        icon: '👁',
        type: 'secondary',
        disabled: isLoading,
        loading: isLoading,
      },
    ];
    this.cdr.markForCheck();
  }

  /**
   * @description User service for CRUD operations
   */
  private userService = inject(UserService);

  /**
   * @description Authentication service
   */
  private authService = inject(AuthGoogleService);

  /**
   * @description ChangeDetectorRef for manual UI updates
   */
  private cdr = inject(ChangeDetectorRef);

  /**
   * @description MatSnackBar service for notifications
   */
  private snackBar = inject(MatSnackBar);

  /**
   * @description Platform ID for server/browser checks
   */
  private platformId = inject(PLATFORM_ID);

  /**
   * @description ID of the current logged-in user
   */
  currentUserId: number = 0;

  /**
   * @description Flag if current user is admin
   */
  currentUserIsAdmin: boolean = false;

  /**
   * @inheritdoc
   * @description Lifecycle hook: OnInit
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkIfMobile();
      this.loadUsers();
      this.loadCurrentUser();
    }
  }

  /**
   * @description Loads current logged-in user info
   */
  private loadCurrentUser(): void {
    const userInfo = this.authService.getCurrentUserInfo();

    if (userInfo && userInfo.userId) {
      this.currentUserId = +userInfo.userId;
      this.currentUserIsAdmin = userInfo.roles?.includes('ADMIN') ?? false;
      this.cdr.markForCheck();
      return;
    }

    this.authService.userInfo$
      .pipe(
        filter((info) => !!info && !!info.userId),
        take(1),
        timeout(2000),
      )
      .subscribe({
        next: (info) => {
          this.currentUserId = +info!.userId;
          this.currentUserIsAdmin = info!.roles?.includes('ADMIN') ?? false;
          this.cdr.markForCheck();
        },
        error: () => {
          const stored = sessionStorage.getItem('user_info');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              this.currentUserId = +parsed.userId;
              this.currentUserIsAdmin =
                parsed.roles?.includes('ADMIN') ?? false;
              this.cdr.markForCheck();
            } catch (e) {}
          }
        },
      });
  }

  /**
   * @inheritdoc
   * @description Lifecycle hook: OnDestroy
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * @description Host listener for window resize events
   * @param event Resize event
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkIfMobile();
  }

  /**
   * @description Checks if the viewport qualifies as mobile
   */
  private checkIfMobile() {
    this.isMobile = window.innerWidth <= 768;
    this.cdr.markForCheck();
  }

  /**
   * @description Loads users list based on current pageable and active status
   */
  loadUsers(): void {
    this.isLoadingSubject.next(true);
    this.updateTableActions();
    const showActive = this.showActive$.value;

    const observable = showActive
      ? this.userService.getUsers(this.pageable)
      : this.userService.getDeletedUsers(this.pageable);

    observable
      .pipe(
        map((response: PageResponse<UserDTO>) => {
          this.pagination$.next({
            totalItems: response.totalElements,
            totalPages: response.totalPages,
            currentPage: response.pageNumber,
          });
          this.usersSubject.next(response.content);
          this.currentUsers = response.content;
          return response.content;
        }),
        catchError((error) => {
          console.error('Error loading users:', error);
          this.usersSubject.next([]);
          this.currentUsers = [];
          return of([]);
        }),
        finalize(() => {
          this.isLoadingSubject.next(false);
          this.updateTableActions();
          this.cdr.markForCheck();
        }),
      )
      .subscribe();
  }

  /**
   * @description Toggles active/inactive user view
   */
  toggleUsersView(): void {
    this.closeAllMobileHints();
    const current = this.showActive$.value;
    this.showActive$.next(!current);
    this.pageable.page = 0;
    this.loadUsers();
  }

  /**
   * @description Handles page change from pagination controls
   * @param event Event containing pageIndex and pageSize
   */
  onPageChanged(event: any): void {
    this.closeAllMobileHints();
    this.pageable.page = event.pageIndex;
    this.pageable.size = event.pageSize;
    this.loadUsers();
  }

  /**
   * @description Updates a single user's data
   * @param userId ID of the user
   * @param user Updated user data
   */
  updateUser(userId: number, user: UserDTO): void {
    if (!userId) return;

    this.isLoadingSubject.next(true);
    this.userService
      .updateUser(userId, user)
      .pipe(
        finalize(() => {
          this.isLoadingSubject.next(false);
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          showSnackBar(this.snackBar, 'User updated successfully');
          this.loadUsers();
          this.removeFocusAndSelectText();
        },
        error: () => {
          showSnackBar(this.snackBar, 'Error updating user');
        },
      });
  }

  /**
   * @description Bulk deactivates/reactivates all users
   */
  deleteAllUsers(): void {
    if (this.isLoadingSubject.value) return;

    const showActive = this.showActive$.value;

    Swal.fire({
      title: showActive ? 'Deactivate all users?' : 'Reactivate all users?',
      text: showActive
        ? 'All active users will be deactivated.'
        : 'All inactive users will be reactivated.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: showActive
        ? 'Yes, deactivate all'
        : 'Yes, reactivate all',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.isLoadingSubject.next(true);
      this.updateTableActions();

      const action$ = showActive
        ? this.userService.deleteAllUsers()
        : this.userService.reactivateAllUsers();

      action$
        .pipe(
          finalize(() => {
            this.isLoadingSubject.next(false);
            this.updateTableActions();
            this.cdr.markForCheck();
          }),
        )
        .subscribe({
          next: (response: any) => {
            const message =
              response?.message ??
              (showActive
                ? 'All active users have been successfully deactivated'
                : 'All inactive users have been successfully reactivated');

            showSnackBar(this.snackBar, message);
            this.loadUsers();
          },
          error: (error: HttpErrorResponse) => {
            const message =
              error?.error?.message ??
              (showActive
                ? 'Failed to deactivate users'
                : 'Failed to reactivate users');

            showSnackBar(this.snackBar, message);
            this.loadUsers();
          },
        });
    });
  }

  /**
   * @description Toggles a user's active status individually
   * @param user User object to toggle
   */
  toggleActive(user: UserDTO): void {
    if (!user.userId || this.isUserLoading(user.userId)) return;

    const newStatus = !user.active;

    Swal.fire({
      title: newStatus ? 'Activate user?' : 'Deactivate user?',
      text: `User "${user.email}" will be ${newStatus ? 'activated' : 'deactivated'}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: newStatus ? 'Yes, activate' : 'Yes, deactivate',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.showMobileHint[user.userId!] = false;
      this.setUserLoading(user.userId!, true);

      const updatedUser: UserDTO = {
        ...user,
        active: newStatus,
      };

      this.userService
        .updateUser(user.userId!, updatedUser)
        .pipe(
          finalize(() => {
            this.setUserLoading(user.userId!, false);
            this.cdr.markForCheck();
          }),
        )
        .subscribe({
          next: () => {
            const status = updatedUser.active ? 'active' : 'inactive';

            showSnackBar(
              this.snackBar,
              `User updated successfully, now ${status}`,
            );

            if (this.showActive$.value !== updatedUser.active) {
              this.loadUsers();
            } else {
              this.users$ = this.users$.pipe(
                map((users) =>
                  users.map((u) =>
                    u.userId === updatedUser.userId ? updatedUser : u,
                  ),
                ),
              );
            }
          },
          error: () => {
            showSnackBar(this.snackBar, 'Error updating user status');
          },
        });
    });
  }

  /**
   * @description Removes focus and triggers change detection
   */
  removeFocusAndSelectText(): void {
    this.cdr.detectChanges();
  }

  /**
   * @description Toggles mobile hint for a specific user
   * @param userId ID of the user
   */
  toggleMobileHint(userId: number) {
    const isCurrentlyOpen = this.showMobileHint[userId];
    this.closeAllMobileHints();
    this.showMobileHint[userId] = !isCurrentlyOpen;
  }

  /**
   * @description Closes all mobile hints
   */
  closeAllMobileHints() {
    this.showMobileHint = {};
  }

  /**
   * @description Checks if a user is the current logged-in user
   * @param userId ID of the user
   * @returns True if current user
   */
  isCurrentUser(userId: number): boolean {
    return this.currentUserIsAdmin && userId === this.currentUserId;
  }

  /**
   * @description Checks if a user is currently in loading state
   * @param userId ID of the user
   * @returns True if user is loading
   */
  isUserLoading(userId: number): boolean {
    return this.userLoadingStates.get(userId) || false;
  }

  /**
   * @description Sets a user's loading state
   * @param userId ID of the user
   * @param loading True if loading
   */
  private setUserLoading(userId: number, loading: boolean): void {
    if (loading) {
      this.userLoadingStates.set(userId, true);
    } else {
      this.userLoadingStates.delete(userId);
    }
    this.cdr.markForCheck();
  }
}
