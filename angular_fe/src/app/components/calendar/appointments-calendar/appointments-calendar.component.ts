import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  input,
  Output,
} from '@angular/core';
import { signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentProposalDTO } from 'src/app/interfaces/dtos/contact/appointment_proposal_dto';
import { EmptyStateComponent } from 'my-lib-inside';
import { getFilterDisplayName } from 'src/app/utils/filter-display-utils';

/**
 * @category Interfaces
 * 
 * @description Represents a calendar event displayed in the appointments calendar.
 *
 * Contains basic event information along with optional status and
 * pending proposal data for rescheduling or updates.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface CalendarEvent
 */
export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  status?: string;
  organizerId?: number;
  pendingProposal?: AppointmentProposalDTO | null;
}

/**
 * @category Interfaces
 * 
 * @description Represents an action triggered from a calendar event.
 *
 * Used to emit user interactions such as confirming, proposing changes,
 * contacting, cancelling, or rejecting an appointment.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface CalendarEventAction
 */
export interface CalendarEventAction {
  type: 'details' | 'confirm' | 'propose' | 'contact' | 'cancel' | 'reject';
  event: CalendarEvent;
}


/**
 * @category Types
 * 
 * @fileoverview Type definition for appointment filter status options.
 * Used to filter appointments based on their current state in the calendar view.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 */
export type FilterStatus =
  | 'ALL'
  | 'CONFIRMED'
  | 'PENDING'
  | 'RESCHEDULED'
  | 'CANCELLED'
  | 'REJECTED';

/**
 * @category Components
 * 
 * @description Interactive calendar component for managing appointments.
 *
 * Displays events in a monthly calendar view with support for filtering,
 * navigation, and contextual actions (confirm, propose, cancel, etc.).
 * Uses Angular signals and computed properties for reactive state management.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Component({
  selector: 'app-appointments-calendar',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  templateUrl: './appointments-calendar.component.html',
  styleUrl: './appointments-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsCalendarComponent {

  /**
 * @description Current logged-in user ID injected from parent component.
 * Used to determine if the current user is the organizer of an appointment.
 */
  @Input() currentUserId: number | null = null;
  
  /**
   * @description Input list of calendar events.
   */
  events = input<CalendarEvent[]>([]);

  /**
   * @description Input function to determine if the current user is the organizer.
   */
  isOrganizer = input<(id: number) => boolean>(() => false);

  /**
   * @description Event emitter for actions triggered from calendar events.
   */
  @Output() action = new EventEmitter<CalendarEventAction>();

  /**
   * @description Signal for the current visible date in the calendar.
   */
  currentDate = signal(new Date());

  /**
   * @description Signal for the active filter applied to events.
   */
  activeFilter = signal<FilterStatus>('ALL');

  /**
   * @description Boolean controlling visibility of the year picker.
   */
  showYearPicker = false;

  /**
   * @description Tracks the currently active popover event, if any.
   */
  activePopover: CalendarEvent | null = null;

  /**
   * @description X coordinate for the active popover.
   */
  popoverX = 0;

  /**
   * @description Y coordinate for the active popover.
   */
  popoverY = 0;

  /**
   * @description ChangeDetectorRef injected to trigger manual change detection.
   */
  private cdRef = inject(ChangeDetectorRef);

  /**
   * @description Returns the list of years around the current year for the year picker.
   */
  get yearRange(): number[] {
    const y = new Date().getFullYear();
    const years: number[] = [];
    for (let i = y - 4; i <= y + 4; i++) years.push(i);
    return years;
  }

  // ── Computed ──────────────────────────────────────────────────────────────

  /**
   * @description Returns the list of events filtered by the active filter.
   */
  filteredEvents = computed(() => {
    if (this.activeFilter() === 'ALL') return this.events();
    return this.events().filter((e) => e.status === this.activeFilter());
  });

  /**
   * @description Sets the active filter and closes any open popover.
   * @param filter - Selected filter status
   */
  setFilter(filter: FilterStatus): void {
    this.activeFilter.set(filter);
    this.activePopover = null;
  }

  /**
   * @description Returns a list of all days for the current month, including nulls to align weekdays.
   */
  days = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendar: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) calendar.push(null);
    for (let d = 1; d <= daysInMonth; d++)
      calendar.push(new Date(year, month, d));
    while (calendar.length % 7 !== 0) calendar.push(null);
    return calendar;
  });

  /**
   * @description Returns a map of events grouped by day string.
   */
  eventsByDay = computed(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of this.filteredEvents()) {
      const key = new Date(e.date).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  });

  /**
   * @description Returns all events associated with a specific calendar day.
   *
   * @param day - Date for which events are requested
   * @returns List of calendar events for the given day
   */
  getEventsForDay(day: Date): CalendarEvent[] {
    return this.eventsByDay().get(day.toDateString()) ?? [];
  }

  /**
   * @description Checks whether a given day is today.
   *
   * @param day - Date to compare
   * @returns True if the date is today
   */
  isToday(day: Date): boolean {
    const t = new Date();
    return (
      day.getDate() === t.getDate() &&
      day.getMonth() === t.getMonth() &&
      day.getFullYear() === t.getFullYear()
    );
  }

  // ── Popover ───────────────────────────────────────────────────────────────

  /**
   * @description Opens the event popover at the mouse position.
   * Adjusts position to keep it within viewport bounds.
   *
   * @param ev - Selected calendar event
   * @param mouseEvent - Mouse event used for positioning
   */
  openPopover(ev: CalendarEvent, mouseEvent: MouseEvent): void {
    mouseEvent.stopPropagation();
    this.activePopover = ev;

    const popoverWidth = 300;
    const popoverHeight = ev.pendingProposal ? 420 : 280;
    const margin = 12;

    let x = mouseEvent.clientX + margin;
    let y = mouseEvent.clientY + margin;

    if (x + popoverWidth > window.innerWidth - margin)
      x = mouseEvent.clientX - popoverWidth - margin;
    if (y + popoverHeight > window.innerHeight - margin)
      y = mouseEvent.clientY - popoverHeight - margin;

    this.popoverX = Math.max(margin, x);
    this.popoverY = Math.max(margin, y);

    this.cdRef.markForCheck();
  }

  /**
   * @description Closes the currently open popover.
   */
  closePopover(): void {
    this.activePopover = null;
    this.cdRef.markForCheck();
  }

  /**
   * @description Emits an action event for the selected calendar event.
   *
   * @param type - Type of action to emit
   */
  emit(type: CalendarEventAction['type']): void {
    if (!this.activePopover) return;
    this.action.emit({ type, event: this.activePopover });
    this.activePopover = null;
    this.cdRef.markForCheck();
  }

  /**
   * @description Closes popover and year picker when clicking outside.
   */
  @HostListener('document:click')
  onDocumentClick(): void {
    this.activePopover = null;
    this.showYearPicker = false;
  }

  /**
   * @description Determines if an event can be confirmed.
   *
   * @param ev - Calendar event
   * @returns True if confirmation is allowed
   */
  canConfirm(ev: CalendarEvent): boolean {
    // Solo chi NON ha proposto può confermare
    // PENDING → il requester deve confermare
    // RESCHEDULED → chi ha ricevuto la proposta deve confermare
    return ev.status === 'PENDING' || ev.status === 'RESCHEDULED';
  }

  /**
   * @description Determines if a new proposal can be made for an event.
   *
   * @param ev - Calendar event
   * @returns True if proposing changes is allowed
   */
  canPropose(ev: CalendarEvent): boolean {
    // Entrambi possono proporre modifiche se l'appuntamento è attivo
    return (
      ev.status === 'PENDING' ||
      ev.status === 'CONFIRMED' ||
      ev.status === 'RESCHEDULED'
    );
  }

  /**
   * @description Determines if a proposal can be rejected.
   *
   * @param ev - Calendar event
   * @returns True if rejection is allowed
   */
  canReject(ev: CalendarEvent): boolean {
    // Rifiuta proposta → solo se RESCHEDULED
    // (significa che qualcuno ha già fatto una proposta)
    return ev.status === 'RESCHEDULED';
  }

  /**
   * @description Determines if an event can be cancelled.
   *
   * @param ev - Calendar event
   * @returns True if cancellation is allowed
   */
  canCancel(ev: CalendarEvent): boolean {
    return (
      ev.status === 'PENDING' ||
      ev.status === 'CONFIRMED' ||
      ev.status === 'RESCHEDULED'
    );
  }

  // ── Navigazione ───────────────────────────────────────────────────────────

  /**
   * @description Navigates to the previous month.
   */
  prevMonth(): void {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() - 1);
    this.currentDate.set(d);
    this.showYearPicker = false;
  }

  /**
   * @description Navigates to the next month.
   */
  nextMonth(): void {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() + 1);
    this.currentDate.set(d);
    this.showYearPicker = false;
  }

  /**
   * @description Resets the calendar view to the current date.
   */
  goToToday(): void {
    this.currentDate.set(new Date());
    this.showYearPicker = false;
  }

  /**
   * @description Toggles the visibility of the year picker.
   *
   * @param e - Mouse event to stop propagation
   */
  toggleYearPicker(e: MouseEvent): void {
    e.stopPropagation();
    this.showYearPicker = !this.showYearPicker;
  }

  /**
   * @description Sets the selected year in the calendar.
   *
   * @param year - Year to select
   */
  selectYear(year: number): void {
    const d = new Date(this.currentDate());
    d.setFullYear(year);
    this.currentDate.set(d);
    this.showYearPicker = false;
  }

  /**
   * @description Returns the display label for the current filter.
   */
  getFilterDisplayName = computed(() =>
    getFilterDisplayName(this.activeFilter()),
  );

 /**
 * @description Determines if the current user can confirm an appointment immediately.
 * This is only allowed when:
 * - There is no pending proposal
 * - The appointment status is PENDING
 * - The current user is the organizer (receiver) of the appointment
 *
 * @param {CalendarEvent} ev - The calendar event to check
 * @returns {boolean} True if the user can confirm immediately
 */
canConfirmNow(ev: CalendarEvent): boolean {
  console.log('canConfirmNow:', {
    pendingProposal: ev.pendingProposal,
    currentUserId: this.currentUserId,
    organizerId: ev.organizerId,
    status: ev.status,
    result: ev.status === 'PENDING' && this.currentUserId === ev.organizerId && !ev.pendingProposal
  });
  if (ev.pendingProposal) return false;
  if (!this.currentUserId || !ev.organizerId) return false;
  return ev.status === 'PENDING' && this.currentUserId === ev.organizerId;
}
}
