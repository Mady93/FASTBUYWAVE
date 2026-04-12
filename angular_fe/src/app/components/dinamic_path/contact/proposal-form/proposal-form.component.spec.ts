import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { ProposalFormComponent } from './proposal-form.component';
import { AppointmentStatus } from 'src/app/interfaces/dtos/contact/appointmentStatus.enum';
import { LocationType } from 'src/app/interfaces/dtos/contact/locationType.enum';
import { NominatimResult } from 'src/app/utils/components-utils/send-message-dialog.utils';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalComponent } from 'my-lib-inside';
import Swal from 'sweetalert2';
import { MatNativeDateModule } from '@angular/material/core';

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

// Mock HttpClient
class MockHttpClient {
  get = jasmine.createSpy().and.returnValue(of([]));
}

describe('ProposalFormComponent', () => {
  let component: ProposalFormComponent;
  let fixture: ComponentFixture<ProposalFormComponent>;
  let httpClient: MockHttpClient;
  let swalSpy: jasmine.Spy;

  const mockDialogRef = {
    close: jasmine.createSpy(),
  };

  const mockAppointment = {
    appointmentId: 1,
    title: 'Meeting: Test Appointment',
    status: AppointmentStatus.PENDING,
    requester: {
      userId: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      registrationDate: new Date(),
      lastLogin: new Date(),
    },
    organizer: {
      userId: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@test.com',
      registrationDate: new Date(),
      lastLogin: new Date(),
    },
    product: {
      productId: 1,
      title: 'Test Product',
      price: 100,
      active: true,
      condition: 'NEW',
      stockQuantity: 10,
    },
    appointmentDatetime: new Date().toISOString(),
    durationMinutes: 60,
    locationType: LocationType.IN_PERSON,
    locationAddress: 'Via Roma 1, Rome',
    createdAt: new Date().toISOString(),
    active: true,
    reminderSent: false,
  } as any;

  const mockDialogData = {
    appointment: mockAppointment,
  };

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

  beforeEach(async () => {
    swalSpy = spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({
        isConfirmed: true,
        isDenied: false,
        isDismissed: false,
      }) as any,
    );

    await TestBed.configureTestingModule({
      imports: [
        ProposalFormComponent,
        NoopAnimationsModule,
        MatNativeDateModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: HttpClient, useClass: MockHttpClient },
      ],
    })
      .overrideComponent(ProposalFormComponent, {
        remove: { imports: [ModalComponent] },
        add: { imports: [MockModalComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProposalFormComponent);
    component = fixture.componentInstance;
    httpClient = TestBed.inject(HttpClient) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize form', () => {
      expect(component.form).toBeTruthy();
      expect(component.form.get('proposedDate')).toBeTruthy();
      expect(component.form.get('proposedTime')).toBeTruthy();
      expect(component.form.get('proposedLocationAddress')).toBeTruthy();
      expect(component.form.get('proposedDuration')).toBeTruthy();
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

    it('should have suggestedTimes array', () => {
      expect(component.suggestedTimes.length).toBe(5);
      expect(component.suggestedTimes[0]).toBe('09:00');
    });

    it('should have suggestedDurations array', () => {
      expect(component.suggestedDurations.length).toBe(4);
      expect(component.suggestedDurations[0].value).toBe(30);
    });
  });

  describe('Form methods', () => {
    it('should set time', () => {
      component.setTime('14:30');
      expect(component.form.get('proposedTime')?.value).toBe('14:30');
    });

    it('should set duration', () => {
      component.setDuration(90);
      expect(component.form.get('proposedDuration')?.value).toBe(90);
    });
  });

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
      component.selectAddress(mockNominatimResult);
      expect(component.selectedPlace()).toEqual(mockNominatimResult);
      expect(component.isAddressValid()).toBeTrue();
      expect(component.form.get('proposedLocationAddress')?.value).toBe(
        'Rome, Italy',
      );
    });
  });

  describe('Display function', () => {
    it('should display NominatimResult display_name', () => {
      expect(component.displayFn(mockNominatimResult)).toBe('Rome, Italy');
    });

    it('should return string as is', () => {
      expect(component.displayFn('Test string')).toBe('Test string');
    });
  });

  describe('Modal actions', () => {
    it('should return submit action', () => {
      const actions = component.modalActions;
      expect(actions.length).toBe(1);
      expect(actions[0].id).toBe('submit');
      expect(actions[0].label).toBe('Send');
    });

    it('should handle modal action', fakeAsync(() => {
      const submitSpy = spyOn(component, 'submit').and.returnValue(
        Promise.resolve(),
      );
      component.onModalAction('submit');
      tick(0);
      expect(submitSpy).toHaveBeenCalled();
    }));
  });

  describe('Form submission', () => {
    it('should not submit empty form', async () => {
      await component.submit();

      expect(swalSpy).toHaveBeenCalled();
    });

    it('should submit with date only', async () => {
      component.form.patchValue({ proposedDate: new Date() });
      await component.submit();
      expect(swalSpy).toHaveBeenCalled();
    });

    it('should submit with time only', async () => {
      component.form.patchValue({
        proposedTime: '14:30',
      });
      await component.submit();
      expect(swalSpy).toHaveBeenCalled();
    });

    it('should submit with location only', async () => {
      component.form.patchValue({
        proposedLocationAddress: 'Via Roma, Rome',
      });
      component.selectedPlace.set(mockNominatimResult);
      await component.submit();
      expect(swalSpy).toHaveBeenCalled();
    });

    it('should submit with duration only', async () => {
      component.form.patchValue({
        proposedDuration: 60,
      });
      await component.submit();
      expect(swalSpy).toHaveBeenCalled();
    });

    it('should submit with all fields', async () => {
      component.form.patchValue({
        proposedDate: new Date(),
        proposedTime: '14:30',
        proposedLocationAddress: 'Via Roma, Rome',
        proposedDuration: 60,
      });
      component.selectedPlace.set(mockNominatimResult);
      await component.submit();
      expect(swalSpy).toHaveBeenCalled();
    });

    it('should show warning if nothing to propose', async () => {
      await component.submit();
      expect(swalSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          icon: 'warning',
          title: 'Nothing to propose',
        }),
      );
    });

    it('should validate past date', async () => {
      swalSpy.calls.reset();

      component.form.clearValidators();
      Object.keys(component.form.controls).forEach((key) => {
        component.form.get(key)?.clearValidators();
        component.form.get(key)?.setErrors(null);
      });
      component.form.updateValueAndValidity();

      const pastDate = new Date(2020, 0, 1);
      component.form.patchValue({
        proposedDate: pastDate,
        proposedTime: '10:00',
      });

      console.log('Form valid:', component.form.valid);
      console.log('Form errors:', component.form.errors);
      console.log('Form value:', JSON.stringify(component.form.value));

      await component.submit();

      console.log('Swal calls after submit:', swalSpy.calls.count());
      console.log('Swal args:', JSON.stringify(swalSpy.calls.allArgs()));
    });

    it('should require address selection when location is provided', async () => {
      component.form.patchValue({ proposedLocationAddress: 'Via Roma, Rome' });
      component.selectedPlace.set(null);
      await component.submit();
      expect(swalSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          icon: 'warning',
          title: 'Select address from suggestions',
        }),
      );
    });
  });

  describe('Close dialog', () => {
    it('should close dialog when form is pristine', async () => {
      component.form.markAsPristine();
      await component.closeDialog();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should show confirmation when form is dirty', async () => {
      component.form.markAsDirty();
      await component.closeDialog();
      expect(swalSpy).toHaveBeenCalled();
    });
  });

  describe('Map methods', () => {
    it('should hide zoom buttons', fakeAsync(() => {
      const mockZoomButtons = document.createElement('div');
      mockZoomButtons.className = 'ol-zoom';
      document.body.appendChild(mockZoomButtons);

      component['hideZoomButtons']();
      tick(300);

      expect(mockZoomButtons.style.display).toBe('none');
      document.body.removeChild(mockZoomButtons);
    }));

    it('should force map resize', fakeAsync(() => {
      const mockMap = {
        updateSize: jasmine.createSpy(),
        renderSync: jasmine.createSpy(),
        setTarget: jasmine.createSpy(),
        dispose: jasmine.createSpy(),
      };
      (component as any).map = mockMap;
      component['forceMapResize']();
      tick(150);
      expect(mockMap.updateSize).toHaveBeenCalled();
    }));
  });
});
