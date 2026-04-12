// ─────────────────────────────────────────────────────────────────────────────
// SECTION: IMPORTS
// ─────────────────────────────────────────────────────────────────────────────

import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  flush,
  discardPeriodicTasks,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  Component,
  NO_ERRORS_SCHEMA,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Swal from 'sweetalert2';
import { SendMessageDialogComponent } from './send-message-dialog.component';
import { ContactRequestService } from 'src/app/services/path/contact/contact-request/contact-request.service';
import { ContactMethod } from 'src/app/interfaces/dtos/contact/contactMethod.enum';
import { NominatimResult } from 'src/app/utils/components-utils/send-message-dialog.utils';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: MOCK COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

@Component({ selector: 'lib-map', template: '', standalone: true })
class MockMapComponent {
  @Input() coordinates: any;
  @Input() zoom: number = 12;
}

@Component({ selector: 'lib-modal', template: '', standalone: true })
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

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: MOCK SERVICES
// ─────────────────────────────────────────────────────────────────────────────

class MockContactRequestService {
  createContactRequest = jasmine
    .createSpy()
    .and.returnValue(of({ requestId: 1 } as any));
}

class MockMatSnackBar {
  open = jasmine.createSpy();
}

class MockHttpClient {
  get = jasmine.createSpy().and.returnValue(of([]));
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: TEST SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('SendMessageDialogComponent', () => {
  let component: SendMessageDialogComponent;
  let fixture: ComponentFixture<SendMessageDialogComponent>;
  let contactService: MockContactRequestService;
  let snackBar: MockMatSnackBar;

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: MOCK DATA
  // ─────────────────────────────────────────────────────────────────────────

  const mockDialogRef = {
    close: jasmine.createSpy(),
  };

  const mockDialogData = {
    ad: {
      advertisementId: 1,
      title: 'Test Product',
      description: 'Test Description',
      price: 100,
      productId: 1,
      createdBy: { userId: 2, email: 'seller@test.com' },
      profile: { firstName: 'John', lastName: 'Doe' },
      imageUrl: 'https://via.placeholder.com/150',
    },
    currentUserId: 1,
    product: [
      {
        productId: 1,
        price: 100,
        active: true,
        condition: 'NEW',
        stockQuantity: 10,
      },
    ],
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: TEST SETUP
  // ─────────────────────────────────────────────────────────────────────────

  beforeEach(async () => {
    if (component) {
      component['map'] = undefined;
      component['vectorLayer'] = undefined;
    }

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NoopAnimationsModule,
        MatDialogModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatIconModule,
        MatDividerModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        SendMessageDialogComponent,
        MockMapComponent,
        MockModalComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: ContactRequestService, useClass: MockContactRequestService },
        { provide: MatSnackBar, useClass: MockMatSnackBar },
        { provide: HttpClient, useClass: MockHttpClient },
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SendMessageDialogComponent, {
        set: {
          imports: [
            CommonModule,
            ReactiveFormsModule,
            FormsModule,
            MatDialogModule,
            MatSnackBarModule,
            MatFormFieldModule,
            MatInputModule,
            MatSelectModule,
            MatDatepickerModule,
            MatNativeDateModule,
            MatChipsModule,
            MatAutocompleteModule,
            MatIconModule,
            MatDividerModule,
            MatButtonModule,
            MatProgressSpinnerModule,
            MockMapComponent,
            MockModalComponent,
          ],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SendMessageDialogComponent);
    component = fixture.componentInstance;
    contactService = TestBed.inject(ContactRequestService) as any;
    snackBar = TestBed.inject(MatSnackBar) as any;

    fixture.detectChanges();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: BASIC TESTS
  // ─────────────────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: INITIALIZATION TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Initialization', () => {
    it('should have dialog data injected', () => {
      expect(component.data.ad.title).toBe('Test Product');
      expect(component.data.currentUserId).toBe(1);
    });

    it('should have fullName from profile', () => {
      expect(component.fullName).toBe('John Doe');
    });

    it('should return default seller name when profile missing', () => {
      const dataWithoutProfile = {
        ...mockDialogData,
        ad: { ...mockDialogData.ad, profile: null },
      };

      TestBed.resetTestingModule();

      TestBed.configureTestingModule({
        imports: [
          CommonModule,
          ReactiveFormsModule,
          FormsModule,
          NoopAnimationsModule,
          MatDialogModule,
          MatSnackBarModule,
          MatFormFieldModule,
          MatInputModule,
          MatSelectModule,
          MatDatepickerModule,
          MatNativeDateModule,
          MatChipsModule,
          MatAutocompleteModule,
          MatIconModule,
          MatDividerModule,
          MatButtonModule,
          MatProgressSpinnerModule,
          SendMessageDialogComponent,
          MockMapComponent,
          MockModalComponent,
        ],
        providers: [
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: dataWithoutProfile },
          {
            provide: ContactRequestService,
            useClass: MockContactRequestService,
          },
          { provide: MatSnackBar, useClass: MockMatSnackBar },
          { provide: HttpClient, useClass: MockHttpClient },
          provideHttpClientTesting(),
        ],
        schemas: [NO_ERRORS_SCHEMA],
      })
        .overrideComponent(SendMessageDialogComponent, {
          set: {
            imports: [
              CommonModule,
              ReactiveFormsModule,
              FormsModule,
              MatDialogModule,
              MatSnackBarModule,
              MatFormFieldModule,
              MatInputModule,
              MatSelectModule,
              MatDatepickerModule,
              MatNativeDateModule,
              MatChipsModule,
              MatAutocompleteModule,
              MatIconModule,
              MatDividerModule,
              MatButtonModule,
              MatProgressSpinnerModule,
              MockMapComponent,
              MockModalComponent,
            ],
            schemas: [NO_ERRORS_SCHEMA],
          },
        })
        .compileComponents();

      const newFixture = TestBed.createComponent(SendMessageDialogComponent);
      const newComponent = newFixture.componentInstance;
      expect(newComponent.fullName).toBe('the seller');
    });

    it('should initialize contact form', () => {
      expect(component.contactForm).toBeTruthy();
    });

    it('should have minDate set to today', () => {
      const today = new Date();
      expect(component.minDate.getDate()).toBe(today.getDate());
      expect(component.minDate.getMonth()).toBe(today.getMonth());
      expect(component.minDate.getFullYear()).toBe(today.getFullYear());
    });

    it('should have maxDate set to 12 months from now', () => {
      const today = new Date();
      const expectedMax = new Date();
      expectedMax.setMonth(today.getMonth() + 12);
      expect(component.maxDate.getMonth()).toBe(expectedMax.getMonth());
    });

    it('should have contactMethods array', () => {
      expect(component.contactMethods.length).toBe(4);
      expect(component.contactMethods[0].value).toBe(ContactMethod.EMAIL);
    });

    it('should have suggestedTimes array', () => {
      expect(component.suggestedTimes.length).toBe(5);
      expect(component.suggestedTimes[0]).toBe('09:00');
    });

    it('should have suggestedDurations array', () => {
      expect(component.suggestedDurations.length).toBe(4);
      expect(component.suggestedDurations[0].value).toBe(30);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: FORM METHODS TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Form methods', () => {
    it('should get field error', () => {
      const control = component.contactForm.get('senderContactEmail');
      control?.setErrors({ required: true });
      control?.markAsTouched();
      const error = component.getFieldError('senderContactEmail');
      expect(error).toContain('required');
    });

    it('should determine if phone number is needed', () => {
      component.contactForm.patchValue({
        preferredContactMethod: ContactMethod.PHONE,
      });
      expect(component.needsPhoneNumber()).toBeTrue();

      component.contactForm.patchValue({
        preferredContactMethod: ContactMethod.EMAIL,
      });
      expect(component.needsPhoneNumber()).toBeFalse();
    });

    it('should get selected label', () => {
      expect(component.getSelectedLabel(ContactMethod.EMAIL)).toBe(
        'Email Response',
      );
      expect(component.getSelectedLabel('INVALID')).toBe(
        'Select contact method',
      );
    });

    it('should set time', () => {
      component.setTime('14:30');
      expect(component.contactForm.get('appointmentTime')?.value).toBe('14:30');
    });

    it('should set duration', () => {
      component.setDuration(90);
      expect(component.contactForm.get('durationMinutes')?.value).toBe(90);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: MEETING MODE TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Meeting mode', () => {
    beforeEach(() => {
      component.contactForm
        .get('preferredContactMethod')
        ?.setValue(ContactMethod.MEETING);
      fixture.detectChanges();
    });

    it('should set meeting mode to true', () => {
      expect(component.isMeetingMode()).toBeTrue();
    });

    it('should set meeting fields validators', () => {
      const dateControl = component.contactForm.get('appointmentDate');
      expect(dateControl?.validator).toBeTruthy();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: ADDRESS SEARCH TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Address search', () => {
    it('should handle address input', () => {
      const inputEvent = { target: { value: 'Rome' } } as any;
      component.onAddressInput(inputEvent);
      expect(component.isLoadingAddresses()).toBeTrue();
    });

    it('should clear address suggestions for short input', () => {
      const inputEvent = { target: { value: 'Ro' } } as any;
      component.onAddressInput(inputEvent);
      expect(component.addressSuggestions()).toEqual([]);
      expect(component.isLoadingAddresses()).toBeFalse();
    });

    it('should select address', () => {
      const result = {
        lat: '41.9028',
        lon: '12.4964',
        display_name: 'Rome, Italy',
      } as any;

      component.selectAddress(result);
      expect(component.selectedPlace()).toEqual(result);
      expect(component.isAddressValid()).toBeTrue();
      expect(component.contactForm.get('locationAddress')?.value).toBe(
        'Rome, Italy',
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: FORM SUBMISSION TESTS (EMAIL MODE)
  // ─────────────────────────────────────────────────────────────────────────

  describe('Form submission - Email mode', () => {
    beforeEach(() => {
      (contactService.createContactRequest as jasmine.Spy).calls.reset();
      (snackBar.open as jasmine.Spy).calls.reset();

      component.contactForm
        .get('preferredContactMethod')
        ?.setValue(ContactMethod.EMAIL);
      fixture.detectChanges();

      component.contactForm
        .get('senderContactEmail')
        ?.setValue('test@example.com');
      component.contactForm
        .get('message')
        ?.setValue('This is a test message long enough');
      component.contactForm.markAsDirty();
      component.contactForm.updateValueAndValidity();
    });

    it('should submit form', async () => {
      expect(component.contactForm.valid).toBe(true);
      await component.onSubmit();
      expect(contactService.createContactRequest).toHaveBeenCalled();
    });

    it('should not submit invalid form', async () => {
      component.contactForm.get('senderContactEmail')?.setValue('');
      component.contactForm.updateValueAndValidity();
      expect(component.contactForm.valid).toBe(false);
      await component.onSubmit();
      expect(contactService.createContactRequest).not.toHaveBeenCalled();
    });

    it('should show validation errors on invalid form', async () => {
      (contactService.createContactRequest as jasmine.Spy).calls.reset();

      // Svuota email e message
      component.contactForm.get('senderContactEmail')?.setValue('');
      component.contactForm.get('message')?.setValue('');

      // Forza subject ad essere invalido (anche se disabilitato)
      const subjectControl = component.contactForm.get('subject');
      if (subjectControl) {
        subjectControl.setErrors({ required: true });
        subjectControl.markAsTouched();
      }

      component.contactForm.updateValueAndValidity();

      await component.onSubmit();

      // Ora dovrebbe essere invalido
      expect(contactService.createContactRequest).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: MEETING SUBMISSION TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Meeting submission', () => {
    const mockNominatimResult: NominatimResult = {
      place_id: 12345,
      lat: '41.9028',
      lon: '12.4964',
      display_name: 'Rome, Italy',
      address: {
        road: 'Via del Corso',
        city: 'Rome',
        country: 'Italy',
      },
      importance: 0.5,
    };

    beforeEach(() => {
      (contactService.createContactRequest as jasmine.Spy).calls.reset();
      (snackBar.open as jasmine.Spy).calls.reset();

      component['map'] = {
        setTarget: jasmine.createSpy('setTarget'),
        dispose: jasmine.createSpy('dispose'),
        getView: () => ({
          animate: jasmine.createSpy('animate'),
          getZoom: () => 10,
          setZoom: jasmine.createSpy('setZoom'),
        }),
        updateSize: jasmine.createSpy('updateSize'),
        renderSync: jasmine.createSpy('renderSync'),
        addOverlay: jasmine.createSpy('addOverlay'),
        removeOverlay: jasmine.createSpy('removeOverlay'),
      } as any;

      component['vectorLayer'] = {
        getSource: () => ({
          clear: jasmine.createSpy('clear'),
          addFeature: jasmine.createSpy('addFeature'),
        }),
      } as any;

      component.contactForm
        .get('preferredContactMethod')
        ?.setValue(ContactMethod.MEETING);
      fixture.detectChanges();

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      component.contactForm
        .get('senderContactEmail')
        ?.setValue('test@example.com');
      component.contactForm
        .get('message')
        ?.setValue('Test message with sufficient length');
      component.contactForm.get('appointmentDate')?.setValue(futureDate);
      component.contactForm.get('appointmentTime')?.setValue('10:00');
      component.contactForm.get('durationMinutes')?.setValue(60);
      component.contactForm.get('locationAddress')?.setValue('Rome, Italy');

      component.selectedPlace.set(mockNominatimResult);
      component.isAddressValid.set(true);
      component.contactForm.markAsDirty();
      component.contactForm.updateValueAndValidity();
    });

    it('should submit meeting request', async () => {
      const swalSpy = spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({
          isConfirmed: true,
          isDenied: false,
          isDismissed: false,
        }),
      );
      await component.onSubmit();
      expect(swalSpy).toHaveBeenCalled();
    });

    it('should require address selection', async () => {
      // Resetta lo spy
      (contactService.createContactRequest as jasmine.Spy).calls.reset();

      // Rimuovi l'indirizzo
      component.selectedPlace.set(null);
      component.isAddressValid.set(false);

      // Forza il form ad essere valido tranne che per l'indirizzo
      component.contactForm
        .get('appointmentDate')
        ?.setValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      component.contactForm.get('appointmentTime')?.setValue('10:00');
      component.contactForm.get('durationMinutes')?.setValue(60);
      component.contactForm.get('locationAddress')?.setValue('');

      component.contactForm.updateValueAndValidity();

      await component.onSubmit();

      // Il servizio NON deve essere chiamato perché manca l'indirizzo
      expect(contactService.createContactRequest).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: RESET FUNCTIONALITY TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Reset functionality', () => {
    it('should reset form when confirmed', async () => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({
          isConfirmed: true,
          isDenied: false,
          isDismissed: false,
        }),
      );
      component.contactForm.get('message')?.setValue('Some content');
      component.contactForm.markAsDirty();
      await component.onReset();
      expect(component.contactForm.get('message')?.value).toBeFalsy();
    });

    it('should not reset form when cancelled', async () => {
      const swalSpy = spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({
          isConfirmed: false,
          isDenied: false,
          isDismissed: true,
        }),
      );
      component.contactForm.get('message')?.setValue('Some content');
      component.contactForm.markAsDirty();
      await component.onReset();
      expect(swalSpy).toHaveBeenCalled();
      expect(component.contactForm.get('message')?.value).toBe('Some content');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: CLOSE DIALOG TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Close dialog', () => {
    beforeEach(() => {
      (mockDialogRef.close as jasmine.Spy).calls.reset();
    });

    it('should show confirmation dialog when form is pristine and close when confirmed', async () => {
      const swalSpy = spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({
          isConfirmed: true,
          isDenied: false,
          isDismissed: false,
        }),
      );
      await component.onClose();
      expect(swalSpy).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should not close dialog when confirmation is cancelled for pristine form', async () => {
      const swalSpy = spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({
          isConfirmed: false,
          isDenied: false,
          isDismissed: true,
        }),
      );
      await component.onClose();
      expect(swalSpy).toHaveBeenCalled();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should show confirmation when form is dirty and close when confirmed', async () => {
      component.contactForm.get('message')?.setValue('test');
      component.contactForm.markAsDirty();
      const swalSpy = spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({
          isConfirmed: true,
          isDenied: false,
          isDismissed: false,
        }),
      );
      await component.onClose();
      expect(swalSpy).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should not close dialog when confirmation is cancelled for dirty form', async () => {
      component.contactForm.get('message')?.setValue('test');
      component.contactForm.markAsDirty();
      const swalSpy = spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({
          isConfirmed: false,
          isDenied: false,
          isDismissed: true,
        }),
      );
      await component.onClose();
      expect(swalSpy).toHaveBeenCalled();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: MODAL ACTIONS TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Modal actions', () => {
    it('should call onReset when reset action is triggered', async () => {
      const spy = spyOn(component, 'onReset').and.returnValue(
        Promise.resolve(),
      );
      component.onModalAction('reset');
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(spy).toHaveBeenCalled();
    });

    it('should call onSubmit when submit action is triggered', async () => {
      const spy = spyOn(component, 'onSubmit').and.returnValue(
        Promise.resolve(),
      );
      component.onModalAction('submit');
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(spy).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: MAP METHODS TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Map methods', () => {
    it('should hide zoom buttons', fakeAsync(() => {
      const mockZoomButtons = document.createElement('div');
      mockZoomButtons.className = 'ol-zoom';
      mockZoomButtons.style.display = 'block';
      document.body.appendChild(mockZoomButtons);

      component['hideZoomButtons']();
      tick(400);

      expect(mockZoomButtons.style.display).toBe('none');
      document.body.removeChild(mockZoomButtons);
      discardPeriodicTasks();
    }));
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: UTILITY METHODS TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Utility methods', () => {
    it('should get duration label', () => {
      const label = component['getDurationLabel'](60);
      expect(label).toBe('1 hour');
    });
  });
});
