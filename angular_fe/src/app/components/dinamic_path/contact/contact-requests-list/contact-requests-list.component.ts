import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { ContactMethod } from 'src/app/interfaces/dtos/contact/contactMethod.enum';
import { ContactRequestDTO } from 'src/app/interfaces/dtos/contact/contactRequestDTO.interface';
import { RequestStatus } from 'src/app/interfaces/dtos/contact/requestStatus.enum';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  BehaviorSubject,
  catchError,
  filter,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProfileService } from 'src/app/services/path/profile/profile.service';
import { MatDividerModule } from '@angular/material/divider';
import {
  EmptyStateComponent,
  SpinnerComponent,
  TableColumn,
  TableLayoutComponent,
} from 'my-lib-inside';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ApiConfigService } from 'src/app/services/api-config/api-config.service';
import { showSnackBar } from 'src/app/utils/snackbar.utils';
import Swal from 'sweetalert2';
import { getTimeAgo } from 'src/app/utils/date-utils';
import {
  canAcceptMeeting,
  canCloseNonMeeting,
  canHide,
  canReject,
  convertBlobToBase64,
  getAvailableActions,
  getBadgeColorClass,
  getEmptyStateMessage,
  getEmptyStateSubtitle,
  getFullImageUrl,
  getRejectErrorMessage,
  getStatusLabel,
  getStatusPriority,
  isActionable,
  isReceiver,
  isSender,
  parseSubject,
} from 'src/app/utils/contact-request-list-utils';
import { ContactRequestService } from 'src/app/services/path/contact/contact-request/contact-request.service';

/**
 * @category Components
 * 
 * @description
 * Manages the interactive table of contact requests.
 *
 * Features include:
 * - Status badge counters (PENDING / ACCEPTED / REJECTED)
 * - Dropdown filters (Status + Contact Method)
 * - Table columns: User, Subject, Status, Method, Created, Notes, Sender Email, Sender Phone, Actions
 * - Custom pagination
 * - Loading spinner
 *
 * Visual logic:
 * - Up arrow icon (red) for sent requests | "Outbound · You sent"
 * - Down arrow icon (green) for received requests | "Inbound · You received"
 * - Subject split into "label:" and "product" with different styles
 * - Color-coded badges for status (red = PENDING, green = ACCEPTED, gray = REJECTED)
 * - Circular profile images (30x30) next to the name
 *
 * Utility functions exposed to the template:
 * - getTimeAgo, getStatusLabel, getBadgeColorClass, parseSubject, getFullImageUrl
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Component({
  selector: 'app-contact-requests-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
    SpinnerComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    EmptyStateComponent,
    TableLayoutComponent,
  ],
  templateUrl: './contact-requests-list.component.html',
  styleUrl: './contact-requests-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactRequestsListComponent implements OnInit {
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
   * @property showFilters
   * @description Whether to display the filter dropdowns in the table UI.
   * @type {boolean}
   * @default true
   */
  @Input() showFilters: boolean = true;

  /** @event requestProcessed - Fired when a request has been accepted, rejected, or hidden */
  @Output() requestProcessed = new EventEmitter<void>();

  /** @event requestSelected - Fired when a request row is selected */
  @Output() requestSelected = new EventEmitter<ContactRequestDTO>();

  // ───────────────────────────────────────────── Services ─────────────────────────────────────────────

  /** @description Service to fetch contact requests */
  private contactRequestService = inject(ContactRequestService);

  /** @description Auth service for current user info */
  private authGoogleService = inject(AuthGoogleService);

  /** @description Service to fetch user profile images */
  private profileService = inject(ProfileService);

  /** @description ChangeDetectorRef for manual template updates */
  private cdRef = inject(ChangeDetectorRef);

  /** @description API config service to resolve full image URLs */
  private apiConfigService = inject(ApiConfigService);

  /** @description MatSnackBar for toast notifications */
  private snackBar = inject(MatSnackBar);

  // ────────────────────────────────────────── Reactive signals / component state ─────────────────────────────────────────

  /** @description All fetched contact requests */
  requests = signal<ContactRequestDTO[]>([]);

  /** @description Filtered contact requests based on status/method */
  filteredRequests = signal<ContactRequestDTO[]>([]);

  /** @description Error message for UI display */
  error = signal('');

  /** @description Current user ID */
  currentUserId = signal<number | null>(null);

  /** @description Current user roles */
  currentUserRoles = signal<string[]>([]);

  /** @description Whether there is data in the database */
  hasDataInDb = signal<boolean>(false);

  /** @description Cached profile images by user ID (base64) */
  userImages = signal<Map<number, string>>(new Map());

  // ───────────────────────────────────────────── Pagination ─────────────────────────────────────────────

  /** @description Number of rows per page */
  pageSize: number = 5;

  /** @description Current page index */
  currentPage: number = 0;

  // ───────────────────────────────────────────── Filters ─────────────────────────────────────────────

  /** @description Status filter for the table, 'ALL' shows all statuses */
  statusFilter = signal<RequestStatus | 'ALL'>('ALL');

  /** @description Contact method filter for the table, 'ALL' shows all methods */
  methodFilter = signal<ContactMethod | 'ALL'>('ALL');

  // ───────────────────────────────────────────── Template helper functions ─────────────────────────────────────────────

  /** @description Enum mapping for ContactMethod */
  contactMethod = ContactMethod;

  /** @description Enum mapping for RequestStatus */
  requestStatus = RequestStatus;

  /** @description Utility function to show "time ago" format */
  getTimeAgo = getTimeAgo;

  /** @description Utility function to get human-readable status label */
  getStatusLabel = getStatusLabel;

  /** @description Utility function to determine badge CSS class based on status */
  getBadgeColorClass = getBadgeColorClass;

  /** @description Utility function to parse subject string */
  parseSubject = parseSubject;

  /** @description Utility function to resolve full image URL */
  getFullImageUrl = (url: string) =>
    getFullImageUrl(url, this.apiConfigService);

  /** @description Placeholder spinner image path */
  spinner = '/t.png';

  /** @description Returns spinner path for the template */
  getspinner: Function = () => this.spinner;

  // ───────────────────────────────────────────── State / UI helpers ─────────────────────────────────────────────

  /** @description Tracks which row info section is expanded */
  infoRowId: string | null = null;

  /** @description Whether the viewport is mobile size */
  isMobile = false;

  /** @description Subject tracking loading state */
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  /** @description Observable for loading spinner */
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  /** @description Returns loading state as function for template usage */
  get isLoading(): Function {
    return () => this.isLoadingSubject.value;
  }

  /** @description Returns loading state as boolean for TS code */
  get isLoadingValue(): boolean {
    return this.isLoadingSubject.value;
  }

  // ───────────────────────────────────────────── Table layout ─────────────────────────────────────────────

  /** @description Table columns definition for lib-table-layout */
  columns: TableColumn[] = [
    { field: 'sender', label: 'User', template: true, minWidth: '140px' },
    { field: 'subject', label: 'Subject', template: true, minWidth: '120px' },
    { field: 'status', label: 'Status', template: true, width: '90px' },
    { field: 'preferredContactMethod', label: 'Method', width: '80px' },
    { field: 'createdAt', label: 'Created', template: true, width: '80px' },
    {
      field: 'additionalNotes',
      label: 'Notes',
      template: true,
      width: '160px',
    },
    { field: 'senderContactEmail', label: 'Sender Email', minWidth: '120px' },
    { field: 'senderPhone', label: 'Sender Phone', width: '110px' },
  ];

  /**
   * @inheritdoc
   * @description
   * Angular lifecycle hook called on component initialization.
   * - Checks if the viewport is mobile and sets internal state.
   * - Subscribes to window resize events to re-check mobile layout.
   * - Loads the initial list of requests.
   */
  ngOnInit(): void {
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
    this.loadRequests();
  }

  /**
   * @description Handler for page changes from the paginator.
   * @param {{ pageIndex: number; pageSize: number }} event - Pagination change event.
   * @returns {void}
   */
  onPageChanged(event: { pageIndex: number; pageSize: number }): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cdRef.markForCheck();
  }

  /**
   * @description Applies current status and method filters to the list of requests.
   * Updates the filteredRequests signal and resets the current page to 0.
   * @returns {void}
   */
  applyFilters(): void {
    const statusFilter = this.statusFilter();
    const methodFilter = this.methodFilter();

    let filtered = this.requests();

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }
    if (methodFilter !== 'ALL') {
      filtered = filtered.filter(
        (r) => r.preferredContactMethod === methodFilter,
      );
    }

    this.filteredRequests.set(filtered);
    this.currentPage = 0;
    this.cdRef.markForCheck();
  }

  /**
   * @description Handler for status filter changes.
   * @param {RequestStatus | 'ALL'} status - The new status filter value.
   * @returns {void}
   */
  onStatusFilterChange(status: RequestStatus | 'ALL'): void {
    this.statusFilter.set(status);
    this.applyFilters();
  }

  /**
   * @description Handler for contact method filter changes.
   * @param {ContactMethod | 'ALL'} method - The new contact method filter value.
   * @returns {void}
   */
  onMethodFilterChange(method: ContactMethod | 'ALL'): void {
    this.methodFilter.set(method);
    this.applyFilters();
  }

  /**
   * @description Returns the number of requests that match a given status.
   * @param {RequestStatus} status - The status to count.
   * @returns {number} Count of requests with the specified status.
   */
  getBadgeCount(status: RequestStatus): number {
    return this.requests().filter((req) => req.status === status).length;
  }

  /**
   * @description Loads all profile images for the currently filtered requests.
   * Converts images to base64 and caches them in the userImages map.
   * @returns {Observable<boolean>} Emits true when all images are loaded or false on error.
   */
  loadAllProfileImages(): Observable<boolean> {
    const requests = this.filteredRequests();

    const uniqueUserIds = new Set<number>();
    const userImageUrls = new Map<number, string>();

    requests.forEach((request) => {
      if (request.sender?.userId && request.sender?.profileImageUrl) {
        uniqueUserIds.add(request.sender.userId);
        userImageUrls.set(
          request.sender.userId,
          request.sender.profileImageUrl,
        );
      }
      if (request.receiver?.userId && request.receiver?.profileImageUrl) {
        uniqueUserIds.add(request.receiver.userId);
        userImageUrls.set(
          request.receiver.userId,
          request.receiver.profileImageUrl,
        );
      }
    });

    const imagesToLoad: Observable<{
      userId: number;
      base64: string;
    } | null>[] = [];

    uniqueUserIds.forEach((userId) => {
      if (this.userImages().has(userId)) return;

      const imageUrl = userImageUrls.get(userId);
      if (!imageUrl) return;

      const fullUrl = this.getFullImageUrl(imageUrl);

      imagesToLoad.push(
        this.profileService.getImageByUrl(fullUrl).pipe(
          switchMap((blob) => convertBlobToBase64(blob)),
          map((base64) => ({ userId, base64 })),
          catchError(() => of(null)),
        ),
      );
    });

    if (imagesToLoad.length === 0) return of(true);

    return forkJoin(imagesToLoad).pipe(
      map((results) => {
        const currentMap = new Map(this.userImages());
        results.forEach((result) => {
          if (result) currentMap.set(result.userId, result.base64);
        });
        this.userImages.set(currentMap);
        setTimeout(() => this.cdRef.detectChanges(), 0);
        return true;
      }),
      catchError((error) => {
        console.error('❌ Error in forkJoin:', error);
        return of(false);
      }),
    );
  }

  /**
   * @description Returns the base64 profile image for a given user, or null if not available.
   * @param {number} userId - The user ID whose image is requested.
   * @returns {string | null} Base64 string of the user's profile image.
   */
  getProfileImage(userId: number): string | null {
    return this.userImages().get(userId) || null;
  }

  /**
   * @description Loads all contact requests for the current user, sorts them by status and creation date, applies filters, and loads profile images.
   * @returns {void}
   */
  loadRequests(): void {
    this.isLoadingSubject.next(true);
    this.error.set('');

    this.authGoogleService.userInfo$
      .pipe(
        take(1),
        filter((userInfo) => !!userInfo),
        tap((userInfo) => {
          this.currentUserId.set(+userInfo.userId);
          this.currentUserRoles.set(userInfo.roles);
        }),
        switchMap(() => {
          const userId = this.currentUserId();
          if (!userId || userId <= 0) throw new Error('Invalid user ID');

          return forkJoin([
            this.contactRequestService.getRequestsByReceiver(userId),
            this.contactRequestService.getRequestsBySender(userId),
          ]).pipe(
            map(([asReceiver, asSender]) => {
              const sorted = [...asReceiver, ...asSender].sort((a, b) => {
                const aPriority = getStatusPriority(a.status!);
                const bPriority = getStatusPriority(b.status!);
                if (aPriority !== bPriority) return aPriority - bPriority;
                return (
                  new Date(b.createdAt!).getTime() -
                  new Date(a.createdAt!).getTime()
                );
              });

              this.requests.set(sorted);
              this.hasDataInDb.set(sorted.length > 0);
              this.filteredRequests.set(sorted);
              return sorted;
            }),
          );
        }),
        switchMap((sortedRequests) =>
          this.loadAllProfileImages().pipe(
            map(() => sortedRequests),
            catchError((error) => {
              console.error('❌ Error loading images:', error);
              return of(sortedRequests);
            }),
          ),
        ),
        finalize(() => this.isLoadingSubject.next(false)),
      )
      .subscribe({
        next: () => this.cdRef.detectChanges(),
        error: (error) => {
          this.error.set('Failed to load contact requests');
          console.error('Error loading requests:', error);
        },
      });
  }

  /**
   * @description Rejects a contact request after prompting the user for a reason.
   * Shows a confirmation dialog and handles API response.
   * @param {ContactRequestDTO} request - The request object to reject.
   * @returns {void}
   */
  rejectRequest(request: ContactRequestDTO): void {
    if (!request.requestId) return;

    Swal.fire({
      title: 'Reject Request',
      text: 'Please provide a reason for rejection:',
      icon: 'warning',
      input: 'textarea',
      inputPlaceholder: 'Type your reason here...',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      inputValidator: (value) =>
        !value || !value.trim() ? 'You need to provide a reason!' : null,
    }).then((result) => {
      if (!result.isConfirmed) {
        showSnackBar(this.snackBar, 'Rejection cancelled');
        return;
      }

      this.isLoadingSubject.next(true);
      const reason = result.value.trim();

      this.contactRequestService
        .rejectRequest(request.requestId!, reason)
        .pipe(finalize(() => this.isLoadingSubject.next(false)))
        .subscribe({
          next: () => {
            showSnackBar(this.snackBar, 'Request rejected successfully');
            this.loadRequests();
            this.requestProcessed.emit();
          },
          error: (error) => {
            const errorMsg = getRejectErrorMessage(error);
            showSnackBar(this.snackBar, errorMsg);
          },
        });
    });
  }

  /**
   * @description Accepts a contact request after user confirmation.
   * Shows a confirmation dialog and handles API response.
   * @param {ContactRequestDTO} request - The request object to accept.
   * @returns {void}
   */
  acceptRequest(request: ContactRequestDTO): void {
    if (!this.currentUserId()) {
      showSnackBar(this.snackBar, 'User not authenticated');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to accept this request?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, accept!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (!result.isConfirmed) {
        showSnackBar(this.snackBar, 'Accept cancelled');
        return;
      }

      this.isLoadingSubject.next(true);
      this.contactRequestService
        .acceptRequest(request.requestId!)
        .pipe(finalize(() => this.isLoadingSubject.next(false)))
        .subscribe({
          next: () => {
            showSnackBar(this.snackBar, 'Request accepted successfully');
            this.loadRequests();
            this.requestProcessed.emit();
          },
          error: (error) => {
            console.error('Error:', error);
            showSnackBar(this.snackBar, 'Error accepting request');
          },
        });
    });
  }

  /**
   * @description Hides a contact request from the current user's view after confirmation.
   * @param {ContactRequestDTO} request - The request object to hide.
   * @returns {void}
   */
  hideRequest(request: ContactRequestDTO): void {
    if (!request.requestId) return;

    Swal.fire({
      title: 'Hide Request?',
      text: 'This request will disappear from your view. Are you sure?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, hide it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.isLoadingSubject.next(true);
      this.contactRequestService
        .hideRequest(request.requestId!)
        .pipe(finalize(() => this.isLoadingSubject.next(false)))
        .subscribe({
          next: () => {
            showSnackBar(this.snackBar, 'Request hidden successfully');
            this.loadRequests();
            this.requestProcessed.emit();
          },
          error: (error) => {
            console.error('Error hiding request:', error);
            showSnackBar(
              this.snackBar,
              error.message || 'Error hiding request',
            );
          },
        });
    });
  }

  /**
   * @description Determines if a request is actionable (i.e., can be accepted or rejected).
   * Delegates to the `isActionable` utility function.
   * @param {ContactRequestDTO} request - The contact request to check.
   * @returns {boolean} True if the request can be acted upon, false otherwise.
   */
  isActionable(request: ContactRequestDTO): boolean {
    return isActionable(request);
  }

  /**
   * @description Checks if the current user is the receiver of the given request.
   * Delegates to the `isReceiver` utility function.
   * @param {ContactRequestDTO} request - The contact request to check.
   * @returns {boolean} True if the current user is the receiver, false otherwise.
   */
  isReceiver(request: ContactRequestDTO): boolean {
    return isReceiver(request, this.currentUserId());
  }

  /**
   * @description Checks if the current user is the sender of the given request.
   * Delegates to the `isSender` utility function.
   * @param {ContactRequestDTO} request - The contact request to check.
   * @returns {boolean} True if the current user is the sender, false otherwise.
   */
  isSender(request: ContactRequestDTO): boolean {
    return isSender(request, this.currentUserId());
  }

  /**
   * @description Determines if the current user can accept a meeting request.
   * Delegates to the `canAcceptMeeting` utility function.
   * @param {ContactRequestDTO} request - The contact request to check.
   * @returns {boolean} True if the user can accept the meeting, false otherwise.
   */
  canAcceptMeeting(request: ContactRequestDTO): boolean {
    return canAcceptMeeting(request, this.currentUserId());
  }

  /**
   * @description Determines if the current user can close a non-meeting request.
   * Delegates to the `canCloseNonMeeting` utility function.
   * @param {ContactRequestDTO} request - The contact request to check.
   * @returns {boolean} True if the user can close the non-meeting request, false otherwise.
   */
  canCloseNonMeeting(request: ContactRequestDTO): boolean {
    return canCloseNonMeeting(request, this.currentUserId());
  }

  /**
   * @description Determines if the current user can reject the given request.
   * Delegates to the `canReject` utility function.
   * @param {ContactRequestDTO} request - The contact request to check.
   * @returns {boolean} True if the user can reject the request, false otherwise.
   */
  canReject(request: ContactRequestDTO): boolean {
    return canReject(request, this.currentUserId());
  }

  /**
   * @description Determines if the current user can hide the given request from their view.
   * Delegates to the `canHide` utility function.
   * @param {ContactRequestDTO} request - The contact request to check.
   * @returns {boolean} True if the request can be hidden, false otherwise.
   */
  canHide(request: ContactRequestDTO): boolean {
    return canHide(request, this.currentUserId());
  }

  /**
   * @description Calculates the total number of pages based on filtered requests and pageSize.
   * @returns {number} Total number of pages.
   */
  getTotalPages(): number {
    return Math.ceil(this.filteredRequests().length / this.pageSize);
  }

  // ────────────────────────────────────────── Arrow functions for template usage ────────────────────────────────────────

  /**
   * @description Returns true if filtered requests exist and DB has data
   * @returns {boolean}
   */
  isEmptyState = (): boolean =>
    this.filteredRequests().length === 0 && this.hasDataInDb();

  /**
   * @description Returns true if no data exists in DB
   * @returns {boolean}
   */
  isNoData = (): boolean => !this.hasDataInDb();

  /**
   * @description Returns the logo source path
   * @returns {string} Logo path
   */
  getLogoSrc = (): string => 'logo_blue-removebg.png';

  // ───────────────────────────────────────────── Empty state message dinamic ─────────────────────────────────────────────

  /**
   * @description
   * Wrapper for `getEmptyStateMessage`. Computes the main empty-state message
   * based on the currently selected status and method filters.
   */
  get emptyStateMessage(): string {
    return getEmptyStateMessage(this.statusFilter(), this.methodFilter());
  }

  /**
   * @description
   * Wrapper for `getEmptyStateSubtitle`. Computes the subtitle for the empty state
   * based on the currently selected status and method filters.
   */
  get emptyStateSubtitle(): string {
    return getEmptyStateSubtitle(this.statusFilter(), this.methodFilter());
  }

  /**
   * @description Toggles the expanded info row in the table.
   * @param {string} id - The row ID to toggle.
   * @returns {void}
   */
  toggleInfo(id: string): void {
    this.infoRowId = this.infoRowId === id ? null : id;
  }

  /**
   * @description Checks if a specific info row is open.
   * @param {string} id - The row ID to check.
   * @returns {boolean} True if the row info is currently open.
   */
  isInfoOpen(id: string): boolean {
    return this.infoRowId === id;
  }

  /**
   * @description Determines which actions are available for a given request.
   * @param {ContactRequestDTO} request - The request to check.
   * @returns {string[]} List of available actions.
   */
  getAvailableActions(request: ContactRequestDTO): string[] {
    return getAvailableActions(request, this.currentUserId());
  }

  /**
   * @description Checks if the viewport is mobile and updates the isMobile flag.
   */
  checkMobile() {
    this.isMobile = window.innerWidth <= 1052;
  }
}
