import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, forkJoin, map, take, timeout } from 'rxjs';
import { AppointmentDTO } from 'src/app/interfaces/dtos/contact/appointment_dto.interface';
import { AppointmentStatus } from 'src/app/interfaces/dtos/contact/appointmentStatus.enum';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import { AppointmentService } from 'src/app/services/path/appointment/appointment.service';
import { EmptyStateComponent } from 'my-lib-inside';
import { AppointmentDetailDialogComponent } from '../appointment-detail-dialog/appointment-detail-dialog.component';
import {
  AppointmentsCalendarComponent,
  CalendarEventAction,
} from 'src/app/components/calendar/appointments-calendar/appointments-calendar.component';
import { AppointmentProposalService } from 'src/app/services/path/contact/appointment-proposal/appointment-proposal.service';
import Swal from 'sweetalert2';
import { AppointmentProposalDTO } from 'src/app/interfaces/dtos/contact/appointment_proposal_dto';
import { ProposalFormComponent } from '../proposal-form/proposal-form.component';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * @category Components
 *
 * @description
 * Component responsible for displaying the list of appointments for the current user,
 * including requested and organized appointments. Provides calendar integration,
 * proposal handling, confirmation, rejection, cancellation, and contact actions.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @implements OnInit
 */
@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    EmptyStateComponent,
    AppointmentsCalendarComponent,
  ],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsListComponent implements OnInit {
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
   * @property appointmentUpdated
   * @description Event emitter triggered after an appointment is updated (confirmed, rejected, cancelled, proposed)
   */
  @Output() appointmentUpdated = new EventEmitter<void>();

  /** @description Service for appointment operations (CRUD, confirmation, cancellation) */
  private appointmentService = inject(AppointmentService);

  /** @description Service for handling appointment proposals */
  private proposalService = inject(AppointmentProposalService);

  /** @description Auth service to get current user information */
  private authService = inject(AuthGoogleService);

  /** @description Current platform identifier (browser/server) */
  private platformId = inject(PLATFORM_ID);

  /** @description Angular Material Dialog service for opening dialogs/modals */
  private dialog = inject(MatDialog);

  /* ───────────────────────────────────────────── Signals / Reactive state ───────────────────────────────────────────── */

  /** @description Reactive signal storing the list of appointments */
  appointments = signal<AppointmentDTO[]>([]);

  /** @description Reactive signal indicating whether the component is loading data */
  loading = signal(true);

  /** @description Reactive signal storing error messages */
  error = signal('');

  /** @description Exposes AppointmentStatus enum to the template */
  AppointmentStatus = AppointmentStatus;

  /** @description Stores the current logged-in user's ID, null if not loaded yet */
  currentUserId: number | null = null;

  /** @description Maps appointmentId to pending proposals for quick lookup */
  proposalsMap = signal<Map<number, AppointmentProposalDTO | null>>(new Map());

  // ───────────────────────────────────────────── Calendar events ─────────────────────────────────────────────

  /**
   * @description Calendar events computed from appointments
   */
  calendarEvents = computed(() =>
    this.appointments().map((a) => ({
      id: a.appointmentId!,
      title: a.title.replace(/^Meeting:\s*/, ''),
      date: a.appointmentDatetime,
      status: a.status,
      organizerId: a.organizer?.userId,
      pendingProposal:
        a.status === AppointmentStatus.RESCHEDULED ||
        a.status === AppointmentStatus.PENDING
          ? (this.proposalsMap().get(a.appointmentId) ?? null)
          : null,
    })),
  );

  /**
   * @inheritdoc
   * @description Angular OnInit lifecycle hook.
   * Checks if running in browser, then fetches the current user ID and loads appointments.
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.getCurrentUserId();
      this.loadAppointments();
    }
  }

  /**
   * @description Fetches the current user ID from auth service or session storage
   */
  private getCurrentUserId(): void {
    const userInfo = this.authService.getCurrentUserInfo();

    if (userInfo?.userId) {
      this.currentUserId = +userInfo.userId;
      return;
    }

    this.authService.userInfo$
      .pipe(
        filter((i) => !!i?.userId),
        take(1),
        timeout(2000),
      )
      .subscribe({
        next: (info) => {
          this.currentUserId = +info!.userId;
          this.loadAppointments();
        },
        error: () => {
          try {
            const s = sessionStorage.getItem('user_info');
            if (s) {
              this.currentUserId = +JSON.parse(s).userId;
            }
          } catch {}
        },
      });
  }

  /**
   * @description Loads all appointments for the current user, sorts them by status and date
   */
  loadAppointments(): void {
    this.loading.set(true);
    this.error.set('');

    this.appointmentService.getUserAppointments(this.currentUserId!).subscribe({
      next: (response) => {
        const data = response.data;
        const all = [
          ...(data?.requested || []),
          ...(data?.organized || []),
        ].sort((a, b) => {
          const order: Record<AppointmentStatus, number> = {
            [AppointmentStatus.PENDING]: 0,
            [AppointmentStatus.CONFIRMED]: 1,
            [AppointmentStatus.RESCHEDULED]: 2,
            [AppointmentStatus.COMPLETED]: 3,
            [AppointmentStatus.CANCELLED]: 4,
            [AppointmentStatus.NO_SHOW]: 5,
          };
          const diff = order[a.status] - order[b.status];
          if (diff !== 0) return diff;
          return (
            new Date(b.appointmentDatetime).getTime() -
            new Date(a.appointmentDatetime).getTime()
          );
        });

        this.appointments.set(all);
        this.loading.set(false);

        this.loadPendingProposals(all);
      },
      error: (err) => {
        this.error.set('Failed to load appointments');
        this.loading.set(false);
      },
    });
  }

  /**
   * @description Loads pending proposals for appointments in PENDING or RESCHEDULED status
   * @param appointments - Array of appointments to check for pending proposals
   */
  private loadPendingProposals(appointments: AppointmentDTO[]): void {
    const toLoad = appointments.filter(
      (a) =>
        a.status === AppointmentStatus.RESCHEDULED ||
        a.status === AppointmentStatus.PENDING,
    );

    if (toLoad.length === 0) {
      return;
    }

    const proposalsMap = new Map<number, AppointmentProposalDTO | null>();

    const requests = toLoad.map((a) =>
      this.proposalService.getProposals(a.appointmentId).pipe(
        map((proposals) => {
          const pending = proposals.find(
            (p) =>
              p.status === 'PENDING' &&
              p.proposedBy.userId !== this.currentUserId,
          );
          proposalsMap.set(a.appointmentId, pending ?? null);
        }),
      ),
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.proposalsMap.set(proposalsMap);
      },
      error: (err: HttpErrorResponse) =>
        console.error('Error loading proposals:', err.message),
    });
  }
  // ───────────────────────────────────── Gestione azioni dal popover del calendario ───────────────────────────────────

  /**
   * @description Handles actions from the calendar popover
   * @param action - Calendar event action
   */
  onCalendarAction(action: CalendarEventAction): void {
    const apt = this.appointments().find(
      (a) => a.appointmentId === action.event.id,
    );
    if (!apt) return;

    switch (action.type) {
      case 'details':
        this.openDetails(apt);
        break;
      case 'confirm':
        this.handleConfirm(apt);
        break;
      case 'propose':
        this.openProposeDialog(apt);
        break;
      case 'reject':
        this.handleReject(apt);
        break;
      case 'contact':
        this.contactOther(apt);
        break;
      case 'cancel':
        this.cancelApt(apt);
        break;
    }
  }

  /**
   * @description Handles confirming an appointment or accepting a proposal
   * @param apt - Appointment to confirm
   */
  private handleConfirm(apt: AppointmentDTO): void {
    const isPending = apt.status === AppointmentStatus.PENDING;
    const isRescheduled = apt.status === AppointmentStatus.RESCHEDULED;

    if (!isPending && !isRescheduled) return;
    const proposal = this.proposalsMap().get(apt.appointmentId);

    if (proposal) {
      Swal.fire({
        title: 'Accept proposal?',
        html: `<div style="text-align:left;font-size:0.85rem">
        ${proposal.proposedDatetime ? `<p><strong>📅 Date:</strong> ${new Date(proposal.proposedDatetime).toLocaleString('it-IT')}</p>` : ''}
        ${proposal.proposedLocationAddress ? `<p><strong>📍 Location:</strong> ${proposal.proposedLocationAddress}</p>` : ''}
        ${proposal.proposedDuration ? `<p><strong>⏱ Duration:</strong> ${proposal.proposedDuration} min</p>` : ''}
      </div>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, accept',
        cancelButtonText: 'Back',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#94a3b8',
        reverseButtons: true,
      }).then((result) => {
        if (!result.isConfirmed) return;
        this.proposalService
          .acceptProposal(proposal.proposalId!, this.currentUserId!)
          .subscribe({
            next: () => {
              this.loadAppointments();
              this.appointmentUpdated.emit();
              Swal.fire({
                icon: 'success',
                title: 'Proposal accepted!',
                timer: 1800,
                showConfirmButton: false,
              });
            },
            error: () =>
              Swal.fire('Error', 'Unable to accept proposal.', 'error'),
          });
      });
    } else {
      Swal.fire({
        title: isPending ? 'Confirm appointment?' : 'Confirm updated schedule?',
        html: `<p style="margin:0;font-size:0.85rem">
        Confirming <strong>${apt.title}</strong> as scheduled.
      </p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, confirm',
        cancelButtonText: 'Back',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#94a3b8',
        reverseButtons: true,
      }).then((result) => {
        if (!result.isConfirmed) return;
        this.appointmentService
          .confirmAppointment(apt.appointmentId, this.currentUserId!)
          .subscribe({
            next: (response) => {
              this.updateInList(response.data);
              this.appointmentUpdated.emit();
              Swal.fire({
                icon: 'success',
                title: 'Confirmed!',
                timer: 1800,
                showConfirmButton: false,
              });
            },
            error: () => Swal.fire('Error', 'Unable to confirm.', 'error'),
          });
      });
    }
  }

  // ───────────────────────────────────────────── REJECT ─────────────────────────────────────────────

  /**
   * @description Handles rejecting a pending proposal, cancelling appointment if necessary
   * @param apt - Appointment to reject
   */
  private handleReject(apt: AppointmentDTO): void {
    if (apt.status !== AppointmentStatus.RESCHEDULED) return;

    // Carica le proposte pendenti fatte dall'ALTRO utente
    this.proposalService.getProposals(apt.appointmentId).subscribe({
      next: (proposals) => {
        const pending = proposals.filter(
          (p) =>
            p.status === 'PENDING' &&
            p.proposedBy.userId !== this.currentUserId,
        );

        if (pending.length === 0) {
          Swal.fire(
            'No proposals',
            'No pending proposals from the other party.',
            'info',
          );
          return;
        }

        const p = pending[0];
        const rows = [
          p.proposedDatetime
            ? `<tr>
               <td style="color:#94a3b8;font-size:0.72rem;padding:3px 8px 3px 0">📅 New date</td>
               <td style="font-size:0.78rem;font-weight:600">
                 ${new Date(p.proposedDatetime).toLocaleString('it-IT')}
               </td>
             </tr>`
            : '',
          p.proposedLocationAddress
            ? `<tr>
               <td style="color:#94a3b8;font-size:0.72rem;padding:3px 8px 3px 0">📍 Address</td>
               <td style="font-size:0.78rem;font-weight:600">${p.proposedLocationAddress}</td>
             </tr>`
            : '',
          p.proposedDuration
            ? `<tr>
               <td style="color:#94a3b8;font-size:0.72rem;padding:3px 8px 3px 0">⏱ Duration</td>
               <td style="font-size:0.78rem;font-weight:600">${p.proposedDuration} min</td>
             </tr>`
            : '',
        ].join('');

        Swal.fire({
          title: 'Reject proposal?',
          html: `
          <p style="margin:0 0 10px;font-size:0.8rem;color:#64748b">
            Proposal from <strong>${p.proposedBy.firstName} ${p.proposedBy.lastName}</strong>:
          </p>
          <table style="width:100%;border-collapse:collapse;text-align:left">${rows}</table>
          <p style="margin:10px 0 0;font-size:0.75rem;color:#ef4444;font-weight:600">
            ⚠️ Rejecting will cancel the appointment.
          </p>`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Reject & cancel',
          cancelButtonText: 'Back',
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#94a3b8',
          reverseButtons: true,
        }).then((result) => {
          if (!result.isConfirmed) return;

          this.proposalService
            .rejectProposal(p.proposalId!, this.currentUserId!)
            .subscribe({
              next: () => {
                this.loadAppointments();
                this.appointmentUpdated.emit();
                Swal.fire({
                  icon: 'info',
                  title: 'Proposal rejected',
                  text: 'The appointment has been cancelled.',
                  timer: 2200,
                  showConfirmButton: false,
                });
              },
              error: () => Swal.fire('Error', 'Unable to reject.', 'error'),
            });
        });
      },
      error: () => Swal.fire('Error', 'Unable to load proposals.', 'error'),
    });
  }

  /**
   * @description Opens the appointment detail dialog (read-only)
   * @param apt - Appointment to display
   */
  private openDetails(apt: AppointmentDTO): void {
    this.dialog.open(AppointmentDetailDialogComponent, {
      data: { apt, currentUserId: this.currentUserId },
      width: '560px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'apt-detail-dialog-panel',
    });
  }

  /**
   * @description Cancels an appointment with a required reason
   * @param apt - Appointment to cancel
   */
  private cancelApt(apt: AppointmentDTO): void {
    Swal.fire({
      title: 'Cancel appointment',
      input: 'textarea',
      inputPlaceholder: 'Please provide a reason…',
      inputAttributes: { rows: '3' },
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Cancel appointment',
      cancelButtonText: 'Back',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      reverseButtons: true,
      inputValidator: (v) => (!v?.trim() ? 'A reason is required.' : null),
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.appointmentService
        .cancelAppointment(
          apt.appointmentId,
          this.currentUserId!,
          result.value.trim(),
        )
        .subscribe({
          next: (response) => {
            this.updateInList(response.data);
            this.appointmentUpdated.emit();
            Swal.fire({
              icon: 'success',
              title: 'Cancelled',
              timer: 1800,
              showConfirmButton: false,
            });
          },
          error: () => Swal.fire('Error', 'Unable to cancel.', 'error'),
        });
    });
  }

  /**
   * @description Opens a proposal form dialog for rescheduling an appointment
   * @param apt - Appointment to propose changes
   */
  private openProposeDialog(apt: AppointmentDTO): void {
    const dialogRef = this.dialog.open(ProposalFormComponent, {
      data: { appointment: apt },
      width: '520px',
      maxWidth: '95vw',
      maxHeight: '90vh',
    });

    dialogRef
      .afterClosed()
      .subscribe((result: AppointmentProposalDTO | undefined) => {
        if (!result) return;

        this.proposalService
          .proposeChange(apt.appointmentId, result, this.currentUserId!)
          .subscribe({
            next: () => {
              this.loadAppointments();
              this.appointmentUpdated.emit();
              Swal.fire({
                icon: 'success',
                title: 'Proposal sent!',
                timer: 1800,
                showConfirmButton: false,
              });
            },
            error: () =>
              Swal.fire('Error', 'Unable to send the proposal.', 'error'),
          });
      });
  }

  /**
   * @description Opens the user's mail client to contact the other party of an appointment
   * @param apt - Appointment to contact
   */
  private contactOther(apt: AppointmentDTO): void {
    const isOrg = apt.organizer.userId === this.currentUserId;
    const other = isOrg ? apt.requester : apt.organizer;
    const subject = encodeURIComponent(`Re: ${apt.title}`);
    const body = encodeURIComponent(
      `Hi ${other.firstName},\n\nRegarding our appointment...\n\n`,
    );
    window.location.href = `mailto:${other.email}?subject=${subject}&body=${body}`;
  }

  // ───────────────────────────────────────────── Helpers ─────────────────────────────────────────────

  /**
   * @description Updates a single appointment in the appointments list
   * @param updated - Updated appointment data
   */
  private updateInList(updated: AppointmentDTO): void {
    this.appointments.update((list) =>
      list.map((a) =>
        a.appointmentId === updated.appointmentId ? updated : a,
      ),
    );
  }

  /**
   * @description Counts appointments by status
   * @param status - AppointmentStatus string
   * @returns Number of appointments with that status
   */
  countByStatus(status: string): number {
    return this.appointments().filter((a) => a.status === status).length;
  }

  /**
   * @description Returns true if there are no appointments in the current list.
   * @returns {boolean} True if appointments list is empty
   */
  isEmptyState = (): boolean => this.appointments().length === 0;

  /**
   * @description Returns the logo source path used in the component
   * @returns {string} Path to the logo image
   */
  getLogoSrc = (): string => 'logo_blue-removebg.png';

}
