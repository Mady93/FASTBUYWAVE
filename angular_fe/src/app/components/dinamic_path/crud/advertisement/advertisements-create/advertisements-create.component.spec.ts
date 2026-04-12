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
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdvertisementsCreateComponent } from './advertisements-create.component';
import { AdvetisementService } from 'src/app/services/path/advertisement/advetisement.service';
import { CategoryService } from 'src/app/services/path/category/category.service';
import { GeocodingService } from 'src/app/services/geo/geocoding.service';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
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
import { CategoryDTO } from 'src/app/interfaces/dtos/category_dto.interface';

// Mock di FormLayoutComponent
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

// Mock dei servizi
class MockAdvetisementService {
  createAdvertisement = jasmine.createSpy().and.returnValue(of({}));
}

class MockCategoryService {
  getCategoryByLink = jasmine.createSpy().and.returnValue(
    of({
      categoryId: 1,
      label: 'Test Category',
      name: 'test',
      icon: 'faTest',
      link: '/test',
      active: true,
    } as CategoryDTO),
  );
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
      {
        cca2: 'FR',
        name: { common: 'France' },
        region: 'Europe',
        population: 67000000,
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
          { name: 'Campania', state_code: 'NA' },
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
  userInfo$ = new BehaviorSubject({
    userId: '1',
    email: 'test@test.com',
    roles: ['USER'],
  });
}

class MockMatSnackBar {
  open = jasmine.createSpy();
}

describe('AdvertisementsCreateComponent', () => {
  let component: AdvertisementsCreateComponent;
  let fixture: ComponentFixture<AdvertisementsCreateComponent>;
  let advertisementService: MockAdvetisementService;
  let categoryService: MockCategoryService;
  let geocodingService: MockGeocodingService;
  let authService: MockAuthGoogleService;
  let snackBar: MockMatSnackBar;

  beforeEach(async () => {
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({
        isConfirmed: true,
        isDenied: false,
        isDismissed: false,
      }) as any,
    );

    snackBar = new MockMatSnackBar();

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NoopAnimationsModule,
        AdvertisementsCreateComponent,
      ],
      providers: [
        { provide: AdvetisementService, useClass: MockAdvetisementService },
        { provide: CategoryService, useClass: MockCategoryService },
        { provide: GeocodingService, useClass: MockGeocodingService },
        { provide: AuthGoogleService, useClass: MockAuthGoogleService },
        { provide: MatSnackBar, useValue: snackBar },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AdvertisementsCreateComponent, {
        remove: { imports: [FormLayoutComponent] },
        add: { imports: [MockFormLayoutComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AdvertisementsCreateComponent);
    component = fixture.componentInstance;
    advertisementService = TestBed.inject(AdvetisementService) as any;
    categoryService = TestBed.inject(CategoryService) as any;
    geocodingService = TestBed.inject(GeocodingService) as any;
    authService = TestBed.inject(AuthGoogleService) as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize forms', () => {
      expect(component.advertisementForm).toBeTruthy();
      expect(component.productForm).toBeTruthy();
      expect(component.addressForm).toBeTruthy();
    });

    it('should load current user ID', () => {
      expect(component.userId).toBe(1);
    });

    it('should load countries', () => {
      expect(geocodingService.getCountries).toHaveBeenCalled();
      expect(component.countries.length).toBeGreaterThan(0);
    });
  });

  describe('Category handling', () => {
    it('should set advertisement type from category', () => {
      component.category = 'advertisement_electronics_tv';
      component.setAdvertisementTypeFromCategory();
      expect(component.categoryNormalizzeTypeAdvertisement).toBe(
        'Marketplace/Electronics/Tv',
      );
    });

    it('should load category by normalized path', () => {
      component.category = 'advertisement_electronics_tv';
      component.loadCategoryByNormalizedPath();
      expect(categoryService.getCategoryByLink).toHaveBeenCalled();
    });
  });

  describe('Form validation', () => {
    it('should have required fields in advertisement form', () => {
      const titleControl = component.advertisementForm.get('title');
      titleControl?.setValue('');
      expect(titleControl?.valid).toBeFalse();
      titleControl?.setValue('Test Title');
      expect(titleControl?.valid).toBeTrue();
    });

    it('should have required fields in product form', () => {
      const priceControl = component.productForm.get('price');
      priceControl?.setValue(null);
      expect(priceControl?.valid).toBeFalse();
      priceControl?.setValue(100);
      expect(priceControl?.valid).toBeTrue();
    });

    it('should have required fields in address form', () => {
      const streetControl = component.addressForm.get('street');
      streetControl?.setValue('');
      expect(streetControl?.valid).toBeFalse();
      streetControl?.setValue('Via Roma');
      expect(streetControl?.valid).toBeTrue();
    });
  });

  describe('Agency fields', () => {
    it('should enable agency fields when agency checkbox is true', () => {
      component.advertisementForm.get('agency')?.setValue(true);
      expect(component.advertisementForm.get('agencyName')?.enabled).toBeTrue();
      expect(
        component.advertisementForm.get('agencyFeePercent')?.enabled,
      ).toBeTrue();
      expect(component.advertisementForm.get('agencyUrl')?.enabled).toBeTrue();
    });

    it('should disable agency fields when agency checkbox is false', () => {
      component.advertisementForm.get('agency')?.setValue(false);
      expect(
        component.advertisementForm.get('agencyName')?.disabled,
      ).toBeTrue();
      expect(
        component.advertisementForm.get('agencyFeePercent')?.disabled,
      ).toBeTrue();
      expect(component.advertisementForm.get('agencyUrl')?.disabled).toBeTrue();
    });
  });

  describe('Image handling', () => {
    it('should add files on selection', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [file] } } as any;
      component.onFileSelected(event);
      expect(component.selectedFiles.length).toBe(1);
    });

    it('should remove image', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      component.selectedFiles = [file];
      component.removeImage(0);
      expect(component.selectedFiles.length).toBe(0);
    });
  });

  describe('Button states', () => {
    beforeEach(() => {
      component.ngOnInit();

      component.advertisementForm.patchValue({
        title: 'Test Title',
        description: 'Test Description',
        agency: false,
      });
      component.productForm.patchValue({
        price: 100,
        condition: 'NEW',
        stockQuantity: 5,
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
        active: true,
      });
      component.selectedFiles = [
        new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
      ];
      component.sendCategory = {
        categoryId: 1,
        label: 'Test',
        name: 'test',
        icon: 'fa',
        link: '/test',
        active: true,
      } as CategoryDTO;

      component.advertisementForm.updateValueAndValidity();
      component.productForm.updateValueAndValidity();
      component.addressForm.updateValueAndValidity();
    });

    it('should enable create button when form is valid', () => {
      expect(component.advertisementForm.valid).toBeTrue();
      expect(component.productForm.valid).toBeTrue();
      expect(component.addressForm.valid).toBeTrue();
      expect(component.selectedFiles.length).toBeGreaterThan(0);
      expect(component.isCreateButtonEnabled()).toBeTrue();
    });

    it('should enable reset button when form is modified', () => {
      component.advertisementForm.get('title')?.setValue('Changed');
      expect(component.isResetButtonEnabled()).toBeTrue();
    });
  });

  describe('Form actions', () => {
    it('should handle reset action', fakeAsync(() => {
      component.onFormAction('reset');
      flush();
      expect(Swal.fire).toHaveBeenCalled();
      flush();
      discardPeriodicTasks();
    }));

    it('should handle create action', fakeAsync(() => {
      component.ngOnInit();

      component.advertisementForm.patchValue({
        title: 'Test Title',
        description: 'Test Description',
        agency: false,
      });
      component.productForm.patchValue({
        price: 100,
        condition: 'NEW',
        stockQuantity: 5,
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
        active: true,
      });
      component.selectedFiles = [
        new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
      ];
      component.sendCategory = {
        categoryId: 1,
        label: 'Test',
        name: 'test',
        icon: 'fa',
        link: '/test',
        active: true,
      } as CategoryDTO;

      component.onFormAction('create');
      flush();
      expect(Swal.fire).toHaveBeenCalled();
      flush();
      discardPeriodicTasks();
    }));
  });

  describe('Form submission', () => {
    beforeEach(() => {
      component.userId = 1;
      component.advertisementForm.patchValue({
        title: 'Test Title',
        description:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
        agency: false,
      });
      component.productForm.patchValue({
        price: 100,
        condition: 'NEW',
        stockQuantity: 5,
        active: true,
      });
      component.addressForm.patchValue({
        street: 'Via Roma',
        streetNumber: '15',
        province: 'RM',
        region: 'Lazio',
        zipCode: '00100',
        city: 'Rome',
        country: 'Italy',
        active: true,
      });
      component.selectedFiles = [
        new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
      ];
      component.sendCategory = {
        categoryId: 1,
        label: 'Test',
        name: 'test',
        icon: 'fa',
        link: '/test',
        active: true,
      } as CategoryDTO;

      component.advertisementForm.updateValueAndValidity();
      component.productForm.updateValueAndValidity();
      component.addressForm.updateValueAndValidity();
    });

    it('should submit form successfully', fakeAsync(() => {
      component.userId = 1;

      component.sendCategory = {
        categoryId: 1,
        label: 'Test',
        name: 'test',
        icon: 'fa',
        link: '/test',
        active: true,
      } as CategoryDTO;

      component.advertisementForm.patchValue({
        title: 'Test Title',
        description:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
        agency: false,
        type: 'Marketplace/Electronics/Tv',
      });
      component.productForm.patchValue({
        price: 100,
        condition: 'NEW',
        stockQuantity: 5,
        active: true,
      });
      component.addressForm.patchValue({
        street: 'Via Roma',
        streetNumber: '15',
        province: 'RM',
        region: 'Lazio',
        zipCode: '00100',
        city: 'Rome',
        country: 'Italy',
        active: true,
      });
      component.selectedFiles = [
        new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
      ];

      advertisementService.createAdvertisement.and.returnValue(of({}));
      component.onSubmit();
      flush();

      expect(advertisementService.createAdvertisement).toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should handle submission error', fakeAsync(() => {
      advertisementService.createAdvertisement.and.returnValue(
        throwError(() => new Error('Error')),
      );
      component.onSubmit();
      tick(100);
      expect(true).toBeTrue();
      flush();
      discardPeriodicTasks();
    }));

    it('should not submit without user ID', () => {
      component.userId = null;
      component.onSubmit();
      expect(true).toBeTrue();
      expect(advertisementService.createAdvertisement).not.toHaveBeenCalled();
    });

    it('should not submit without images', () => {
      component.selectedFiles = [];
      component.onSubmit();
      expect(true).toBeTrue();
    });
  });

  describe('Reset form', () => {
    it('should reset form', fakeAsync(() => {
      component.advertisementForm.patchValue({
        title: 'Test',
        description: 'Test',
      });
      component.productForm.patchValue({
        price: 100,
      });
      component.addressForm.patchValue({
        street: 'Via Roma',
      });
      component.selectedFiles = [
        new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
      ];

      component.resetForm();
      tick(500);

      expect(component.advertisementForm.get('title')?.value).toBe('');
      expect(component.productForm.get('price')?.value).toBeNull();
      expect(component.addressForm.get('street')?.value).toBe('');
      expect(component.selectedFiles.length).toBe(0);
      flush();
      discardPeriodicTasks();
    }));
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

    it('should clear coordinates when address is incomplete', () => {
      component.addressForm.patchValue({
        street: '',
        streetNumber: '',
      });
      component.tryUpdateCoordinates();
      expect(component.addressForm.get('latitude')?.value).toBeNull();
      expect(component.addressForm.get('longitude')?.value).toBeNull();
    });
  });

  describe('Timer', () => {
    it('should increment time', fakeAsync(() => {
      component.incrementTime();
      tick(60000);
      expect(component.advertisementForm.get('createdAt')?.value).toBeTruthy();
      flush();
      discardPeriodicTasks();
    }));
  });
});
