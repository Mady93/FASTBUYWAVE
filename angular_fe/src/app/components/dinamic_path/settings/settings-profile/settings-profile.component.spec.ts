import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
  discardPeriodicTasks,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { SettingsProfileComponent } from './settings-profile.component';
import { ProfileService } from 'src/app/services/path/profile/profile.service';
import { GeocodingService } from 'src/app/services/geo/geocoding.service';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormLayoutComponent } from 'my-lib-inside';
import { ProfileDTO } from 'src/app/interfaces/dtos/profile_dto.interface';
import { AddressDTO } from 'src/app/interfaces/dtos/adress_dto.interface';

@Component({
  selector: 'lib-form-layout',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockFormLayoutComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() columns: number = 4;
  @Input() actions: any[] = [];
  @Input() spinnerUrl: string = '/t.png';
  @Input() recursive: boolean = false;
  @Input() loading: boolean = false;
  @Output() actionClicked = new EventEmitter<string>();
}

class MockProfileService {
  getProfileByUserId = jasmine.createSpy().and.returnValue(of(null));
  createProfile = jasmine
    .createSpy()
    .and.returnValue(of({ profileId: 1 } as ProfileDTO));
  updateProfile = jasmine
    .createSpy()
    .and.returnValue(of({ profileId: 1 } as ProfileDTO));
  notifyProfileUpdated = jasmine.createSpy();
}

class MockGeocodingService {
  getCountries = jasmine.createSpy().and.returnValue(
    of([
      {
        cca2: 'IT',
        name: { common: 'Italy' },
        region: 'Europe',
        population: 60000000,
      },
      {
        cca2: 'US',
        name: { common: 'United States' },
        region: 'Americas',
        population: 331000000,
      },
    ]),
  );
  getCities = jasmine
    .createSpy()
    .and.returnValue(
      of({ error: false, msg: '', data: ['Rome', 'Milan', 'Naples'] }),
    );
  getStates = jasmine.createSpy().and.returnValue(
    of({
      error: false,
      msg: '',
      data: {
        name: 'Italy',
        iso3: 'ITA',
        iso2: 'IT',
        states: [
          { name: 'Lazio', state_code: 'RM' },
          { name: 'Lombardy', state_code: 'MI' },
        ],
      },
    }),
  );
  getCoordinatesFromAddress = jasmine
    .createSpy()
    .and.returnValue(of({ lat: 41.9028, lon: 12.4964 }));
}

class MockAuthGoogleService {
  getCurrentUserInfo = jasmine
    .createSpy()
    .and.returnValue({ userId: '1', roles: ['USER'] });
  getAccessToken = jasmine.createSpy().and.returnValue(null);
  userInfo$ = new BehaviorSubject({
    userId: '1',
    email: 'test@test.com',
    roles: ['USER'],
  });
}

class MockRouter {
  navigate = jasmine.createSpy();
}

class MockMatSnackBar {
  open = jasmine.createSpy();
}

describe('SettingsProfileComponent', () => {
  let component: SettingsProfileComponent;
  let fixture: ComponentFixture<SettingsProfileComponent>;
  let profileService: MockProfileService;
  let geocodingService: MockGeocodingService;
  let authService: MockAuthGoogleService;
  let router: MockRouter;

  const mockProfile: ProfileDTO = {
    profileId: 1,
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    phoneNumber: '+39123456789',
    userType: 'Both',
    securityQuestion: 'What is your pet?',
    securityAnswer: 'Fluffy',
    newsletterSubscription: true,
    preferredLanguage: 'it',
    currency: 'EUR',
    active: true,
    notificationPreferences: ['email', 'sms'],
    privacySettings: ['visible'],
    address: {
      addressId: 1,
      street: 'Via Roma',
      streetNumber: '15',
      city: 'Rome',
      province: 'RM',
      region: 'Lazio',
      country: 'Italy',
      zipCode: '00100',
      latitude: 41.9028,
      longitude: 12.4964,
      active: true,
    } as AddressDTO,
  } as ProfileDTO;

  beforeEach(async () => {
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({
        isConfirmed: true,
        isDenied: false,
        isDismissed: false,
      }) as any,
    );

    router = new MockRouter();

    await TestBed.configureTestingModule({
      imports: [CommonModule, NoopAnimationsModule, SettingsProfileComponent],
      providers: [
        { provide: ProfileService, useClass: MockProfileService },
        { provide: GeocodingService, useClass: MockGeocodingService },
        { provide: AuthGoogleService, useClass: MockAuthGoogleService },
        { provide: Router, useValue: router },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SettingsProfileComponent, {
        remove: { imports: [FormLayoutComponent] },
        add: { imports: [MockFormLayoutComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SettingsProfileComponent);
    component = fixture.componentInstance;

    (component as any).snackBar = { open: jasmine.createSpy('open') };

    profileService = TestBed.inject(ProfileService) as any;
    geocodingService = TestBed.inject(GeocodingService) as any;
    authService = TestBed.inject(AuthGoogleService) as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize forms', () => {
      expect(component.profileForm).toBeTruthy();
      expect(component.addressForm).toBeTruthy();
    });

    it('should load current user ID', () => {
      expect(component.userId).toBe(1);
    });

    it('should check existing profile', () => {
      expect(profileService.getProfileByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe('Profile loading', () => {
    it('should set edit mode when profile exists', fakeAsync(() => {
      profileService.getProfileByUserId.and.returnValue(of(mockProfile));
      component.ngOnInit();
      flush();
      discardPeriodicTasks();
      expect(component.isEditMode).toBeTrue();
      expect(component.existingProfile).toEqual(mockProfile);
    }));

    it('should set create mode when profile not found', fakeAsync(() => {
      profileService.getProfileByUserId.and.returnValue(
        throwError(() => ({ status: 404 })),
      );
      component.ngOnInit();
      flush();
      expect(component.isEditMode).toBeFalse();
    }));
  });

  describe('Form validation', () => {
    it('should have required fields in profile form', () => {
      const firstNameControl = component.profileForm.get('firstName');
      firstNameControl?.setValue('');
      expect(firstNameControl?.valid).toBeFalse();
      firstNameControl?.setValue('John');
      expect(firstNameControl?.valid).toBeTrue();
    });

    it('should have required fields in address form', () => {
      const streetControl = component.addressForm.get('street');
      streetControl?.setValue('');
      expect(streetControl?.valid).toBeFalse();
      streetControl?.setValue('Via Roma');
      expect(streetControl?.valid).toBeTrue();
    });
  });

  describe('Button states', () => {
    beforeEach(() => {
      component.profileForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        phoneNumber: '+39123456789',
        securityQuestion: 'Question?',
        securityAnswer: 'Answer',
      });
      component.addressForm.patchValue({
        street: 'Via Roma',
        streetNumber: '15',
        region: 'Lazio',
        zipCode: '00100',
        city: 'Rome',
        country: 'Italy',
        province: 'RM',
      });
    });

    it('should enable submit button when form is valid', () => {
      expect(component.isSubmitButtonEnabled).toBeTrue();
    });

    it('should disable submit button when form is invalid', () => {
      component.profileForm.get('firstName')?.setValue('');
      expect(component.isSubmitButtonEnabled).toBeFalse();
    });
  });

  describe('Form actions', () => {
    it('should handle reset action', fakeAsync(() => {
      (component as any).formsHaveValues = true;
      (component as any).formsModified = true;
      component.onFormAction('reset');
      tick();
      flush();
      discardPeriodicTasks();
      expect(Swal.fire).toHaveBeenCalled();
    }));

    it('should handle submit action', fakeAsync(() => {
      component.profileForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        phoneNumber: '+39123456789',
        securityQuestion: 'Question?',
        securityAnswer: 'Answer',
      });
      component.addressForm.patchValue({
        street: 'Via Roma',
        streetNumber: '15',
        region: 'Lazio',
        zipCode: '00100',
        city: 'Rome',
        country: 'Italy',
        province: 'RM',
      });
      component.onFormAction('submit');
      flush();
      discardPeriodicTasks();
      expect(Swal.fire).toHaveBeenCalled();
    }));
  });

  describe('Profile submission', () => {
    beforeEach(() => {
      component.userId = 1;
      component.profileForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        phoneNumber: '+39123456789',
        securityQuestion: 'Question?',
        securityAnswer: 'Answer',
      });
      component.addressForm.patchValue({
        street: 'Via Roma',
        streetNumber: '15',
        region: 'Lazio',
        zipCode: '00100',
        city: 'Rome',
        country: 'Italy',
        province: 'RM',
      });
    });

    it('should create profile successfully', fakeAsync(() => {
      spyOn(component as any, 'maybeSetDefaultImage').and.returnValue(
        Promise.resolve(),
      );
      spyOn(component as any, 'loadDefaultImage').and.returnValue(
        Promise.resolve(new File([], 'test.png')),
      );
      spyOn(component as any, 'dataURLtoFile').and.returnValue(
        Promise.resolve(new File([], 'test.png')),
      );
      profileService.createProfile.and.returnValue(of(mockProfile));
      component.onSubmit();
      tick();
      flush();
      discardPeriodicTasks();
      expect(profileService.createProfile).toHaveBeenCalled();
    }));

    it('should update profile successfully', fakeAsync(() => {
      spyOn(component as any, 'maybeSetDefaultImage').and.returnValue(
        Promise.resolve(),
      );
      spyOn(component as any, 'dataURLtoFile').and.returnValue(
        Promise.resolve(new File([], 'test.png')),
      );
      spyOn(component as any, 'loadDefaultImage').and.returnValue(
        Promise.resolve(new File([], 'default.png')),
      );

      spyOn(component as any, 'checkExistingProfile').and.callFake(() => {
        component.isEditMode = true;
        component.existingProfile = mockProfile;
        component.profileId = 1;
      });

      component.userId = 1;
      component.isEditMode = true;
      component.profileId = 1;
      component.existingProfile = { ...mockProfile };
      (component as any).formsModified = true;

      component.profileForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        phoneNumber: '+39123456789',
        securityQuestion: 'Question?',
        securityAnswer: 'Answer',
        userType: 'Buyer',
        preferredLanguage: 'it',
        currency: 'EUR',
        notificationPreferences: ['email'],
        privacySettings: ['visible'],
        newsletterSubscription: true,
        active: true,
      });

      component.addressForm.patchValue({
        street: 'Via Roma',
        streetNumber: '15',
        region: 'Lazio',
        zipCode: '00100',
        city: 'Rome',
        country: 'Italy',
        province: 'RM',
        latitude: 41.9028,
        longitude: 12.4964,
        active: true,
      });

      expect(component.profileForm.valid).toBeTrue();
      expect(component.addressForm.valid).toBeTrue();
      expect((component as any).formsModified).toBeTrue();

      profileService.updateProfile.and.returnValue(of(mockProfile));

      component.onSubmit();

      tick(1000);
      flush();
      discardPeriodicTasks();

      expect(profileService.updateProfile).toHaveBeenCalled();
    }));

    it('should handle submission error', async () => {
      spyOn(component as any, 'maybeSetDefaultImage').and.returnValue(
        Promise.resolve(),
      );
      spyOn(component as any, 'dataURLtoFile').and.returnValue(
        Promise.resolve(new File([], 'test.png')),
      );

      component.userId = 1;
      component.isEditMode = false;

      component.profileForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        phoneNumber: '+39123456789',
        securityQuestion: 'Question?',
        securityAnswer: 'Answer',
      });

      component.addressForm.patchValue({
        street: 'Via Roma',
        streetNumber: '15',
        region: 'Lazio',
        zipCode: '00100',
        city: 'Rome',
        country: 'Italy',
        province: 'RM',
      });

      profileService.createProfile.and.returnValue(
        throwError(() => new Error('Error')),
      );

      await component.onSubmit();

      expect(profileService.createProfile).toHaveBeenCalled();
      expect(component.isSubmitting).toBeFalse();
    });
  });

  describe('Reset form', () => {
    it('should reset form', fakeAsync(() => {
      (component as any).formsHaveValues = true;
      (component as any).formsModified = true;
      component.profileForm.patchValue({ firstName: 'Changed' });
      component.resetForm();
      tick();
      flush();
      discardPeriodicTasks();
      expect(Swal.fire).toHaveBeenCalled();
    }));
  });

  describe('Image handling', () => {
    it('should handle file input', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [file] } } as any;
      component.handleFileInput(event);
      expect(component.selectedFile).toBe(file);
    });

    it('should remove profile image', () => {
      component.selectedFile = new File(['test'], 'test.jpg');
      component.imageRemovedManually = false;
      component['selectedFile'] = null;
      component['imageRemovedManually'] = true;
      expect(component.imageRemovedManually).toBeTrue();
      expect(component.selectedFile).toBeNull();
    });
  });

  describe('Geocoding', () => {
    it('should update coordinates when address is complete', () => {
      component.addressForm.patchValue({
        street: 'Via Roma',
        streetNumber: '15',
        province: 'RM',
        region: 'Lazio',
        zipCode: '00100',
        city: 'Rome',
        country: 'Italy',
      });
      component.tryUpdateCoordinates();
      expect(geocodingService.getCoordinatesFromAddress).toHaveBeenCalled();
    });
  });

  describe('Country and city autocomplete', () => {
    it('should get countries', () => {
      expect(geocodingService.getCountries).toHaveBeenCalled();
      expect(component.countries.length).toBeGreaterThan(0);
    });

    it('should get cities for country', fakeAsync(() => {
      component.countryName = 'italy';
      component.getCountryDetails();
      flush();
      discardPeriodicTasks();
      expect(geocodingService.getCities).toHaveBeenCalledWith('italy');
    }));

    it('should get states details', fakeAsync(() => {
      component.countryName = 'italy';
      component.getStatesDetails();
      flush();
      discardPeriodicTasks();
      expect(geocodingService.getStates).toHaveBeenCalledWith('italy');
    }));
  });

  describe('Toggle functions', () => {
    it('should toggle privacy setting', () => {
      component.togglePrivacySetting('anonymous');
      expect(component.profileForm.get('privacySettings')?.value).toEqual([
        'anonymous',
      ]);
    });

    it('should toggle notification', () => {
      component.toggleNotification('push');
      expect(
        component.profileForm.get('notificationPreferences')?.value,
      ).toContain('push');
    });
  });

  describe('Getters', () => {
    it('should return form title', () => {
      component.isEditMode = true;
      expect(component.formTitle).toContain('update');
      component.isEditMode = false;
      expect(component.formTitle).toContain('Create');
    });

    it('should return form subtitle', () => {
      component.isEditMode = true;
      expect(component.formSubtitle).toContain('Modify');
      component.isEditMode = false;
      expect(component.formSubtitle).toContain('Enter');
    });

    it('should return submit button text', () => {
      component.isEditMode = true;
      expect(component.submitButtonText).toBe('Update');
      component.isEditMode = false;
      expect(component.submitButtonText).toBe('Create');
    });

    it('should return selected currency symbol', () => {
      component.profileForm.patchValue({ currency: 'EUR' });
      expect(component.selectedCurrencySymbol).toBe('€');
    });
  });

  describe('Form actions array', () => {
    it('should return form actions with correct states', () => {
      const actions = component.formActions;
      expect(actions.length).toBe(2);
      expect(actions[0].id).toBe('reset');
      expect(actions[1].id).toBe('submit');
    });
  });
});
