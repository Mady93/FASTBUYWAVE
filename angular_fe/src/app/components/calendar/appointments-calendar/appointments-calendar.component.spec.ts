import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  AppointmentsCalendarComponent,
  CalendarEvent,
} from './appointments-calendar.component';
import { getFilterDisplayName } from 'src/app/utils/filter-display-utils';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: MOCK COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'lib-empty-state',
  standalone: true,
  template: '<ng-content></ng-content>',
})
class MockEmptyStateComponent {}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: TEST DATA
// ─────────────────────────────────────────────────────────────────────────────

const baseDate = new Date('2026-03-26T12:00:00Z');

const fixedEvents: CalendarEvent[] = [
  {
    id: 1,
    title: 'Meeting',
    date: baseDate.toISOString(),
    status: 'CONFIRMED',
  },
  { id: 2, title: 'Call', date: baseDate.toISOString(), status: 'PENDING' },
  {
    id: 3,
    title: 'Review',
    date: new Date(baseDate.getTime() + 86400000).toISOString(),
    status: 'RESCHEDULED',
  },
  {
    id: 4,
    title: 'Cancelled Meeting',
    date: baseDate.toISOString(),
    status: 'CANCELLED',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: TEST SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('AppointmentsCalendarComponent', () => {
  let component: AppointmentsCalendarComponent;
  let fixture: ComponentFixture<AppointmentsCalendarComponent>;

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: TEST SETUP
  // ─────────────────────────────────────────────────────────────────────────

  beforeEach(async () => {
    (window as any).getFilterDisplayName = getFilterDisplayName;

    await TestBed.configureTestingModule({
      imports: [AppointmentsCalendarComponent, NoopAnimationsModule],
      declarations: [],
    })
      .overrideComponent(AppointmentsCalendarComponent, {
        remove: { imports: [] },
        add: { imports: [MockEmptyStateComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AppointmentsCalendarComponent);
    component = fixture.componentInstance;

    component.currentDate.set(baseDate);

    fixture.componentRef.setInput('events', fixedEvents);
    fixture.componentRef.setInput('isOrganizer', (id: number) => id === 1);

    fixture.detectChanges();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: BASIC TESTS
  // ─────────────────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: INPUT TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Inputs', () => {
    it('should receive events input', () => {
      expect(component.events()).toEqual(fixedEvents);
    });

    it('should receive isOrganizer function input', () => {
      expect(component.isOrganizer()(1)).toBeTrue();
      expect(component.isOrganizer()(2)).toBeFalse();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: FILTER FUNCTIONALITY TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Filter functionality', () => {
    it('should have default filter set to ALL', () => {
      expect(component.activeFilter()).toBe('ALL');
    });

    it('should filter events by status', () => {
      component.setFilter('CONFIRMED');
      fixture.detectChanges();
      expect(component.activeFilter()).toBe('CONFIRMED');
      expect(component.filteredEvents().length).toBe(1);
      expect(component.filteredEvents()[0].status).toBe('CONFIRMED');
    });

    it('should close popover when changing filter', () => {
      component.activePopover = fixedEvents[1];
      component.setFilter('PENDING');
      expect(component.activePopover).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: CALENDAR NAVIGATION TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Calendar navigation', () => {
    it('should navigate to previous month', () => {
      const initialDate = new Date(component.currentDate());
      component.prevMonth();
      const expected = new Date(initialDate);
      expected.setMonth(initialDate.getMonth() - 1);
      expect(component.currentDate().getTime()).toBe(expected.getTime());
    });

    it('should navigate to next month', () => {
      const initialDate = new Date(component.currentDate());
      component.nextMonth();
      const expected = new Date(initialDate);
      expected.setMonth(initialDate.getMonth() + 1);
      expect(component.currentDate().getTime()).toBe(expected.getTime());
    });

    it('should go to today', () => {
      component.currentDate.set(baseDate);
      component.goToToday();
      const today = new Date();
      expect(component.currentDate().getFullYear()).toBe(today.getFullYear());
      expect(component.currentDate().getMonth()).toBe(today.getMonth());
    });

    it('should select a year', () => {
      component.selectYear(2025);
      expect(component.currentDate().getFullYear()).toBe(2025);
      expect(component.showYearPicker).toBeFalse();
    });

    it('should toggle year picker', () => {
      const event = new MouseEvent('click');
      component.toggleYearPicker(event);
      expect(component.showYearPicker).toBeTrue();
      component.toggleYearPicker(event);
      expect(component.showYearPicker).toBeFalse();
    });

    it('should generate year range around current year', () => {
      const currentYear = new Date().getFullYear();
      const years = component.yearRange;
      expect(years[0]).toBe(currentYear - 4);
      expect(years[years.length - 1]).toBe(currentYear + 4);
      expect(years.length).toBe(9);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: CALENDAR DAYS GRID TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Calendar days grid', () => {
    it('should generate days for current month', () => {
      const days = component.days();
      expect(days.length).toBeGreaterThanOrEqual(35);
      expect(days.filter((d) => d !== null).length).toBeGreaterThan(28);
    });

    it('should identify today correctly', () => {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(component.isToday(today)).toBeTrue();
      expect(component.isToday(tomorrow)).toBeFalse();
    });

    it('should group events by day', () => {
      const eventsByDay = component.eventsByDay();
      const todayKey = baseDate.toDateString();
      expect(eventsByDay.get(todayKey)?.length).toBe(3);
    });

    it('should return events for a specific day', () => {
      const today = new Date();
      const events = component.getEventsForDay(baseDate);
      expect(events.length).toBe(3);
      expect(events.map((e) => e.id)).toContain(1);
      expect(events.map((e) => e.id)).toContain(2);
      expect(events.map((e) => e.id)).toContain(4);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: POPOVER TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Popover', () => {
    it('should open popover with correct position', () => {
      const mockEvent = fixedEvents[1];
      const mouseEvent = new MouseEvent('click', {
        clientX: 100,
        clientY: 200,
      });

      component.openPopover(mockEvent, mouseEvent);

      expect(component.activePopover).toBe(mockEvent);
      expect(component.popoverX).toBeGreaterThan(0);
      expect(component.popoverY).toBeGreaterThan(0);
    });

    it('should close popover', () => {
      component.activePopover = fixedEvents[1];
      component.closePopover();
      expect(component.activePopover).toBeNull();
    });

    it('should emit action and close popover', () => {
      const emitSpy = spyOn(component.action, 'emit');
      component.activePopover = fixedEvents[1];

      component.emit('confirm');

      expect(emitSpy).toHaveBeenCalledWith({
        type: 'confirm',
        event: fixedEvents[1],
      });
      expect(component.activePopover).toBeNull();
    });

    it('should close popover on document click', () => {
      component.activePopover = fixedEvents[1];
      component.onDocumentClick();
      expect(component.activePopover).toBeNull();
      expect(component.showYearPicker).toBeFalse();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: PERMISSIONS TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Permissions', () => {
    it('should allow confirmation for PENDING and RESCHEDULED', () => {
      expect(
        component.canConfirm({ status: 'PENDING' } as CalendarEvent),
      ).toBeTrue();
      expect(
        component.canConfirm({ status: 'RESCHEDULED' } as CalendarEvent),
      ).toBeTrue();
      expect(
        component.canConfirm({ status: 'CONFIRMED' } as CalendarEvent),
      ).toBeFalse();
      expect(
        component.canConfirm({ status: 'CANCELLED' } as CalendarEvent),
      ).toBeFalse();
    });

    it('should allow proposal for active statuses', () => {
      expect(
        component.canPropose({ status: 'PENDING' } as CalendarEvent),
      ).toBeTrue();
      expect(
        component.canPropose({ status: 'CONFIRMED' } as CalendarEvent),
      ).toBeTrue();
      expect(
        component.canPropose({ status: 'RESCHEDULED' } as CalendarEvent),
      ).toBeTrue();
      expect(
        component.canPropose({ status: 'CANCELLED' } as CalendarEvent),
      ).toBeFalse();
    });

    it('should allow rejection only for RESCHEDULED', () => {
      expect(
        component.canReject({ status: 'RESCHEDULED' } as CalendarEvent),
      ).toBeTrue();
      expect(
        component.canReject({ status: 'PENDING' } as CalendarEvent),
      ).toBeFalse();
      expect(
        component.canReject({ status: 'CONFIRMED' } as CalendarEvent),
      ).toBeFalse();
    });

    it('should allow cancellation for active statuses', () => {
      expect(
        component.canCancel({ status: 'PENDING' } as CalendarEvent),
      ).toBeTrue();
      expect(
        component.canCancel({ status: 'CONFIRMED' } as CalendarEvent),
      ).toBeTrue();
      expect(
        component.canCancel({ status: 'RESCHEDULED' } as CalendarEvent),
      ).toBeTrue();
      expect(
        component.canCancel({ status: 'CANCELLED' } as CalendarEvent),
      ).toBeFalse();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: TEMPLATE RENDERING TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Template rendering', () => {
    it('should render calendar toolbar', () => {
      const toolbar = fixture.debugElement.query(By.css('.cal-toolbar'));
      expect(toolbar).toBeTruthy();
    });

    it('should render month and year in title', () => {
      const title = fixture.debugElement.query(
        By.css('.cal-nav__title'),
      ).nativeElement;
      const currentDate = new Date();
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      expect(title.textContent).toContain(monthNames[currentDate.getMonth()]);
      expect(title.textContent).toContain(currentDate.getFullYear().toString());
    });

    it('should render filter buttons', () => {
      const filters = fixture.debugElement.queryAll(By.css('.cal-filter'));
      expect(filters.length).toBe(5);
    });

    it('should render events in calendar', () => {
      const events = fixture.debugElement.queryAll(By.css('.cal-event'));
      expect(events.length).toBe(4);
    });

    it('should apply correct CSS class based on event status', () => {
      const confirmedEvent = fixture.debugElement.query(
        By.css('.cal-event--confirmed'),
      );
      expect(confirmedEvent).toBeTruthy();
      const pendingEvent = fixture.debugElement.query(
        By.css('.cal-event--pending'),
      );
      expect(pendingEvent).toBeTruthy();
    });
  });
});