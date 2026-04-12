import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnInit,
  PLATFORM_ID,
  NgZone,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { FormLayoutComponent, ModalAction } from 'my-lib-inside';
import {
  BehaviorSubject,
  catchError,
  filter,
  finalize,
  map,
  merge,
  Observable,
  of,
  startWith,
  Subject,
  Subscription,
  take,
  takeUntil,
  tap,
  throwError,
  timeout,
  timer,
} from 'rxjs';
import { CategoryDTO } from 'src/app/interfaces/dtos/category_dto.interface';
import { AdvetisementService } from 'src/app/services/path/advertisement/advetisement.service';
import { CategoryService } from 'src/app/services/path/category/category.service';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AdvertisementDTO } from 'src/app/interfaces/dtos/advertisement_dto.interface';
import { GeocodingService } from 'src/app/services/geo/geocoding.service';
import { ProductDTO } from 'src/app/interfaces/dtos/product_dto.interface';
import { AddressDTO } from 'src/app/interfaces/dtos/adress_dto.interface';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FileToUrlPipe } from 'src/app/pipes/pipes/file-to-url.pipe';
import { SafeUrlPipe } from 'src/app/pipes/shared/pipes/safe-url.pipe';
import {
  blockInvalidAndTooHigh,
  blockInvalidPaste,
  blockInvalidAndTooHighPrice,
  blockInvalidPastePrice,
  blockOnlyNumbers,
  blockPasteNumbers,
} from '../../../../../utils/validation-utils';
import {
  getCategoryTypeFromMap,
  normalizationMap,
} from 'src/app/utils/category-normalization.util';
import { formatLocalDateTime } from '../../../../../utils/formatLocalDateTime';

import { getMillisToNextMinute } from 'src/app/utils/date-utils';
import {
  disableFormFields,
  enableFormFields,
  markAllFormsTouched,
  resetAndDisableFormFields,
  resetFormFields,
  validateAllForms,
} from 'src/app/utils/form-utils';
import { filterNewFiles } from 'src/app/utils/file-utils';
import { ValidationPatterns } from 'src/app/utils/validators-pattern-utils';
import { showSnackBar } from 'src/app/utils/snackbar.utils';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import {
  countryCodeToEmoji,
  extractCountryName,
  filterCitiesArray,
  filterCountriesArray,
} from 'src/app/utils/country.utils';
import { CountryStatesResponse } from 'src/app/interfaces/country/countryStatesResponse';
import { CountryResponse } from 'src/app/interfaces/country/country_response';
import {
  composeFullAddress,
  extractProvinceCodes,
  filterItalianStates,
  hasAllRequiredAddressFields,
} from 'src/app/utils/geocoding.utils';
import { updateAgencyFieldsValidity } from 'src/app/utils/agency-validators-utils';
import Swal from 'sweetalert2';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';

/**
 * @category Components
 *
 * @description Handles the creation of advertisements,
 * including managing reactive forms for advertisement details,
 * product data, and address information. Supports image uploads,
 * dynamic form validations, geolocation for address fields,
 * and communication with backend services for creating advertisements.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Component({
  selector: 'app-advertisements-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    FileToUrlPipe,
    SafeUrlPipe,
    FormLayoutComponent,
  ],
  templateUrl: './advertisements-create.component.html',
  styleUrl: './advertisements-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvertisementsCreateComponent
  implements OnInit, OnChanges, OnDestroy
{
  // ─────────────────────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────────────────────

  /**
   * @property category
   *
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

  // ─────────────────────────────────────────────────────────────
  // Properties
  // ─────────────────────────────────────────────────────────────

  /**
   * @description Normalized advertisement type derived from the category input.
   */
  categoryNormalizzeTypeAdvertisement: string = '';

  /**
   * @description Normalized category path used for API requests.
   */
  categoryNormalizzeGetIdCategory: string = '';

  /**
   * @description Path to the loading spinner image.
   */
  spinner = '/t.png';

  /**
   * @description Returns the spinner image path.
   */
  getspinner: Function = () => this.spinner;

  /**
   * @description BehaviorSubject representing the current loading state.
   */
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  /**
   * @description Observable that emits the current loading state.
   */
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  /**
   * @description Returns the current value of the loading state.
   */
  get isLoading(): Function {
    return () => this.isLoadingSubject.value;
  }

  /**
   * @description Stores the currently selected category object.
   */
  selectedCategory: CategoryDTO | null = null;

  /**
   * @description Category object prepared to be sent to the backend when creating the advertisement.
   */
  sendCategory!: CategoryDTO;

  /**
   * @description Observable for the logo image.
   */
  imgLogo$: Observable<any> = of([]);

  /**
   * @description Subscription to the timer updating the createdAt field every minute.
   */
  private timerSubscription?: Subscription;

  /**
   * @description Subscription for tracking address form changes.
   */
  private addressChangesSub?: Subscription;

  /**
   * @description Array of country names for selection.
   */
  countries: string[] = [];

  /**
   * @description Observable of filtered countries for the autocomplete input.
   */
  filteredCountries: Observable<string[]> = of([]);

  /**
   * @description Full list of country objects from the geocoding service.
   */
  allCountries: any[] = [];

  /**
   * @description Currently selected country name (normalized).
   */
  countryName: any;

  /**
   * @description Array of city names for the selected country.
   */
  cities: string[] = [];

  /**
   * @description Observable of cities filtered for autocomplete.
   */
  filteredCities: Observable<string[]> = of([]);

  /**
   * @description Observable array of region names for the selected country.
   */
  regions: Observable<string[]> = of([]);

  /**
   * @description Observable array of provinces filtered for selection.
   */
  filteredProvinces: Observable<string[]> = of([]);

  /**
   * @description Full array of region names.
   */
  allRegions: string[] = [];

  /**
   * @description Full array of province names.
   */
  allProvinces: string[] = [];

  /**
   * @description Reactive form managing advertisement details like title, description, and agency info.
   */
  advertisementForm!: FormGroup;

  /**
   * @description Reactive form managing product details like price, condition, and stock.
   */
  productForm!: FormGroup;

  /**
   * @description Reactive form managing address details including country, region, city, zip, latitude, and longitude.
   */
  addressForm!: FormGroup;

  /**
   * @description Array holding selected image files for the advertisement.
   */
  selectedFiles: File[] = [];

  /**
   * @description Maximum number of images allowed to upload.
   */
  maxImages = 10;

  /**
   * @description Flag indicating whether the form submission is in progress.
   */
  isSubmitting = false;

  /**
   * @description Current user ID, used when sending data to the backend.
   */
  userId: number | null = null;

  /**
   * @description Current category ID (optional).
   */
  categoryId: number | null = null;

  /**
   * @description Subject used for unsubscribing observables on component destroy.
   */
  private destroy$ = new Subject<void>();

  /**
   * @description Flag indicating whether the form is being reset.
   */
  isResetting = false;

  /**
   * @description Flag indicating if any of the forms have been modified.
   */
  private formsModified = false;

  // ─────────────────────────────────────────────────────────────
  // Services
  // ─────────────────────────────────────────────────────────────

  /**
   * @description Allows manual triggering of Angular's change detection.
   * Useful when updates occur outside Angular's zone or after async operations.
   */
  private cdr = inject(ChangeDetectorRef);

  /**
   * @description Represents the current platform ID (`browser`, `server`, etc.).
   * Useful for platform-specific logic (e.g., server vs browser).
   */
  private platformId = inject(PLATFORM_ID);

  /**
   * @description Angular's NgZone service for running code inside or outside the Angular zone.
   * Helps improve performance by avoiding unnecessary change detection cycles.
   */
  private ngZone = inject(NgZone);

  /**
   * @description FormBuilder service for creating reactive forms and form controls.
   */
  private fb = inject(FormBuilder);

  /**
   * @description Service to manage categories data.
   * Handles CRUD operations and API communication related to categories.
   */
  private categoryService = inject(CategoryService);

  /**
   * @description Service to manage advertisements data.
   * Handles CRUD operations, API communication, and business logic for ads.
   */
  private advertisementService = inject(AdvetisementService);

  /**
   * @description Angular Material MatSnackBar service for showing popup notifications.
   * Can display success, error, or informational messages.
   */
  private snackBar = inject(MatSnackBar);

  /**
   * @description GeocodingService to handle location and address resolution.
   * Provides methods to convert coordinates to addresses and vice versa.
   */
  private geocodingService = inject(GeocodingService);

  /**
   * @description AuthGoogleService handles authentication using Google OAuth.
   * Provides login, logout, token management, and user profile information.
   */
  private authService = inject(AuthGoogleService);

  // ─────────────────────────────────────────────────────────────
  // Lifecycle Hooks
  // ─────────────────────────────────────────────────────────────

  /**
   * @description Initializes forms, sets up reactive form listeners, loads countries and states,
   * and starts the timer to auto-update the advertisement createdAt field.
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.getCurrentUserId();
      this.initForm();

      if (this.category) {
        this.setAdvertisementTypeFromCategory();
        this.loadCategoryByNormalizedPath();
      }
      this.ngZone.onStable.pipe(take(1)).subscribe(() => {
        this.incrementTime();
      });

      this.getCountries();
      this.getStatesDetails();
      this.getCountryDetails();

      this.initCountryValueChanges();
    }
  }

  /**
   * @param changes - Object containing changes to input properties.
   * @description Listens for changes to the `category` input and updates the advertisement type
   * and loads category data if necessary.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['category'] &&
      changes['category'].currentValue &&
      this.advertisementForm
    ) {
      this.setAdvertisementTypeFromCategory();
      this.loadCategoryByNormalizedPath();
    }
  }

  /**
   * @description Cleans up subscriptions and Subjects when the component is destroyed.
   */
  ngOnDestroy() {
    this.timerSubscription?.unsubscribe();
    this.addressChangesSub?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─────────────────────────────────────────────────────────────
  // Authentication
  // ─────────────────────────────────────────────────────────────

  /**
   * @description Fetches the current user ID from the auth service or session storage as fallback.
   */
  private getCurrentUserId(): void {
    const userInfo = this.authService.getCurrentUserInfo();
    if (userInfo?.userId) {
      this.userId = +userInfo.userId;
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
          this.userId = +info!.userId;
        },
        error: () => {
          try {
            const s = sessionStorage.getItem('user_info');
            if (s) this.userId = +JSON.parse(s).userId;
          } catch {}
        },
      });
  }

  // ─────────────────────────────────────────────────────────────
  // Form Initialization
  // ─────────────────────────────────────────────────────────────

  /**
   * @description Initializes all reactive forms (advertisement, product, and address),
   * sets up agency and address listeners, and starts form change tracking
   * to monitor modifications for enabling/disabling the reset button.
   */
  private initForm(): void {
    this.initAdvertisementForm();
    this.initProductForm();
    this.initAddressForm();
    this.setupAgencyValueChanges();
    this.setupAddressListeners();
    setTimeout(() => {
      this.formsModified = false;
      this.setupFormChangeTracking();
      this.cdr.markForCheck();
    }, 0);
  }

  /**
   * @description Initializes the `advertisementForm` with controls for title, description, status,
   * creation date, type, agency-related fields (name, fee percent, URL), logo image,
   * and active status, including default values and validators.
   */
  private initAdvertisementForm(): void {
    this.advertisementForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['ACTIVE'],
      createdAt: [{ value: formatLocalDateTime(new Date()), disabled: true }],
      type: [''],
      agency: [false],
      agencyName: [
        { value: '', disabled: true },
        [Validators.pattern(ValidationPatterns.agencyNamePattern)],
      ],
      agencyFeePercent: [
        { value: null, disabled: true },
        [
          Validators.min(0),
          Validators.max(100),
          Validators.pattern(ValidationPatterns.agencyFeePercentPattern),
        ],
      ],
      agencyUrl: [
        { value: '', disabled: true },
        [Validators.pattern(ValidationPatterns.httpsUrlPattern)],
      ],
      logoImg: [''],
      active: [true],
    });
  }

  /**
   * @description Initializes the `productForm` with controls for price, condition, stock quantity,
   * and active status, applying validation rules such as required, min/max values, and pattern checks.
   */
  private initProductForm(): void {
    this.productForm = this.fb.group({
      price: [
        null,
        [
          Validators.required,
          Validators.min(0.0),
          Validators.max(999999.99),
          Validators.pattern(ValidationPatterns.pricePattern),
        ],
      ],
      condition: ['NEW', Validators.required], // ✅ Valore default 'NEW'
      stockQuantity: [
        1,
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      active: [true],
    });
  }

  /**
   * @description Initializes the `addressForm` with controls for street, street number, province,
   * region, zip code, city, country, latitude, longitude, and active status.
   * Sets up reactive listeners for `region` and `province` to filter autocomplete suggestions as the user types.
   */
  private initAddressForm(): void {
    this.addressForm = this.fb.group(
      {
        street: ['', Validators.required],
        streetNumber: [
          '',
          [
            Validators.required,
            Validators.pattern(ValidationPatterns.streetNumberPattern),
          ],
        ],
        province: [{ value: '', disabled: true }],
        region: [{ value: '', disabled: true }, Validators.required],
        zipCode: ['', Validators.required],
        city: [{ value: '', disabled: true }, Validators.required],
        country: ['', Validators.required],
        latitude: [null],
        longitude: [null],
        active: [true],
      },
      {
        updateOn: 'change',
      },
    );

    this.addressForm.get('region')!.valueChanges.subscribe((val: string) => {
      const query = val?.toLowerCase() ?? '';
      const filteredRegions = this.allRegions.filter((r) =>
        r.toLowerCase().includes(query),
      );
      this.regions = of(filteredRegions);
    });

    this.addressForm.get('province')!.valueChanges.subscribe((val: string) => {
      const query = val?.toLowerCase() ?? '';
      const filteredProvinces = this.allProvinces.filter((p) =>
        p.toLowerCase().includes(query),
      );
      this.filteredProvinces = of(filteredProvinces);
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Form Listeners & Validators
  // ─────────────────────────────────────────────────────────────

  /**
   * @description Subscribes to the `country` form control changes to enable or disable dependent fields
   * (`province`, `region`, `city`) based on whether a country is selected.
   */
  private initCountryValueChanges(): void {
    this.addressForm
      .get('country')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value) {
          enableFormFields(this.addressForm, ['province', 'region', 'city']);
        } else {
          resetAndDisableFormFields(this.addressForm, [
            'province',
            'region',
            'city',
          ]);
        }
      });
  }

  /**
   * @description Custom validator ensuring that `region` or `city` cannot be selected before selecting a country.
   * @returns {ValidatorFn} Angular ValidatorFn to attach to a form control.
   */
  regionCityDependencyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent;
      if (!parent) return null;

      const country = parent.get('country')?.value;

      // Se country è vuoto e l'utente ha toccato region
      if (!country && (control.touched || control.dirty)) {
        return { countryRequiredFirst: true };
      }

      return null;
    };
  }

  /**
   * @description Subscribes to changes on the `agency` checkbox in the `advertisementForm`.
   * When the checkbox is selected, it enables agency-related fields and applies validators.
   * When unselected, it disables those fields and clears validators.
   */
  private setupAgencyValueChanges(): void {
    this.advertisementForm
      .get('agency')!
      .valueChanges.subscribe((selected: boolean) => {
        if (selected) {
          this.enableAgencyFields();
        } else {
          this.disableAgencyFields();
        }

        updateAgencyFieldsValidity(this.advertisementForm);
        this.cdr.markForCheck();
      });
  }

  /**
   * @description Sets up listeners on address form controls to automatically update
   * latitude and longitude when any relevant field changes.
   */
  private setupAddressListeners(): void {
    const controls = [
      this.addressForm.get('street')!,
      this.addressForm.get('streetNumber')!,
      this.addressForm.get('province')!,
      this.addressForm.get('region')!,
      this.addressForm.get('zipCode')!,
      this.addressForm.get('city')!,
      this.addressForm.get('country')!,
    ];

    this.addressChangesSub = merge(
      ...controls.map((c) => c.valueChanges),
    ).subscribe(() => {
      this.tryUpdateCoordinates();
    });

    this.addressForm.get('zipCode')!.valueChanges.subscribe((zipCode) => {
      this.tryUpdateCoordinates();
    });
  }

  /**
   * @description Setup form change tracking to enable the reset button.
   */
  private setupFormChangeTracking(): void {
    merge(
      this.advertisementForm.valueChanges,
      this.productForm.valueChanges,
      this.addressForm.valueChanges,
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.formsModified = true;
        this.cdr.markForCheck();
      });
  }

  // ─────────────────────────────────────────────────────────────
  // Agency
  // ─────────────────────────────────────────────────────────────

  /**
   * @description Enables agency-related fields (`agencyName`, `agencyFeePercent`, `agencyUrl`)
   * and sets validators when the agency checkbox is checked.
   */
  enableAgencyFields(): void {
    enableFormFields(this.advertisementForm, [
      'agencyName',
      'agencyFeePercent',
      'agencyUrl',
    ]);

    this.advertisementForm
      .get('agencyName')
      ?.setValidators([
        Validators.required,
        Validators.pattern(ValidationPatterns.agencyNamePattern),
      ]);

    this.advertisementForm
      .get('agencyFeePercent')
      ?.setValidators([
        Validators.required,
        Validators.pattern(ValidationPatterns.agencyFeePercentPattern),
        Validators.min(0),
        Validators.max(100),
      ]);

    this.advertisementForm
      .get('agencyUrl')
      ?.setValidators([
        Validators.required,
        Validators.pattern(ValidationPatterns.httpsUrlPattern),
      ]);

    this.advertisementForm.get('agencyName')?.updateValueAndValidity();
    this.advertisementForm.get('agencyFeePercent')?.updateValueAndValidity();
    this.advertisementForm.get('agencyUrl')?.updateValueAndValidity();
  }

  /**
   * @description Disables agency-related fields and clears validators and errors
   * when the agency checkbox is unchecked.
   */
  disableAgencyFields(): void {
    disableFormFields(this.advertisementForm, [
      'agencyName',
      'agencyFeePercent',
      'agencyUrl',
    ]);

    this.advertisementForm.get('agencyName')?.clearValidators();
    this.advertisementForm.get('agencyFeePercent')?.clearValidators();
    this.advertisementForm.get('agencyUrl')?.clearValidators();

    // Resetta anche gli errori
    this.advertisementForm.get('agencyName')?.setErrors(null);
    this.advertisementForm.get('agencyFeePercent')?.setErrors(null);
    this.advertisementForm.get('agencyUrl')?.setErrors(null);

    this.advertisementForm.get('agencyName')?.updateValueAndValidity();
    this.advertisementForm.get('agencyFeePercent')?.updateValueAndValidity();
    this.advertisementForm.get('agencyUrl')?.updateValueAndValidity();
  }

  // ─────────────────────────────────────────────────────────────
  // Geocoding
  // ─────────────────────────────────────────────────────────────

  /**
   * @description Calls the geocoding service to fetch latitude and longitude based on the current address.
   * Updates the form with results or resets coordinates if the address is incomplete or invalid.
   */
  tryUpdateCoordinates() {
    this.addressForm.updateValueAndValidity({
      onlySelf: false,
      emitEvent: true,
    });
    const address = this.addressForm.value;

    if (!hasAllRequiredAddressFields(address)) {
      // Se uno dei campi è vuoto, resetta lat/lon
      this.addressForm.get('latitude')?.setValue(null);
      this.addressForm.get('longitude')?.setValue(null);
      this.cdr.markForCheck();
      return;
    }

    // Altrimenti chiama il servizio per aggiornare le coordinate
    const fullAddress = composeFullAddress(address);

    // Aggiungi un debounce per evitare troppe chiamate
    this.geocodingService
      .getCoordinatesFromAddress(fullAddress)
      .pipe(
        take(1),
        finalize(() => this.cdr.markForCheck()),
      )
      .subscribe({
        next: (coords) => {
          if (coords?.lat && coords?.lon) {
            this.addressForm.patchValue(
              {
                latitude: coords.lat,
                longitude: coords.lon,
              },
              { emitEvent: false },
            );
          } else {
            this.addressForm.patchValue(
              {
                latitude: null,
                longitude: null,
              },
              { emitEvent: false },
            );
          }
        },
        error: (err) => {
          this.addressForm.patchValue(
            {
              latitude: null,
              longitude: null,
            },
            { emitEvent: false },
          );
          showSnackBar(
            this.snackBar,
            'Unable to fetch coordinates from the address',
          );
        },
      });
  }

  /**
   * @description Loads all countries from the geocoding service, filters them,
   * and sets up autocomplete for the country field.
   */
  getCountries() {
    this.geocodingService.getCountries().subscribe({
      next: (countries: any[]) => {
        this.allCountries = countries.filter(
          (c) => c.region && c.region !== '' && c.population > 100000,
        );

        // Crea array di stringhe combinate tipo "🇮🇹 Italy"
        this.countries = this.allCountries.map((c) => {
          const emoji = countryCodeToEmoji(c.cca2);
          const name = c.name.common;
          return `${emoji} ${name}`;
        });

        this.filteredCountries = this.addressForm.controls[
          'country'
        ].valueChanges.pipe(
          startWith(''),
          map((value) => filterCountriesArray(this.countries, value || '')),
        );
        this.cdr.markForCheck();
      },
      error: (err) => {
        showSnackBar(this.snackBar, 'Country loading error');
      },
    });
  }

  /**
   * @description Fetches city data for the currently selected country and updates the city autocomplete.
   */
  getCountryDetails() {
    if (!this.countryName) return;
    this.geocodingService.getCities(this.countryName).subscribe({
      next: (response: CountryResponse) => {
        if (response.data && Array.isArray(response.data)) {
          this.cities = response.data;
          // Inizializza filteredCities con valueChanges
          this.filteredCities = this.addressForm.controls[
            'city'
          ].valueChanges.pipe(
            startWith(''),
            map((value) => filterCitiesArray(this.cities, value || '')),
          );
        } else {
          this.cities = [];
          this.filteredCities = of([]);
          showSnackBar(this.snackBar, 'Invalid data format');
        }
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.cities = [];
        this.filteredCities = of([]);
        showSnackBar(this.snackBar, 'Error loading city');
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * @description Fetches region and province data for the currently selected country
   * and updates the respective autocomplete and form validators.
   */
  getStatesDetails() {
    if (!this.countryName) return;
    this.geocodingService.getStates(this.countryName).subscribe({
      next: (response: CountryStatesResponse) => {
        if (response?.data?.states && response.data.states.length > 0) {
          const allStates = response.data.states;

          const filtered =
            this.countryName === 'italy'
              ? filterItalianStates(allStates)
              : allStates.map((state) => state.name);

          this.regions = of(filtered);
          this.allRegions = filtered;

          const provinceCodes = extractProvinceCodes(allStates);
          this.filteredProvinces = of(provinceCodes);
          this.allProvinces = provinceCodes;

          // ← ha province → abilita e rende required
          if (provinceCodes.length > 0) {
            this.addressForm.get('province')?.enable({ emitEvent: false });
            this.addressForm
              .get('province')
              ?.setValidators([Validators.required]);
          } else {
            // ← ha stati/regioni ma non province
            this.addressForm.get('province')?.disable({ emitEvent: false });
            this.addressForm.get('province')?.clearValidators();
            this.addressForm
              .get('province')
              ?.setValue('', { emitEvent: false });
          }
        } else {
          this.regions = of([]);
          this.allRegions = [];
          this.filteredProvinces = of([]);
          this.allProvinces = [];

          // ← nessuno stato → disabilita tutto e rimuovi required
          this.addressForm.get('province')?.disable({ emitEvent: false });
          this.addressForm.get('province')?.clearValidators();
          this.addressForm.get('province')?.setValue('', { emitEvent: false });
        }

        this.addressForm
          .get('province')
          ?.updateValueAndValidity({ emitEvent: false });
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.regions = of([]);
        this.filteredProvinces = of([]);
        this.addressForm.get('province')?.disable({ emitEvent: false });
        this.addressForm.get('province')?.clearValidators();
        this.addressForm
          .get('province')
          ?.updateValueAndValidity({ emitEvent: false });
        this.cdr.markForCheck();
        showSnackBar(this.snackBar, 'Error loading region');
      },
    });
  }

  /**
   * @param {MatAutocompleteSelectedEvent | string} event - Selection event or string from patchValue.
   * @description Handles user selection of a country, normalizes the country name,
   * and triggers fetching of related states and cities.
   */
  onCountrySelected(event: MatAutocompleteSelectedEvent | string): void {
    let selectedCountry: string;

    if (typeof event === 'string') {
      // Caso in cui il paese viene impostato tramite patchValue
      selectedCountry = event;
    } else {
      // Caso normale di selezione dall'autocomplete
      selectedCountry = event.option.value;
    }

    if (selectedCountry) {
      // Estrai solo il nome del paese (senza emoji) se necessario
      const countryName = extractCountryName(selectedCountry);
      this.countryName = countryName.toLowerCase();
      this.getCountryDetails();
      this.getStatesDetails();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Autocomplete Display
  // ─────────────────────────────────────────────────────────────

  /**
   * @param {string} country - The country string from the form.
   * @returns {string} Display-friendly version of the country name.
   */
  displayCountry(country: string): string {
    return country || '';
  }

  /**
   * @param {string} region - The region string from the form.
   * @returns {string} Display-friendly version of the region name.
   */
  displayRegion(region: string): string {
    return region || '';
  }

  /**
   * @param {string} city - The city string from the form.
   * @returns {string} Display-friendly version of the city name.
   */
  displayCity(city: string): string {
    return city || '';
  }

  /**
   * @param {string} province - The province string from the form.
   * @returns {string} Display-friendly version of the province name.
   */
  displayProvince(province: string): string {
    return province || '';
  }

  // ─────────────────────────────────────────────────────────────
  // Category
  // ─────────────────────────────────────────────────────────────

  /**
   * @description Maps the current `category` input to a normalized advertisement type
   * and patches it to the advertisementForm.
   */
  setAdvertisementTypeFromCategory() {
    if (!this.advertisementForm) {
      return;
    }

    if (this.category) {
      const normalizedValue = getCategoryTypeFromMap(
        this.category,
        normalizationMap,
      );

      if (normalizedValue) {
        this.categoryNormalizzeTypeAdvertisement = normalizedValue;

        this.advertisementForm.patchValue({
          type: this.categoryNormalizzeTypeAdvertisement,
        });
      } else {
        this.categoryNormalizzeTypeAdvertisement = '';
      }
    }
  }

  /**
   * @description Converts the input category to a normalized API path format
   * and loads the category data from the backend.
   */
  loadCategoryByNormalizedPath() {
    if (this.category) {
      let databaseLink = this.category;

      // Se il category arriva nel formato "advertisement_electronics_tv"
      if (this.category.includes('_')) {
        // Converto da "advertisement_electronics_tv" a "marketplace/electronics/tv"
        databaseLink = this.category
          .replace(/^advertisement_/, 'marketplace/') // Sostituisci "advertisement_" con "marketplace/"
          .replace(/_/g, '/'); // Sostituisci tutti gli _ con /
      }
      // Se il category arriva nel formato "advertisement/electronics/tv"
      else if (this.category.toLowerCase().startsWith('advertisement/')) {
        // Converto da "advertisement/electronics/tv" a "marketplace/electronics/tv"
        databaseLink = this.category
          .toLowerCase()
          .replace('advertisement/', 'marketplace/');
      }
      // Se arriva già nel formato corretto "marketplace/electronics/tv"
      else if (this.category.startsWith('marketplace/')) {
        databaseLink = this.category;
      } else {
      }

      this.categoryNormalizzeGetIdCategory = databaseLink;

      this.loadCategoryByLink(this.categoryNormalizzeGetIdCategory);
    } else {
    }

    console.groupEnd();
  }

  /**
   * @param {string} link - Normalized category API path.
   * @description Fetches category data from the backend using the provided link and updates `sendCategory`.
   */
  loadCategoryByLink(link: string): void {
    this.isLoadingSubject.next(true);

    this.categoryService
      .getCategoryByLink(link)
      .pipe(
        tap((category: CategoryDTO) => {
          this.sendCategory = category;
        }),
        catchError((err: HttpErrorResponse) => {
          showSnackBar(this.snackBar, 'Error loading category by link');
          return throwError(() => err);
        }),
        finalize(() => {
          this.isLoadingSubject.next(false);
          this.cdr.markForCheck();
        }),
      )
      .subscribe();
  }

  // ─────────────────────────────────────────────────────────────
  // Images
  // ─────────────────────────────────────────────────────────────

  /**
   * @param event - The file input change event.
   * @description Handles file selection, filters duplicates, updates `selectedFiles`,
   * and shows snackBar notifications for ignored duplicates.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      const { filteredFiles, rejectedFiles } = filterNewFiles(
        this.selectedFiles,
        newFiles,
        this.maxImages,
      );

      // Mostra messaggi per i file duplicati (rejectedFiles)
      rejectedFiles.forEach((file) => {
        showSnackBar(this.snackBar, `Duplicate file ignored: ${file.name}`);
      });

      this.selectedFiles = [...this.selectedFiles, ...filteredFiles];

      input.value = '';
    }
  }

  /**
   * @param index - Index of the image in `selectedFiles` array to remove.
   * @description Removes a selected image from the list and triggers change detection.
   */
  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.cdr.markForCheck();
  }

  // ─────────────────────────────────────────────────────────────
  // Input Validation Utils
  // ─────────────────────────────────────────────────────────────

  /**
   * @description Wrapper for `blockInvalidAndTooHigh` to prevent invalid number input or values exceeding the max.
   * Used in templates.
   */
  blockInvalidAndTooHigh = blockInvalidAndTooHigh;

  /**
   * @description Wrapper for `blockInvalidPaste` to prevent pasting invalid number values.
   * Used in templates.
   */
  blockInvalidPaste = blockInvalidPaste;

  /**
   * @description Wrapper for `blockInvalidAndTooHighPrice` to prevent invalid decimal/price input or values exceeding the maximum.
   * Used in templates.
   */
  blockInvalidAndTooHighPrice = blockInvalidAndTooHighPrice;

  /**
   * @description Wrapper for `blockInvalidPastePrice` to prevent pasting invalid decimal/price values.
   * Used in templates.
   */
  blockInvalidPastePrice = blockInvalidPastePrice;

  /**
   * @description Wrapper for `blockOnlyNumbers` to allow only numeric input.
   * Used in templates.
   */
  blockOnlyNumbers = blockOnlyNumbers;

  /**
   * @description Wrapper for `blockPasteNumbers` to allow only numeric input when pasting.
   * Used in templates.
   */
  blockPasteNumbers = blockPasteNumbers;

  // ─────────────────────────────────────────────────────────────
  // Submit & Reset
  // ─────────────────────────────────────────────────────────────

  /**
   * @description Validates all forms, ensures at least one image is uploaded, prepares DTOs,
   * and sends the data to the advertisement service.
   * Handles success and error states with snackBar notifications.
   */
  onSubmit(): void {
    if (!this.userId) {
      showSnackBar(this.snackBar, 'User not authenticated');
      return;
    }

    if (
      !validateAllForms(
        this.advertisementForm,
        this.productForm,
        this.addressForm,
      )
    ) {
      markAllFormsTouched(
        this.advertisementForm,
        this.productForm,
        this.addressForm,
      );
      showSnackBar(this.snackBar, 'Please correct the errors in the form');
      return;
    }

    if (this.selectedFiles.length === 0) {
      this.isSubmitting = true;
      showSnackBar(this.snackBar, 'At least one image must be uploaded');
      return;
    }

    this.isSubmitting = true;
    this.isLoadingSubject.next(true);

    // Ottieni i valori dei form includendo i campi disabilitati
    const advertisementData = this.advertisementForm.getRawValue();
    const productData = this.productForm.getRawValue();
    const addressData = this.addressForm.getRawValue();

    const advertisementDTO: AdvertisementDTO = {
      title: advertisementData.title,
      description: advertisementData.description,
      status: advertisementData.status,
      createdAt: advertisementData.createdAt,
      type: advertisementData.type,
      agency: advertisementData.agency,
      agencyName: advertisementData.agencyName,
      agencyFeePercent: advertisementData.agencyFeePercent,
      agencyUrl: advertisementData.agencyUrl,
      active: advertisementData.active,
    };

    const productDTO: ProductDTO = {
      price: productData.price,
      condition: productData.condition,
      stockQuantity: productData.stockQuantity,
      active: productData.active,
    };

    const addressDTO: AddressDTO = {
      street: addressData.street,
      streetNumber: addressData.streetNumber,
      province: addressData.province,
      region: addressData.region,
      zipCode: addressData.zipCode,
      city: addressData.city,
      country: addressData.country,
      latitude: addressData.latitude,
      longitude: addressData.longitude,
      active: addressData.active,
    };

    this.advertisementService
      .createAdvertisement(
        advertisementDTO,
        productDTO,
        addressDTO,
        this.sendCategory,
        this.selectedFiles,
        this.userId,
      )
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.isLoadingSubject.next(false);
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          showSnackBar(this.snackBar, 'Advertisement created successfully');
          this.resetForm();
        },
        error: (error: HttpErrorResponse) => {
          showSnackBar(
            this.snackBar,
            'Error during the creation of the advertisement',
          );
        },
      });
  }

  /**
   * @description Resets all forms, clears selected images, disables agency fields,
   * reinitializes listeners, and updates UI state for reset operations.
   */
  resetForm(): void {
    this.isResetting = true;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.addressChangesSub?.unsubscribe();
      this.advertisementForm.patchValue({
        title: '',
        description: '',
        agency: false,
        agencyName: '',
        agencyFeePercent: null,
        agencyUrl: '',
      });

      resetFormFields(this.advertisementForm, [
        'title',
        'description',
        'agency',
        'agencyName',
        'agencyFeePercent',
        'agencyUrl',
      ]);

      this.disableAgencyFields();

      this.productForm.patchValue({
        price: null,
        condition: 'NEW',
        stockQuantity: 1,
      });

      resetFormFields(this.productForm, [
        'price',
        'condition',
        'stockQuantity',
      ]);

      this.addressForm.patchValue({
        street: '',
        streetNumber: '',
        province: '',
        region: '',
        zipCode: '',
        city: '',
        country: '',
        latitude: null,
        longitude: null,
      });

      resetFormFields(this.addressForm, [
        'street',
        'streetNumber',
        'province',
        'region',
        'zipCode',
        'city',
        'country',
        'latitude',
        'longitude',
      ]);

      this.selectedFiles = [];
      this.formsModified = false;

      this.setupAddressListeners();

      this.isResetting = false;
      this.cdr.markForCheck();

      showSnackBar(this.snackBar, 'Form reset successfully');
    }, 500);
  }

  // ─────────────────────────────────────────────────────────────
  // Button State & Actions
  // ─────────────────────────────────────────────────────────────

  /**
   * @returns {boolean} True if the reset button should be enabled based on form state.
   */
  isResetButtonEnabled(): boolean {
    if (this.isResetting || this.isSubmitting) {
      return false;
    }
    return this.formsModified || this.selectedFiles.length > 0;
  }

  /**
   * @returns {boolean} True if all forms are valid and at least one image is selected.
   */
  isCreateButtonEnabled(): boolean {
    if (this.isSubmitting || this.isResetting) {
      return false;
    }
    const advertisementValid = this.advertisementForm.valid;
    const productValid = this.productForm.valid;
    const addressValid = this.addressForm.valid;
    const hasImages = this.selectedFiles.length > 0;
    return advertisementValid && productValid && addressValid && hasImages;
  }

  /**
   * @description Returns the action configuration array for the form layout component.
   */
  get formActions(): ModalAction[] {
    return [
      {
        id: 'reset',
        label: this.isResetting ? 'Resetting...' : 'Reset',
        type: 'danger-outline',
        disabled: !this.isResetButtonEnabled(),
        loading: this.isResetting,
      },
      {
        id: 'create',
        label: this.isSubmitting ? 'Creating...' : 'Create',
        type: 'primary',
        disabled: !this.isCreateButtonEnabled(),
        loading: this.isSubmitting,
      },
    ];
  }

  /**
   * @description Shows a confirmation modal before resetting the form.
   */
  confirmReset(): void {
    Swal.fire({
      title: 'Reset form?',
      text: 'All entered data will be lost',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        this.resetForm();
      }
    });
  }

  /**
   * @description Shows a confirmation modal before submitting the advertisement creation.
   */
  confirmCreate(): void {
    if (!this.isCreateButtonEnabled()) {
      showSnackBar(this.snackBar, 'Please correct the errors in the form');
      return;
    }

    Swal.fire({
      title: 'Create advertisement?',
      text: 'The advertisement will be published',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Create',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.onSubmit();
      }
    });
  }

  /**
   * @param actionId - Identifier of the action triggered (reset or create).
   * @description Handles top-level form action buttons by triggering the corresponding confirm dialog.
   */
  onFormAction(actionId: string): void {
    switch (actionId) {
      case 'reset':
        this.confirmReset();
        break;

      case 'create':
        this.confirmCreate();
        break;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Timer
  // ─────────────────────────────────────────────────────────────

  /**
   * @description Sets up a timer that updates the advertisement `createdAt` field every minute
   * to reflect the current local date and time.
   * Runs outside Angular to reduce change detection cycles.
   */
  incrementTime() {
    this.ngZone.runOutsideAngular(() => {
      this.timerSubscription = timer(getMillisToNextMinute(), 60000).subscribe(
        () => {
          this.ngZone.run(() => {
            const control = this.advertisementForm.get('createdAt');
            if (!control) return;
            control.enable({ emitEvent: false });
            control.setValue(formatLocalDateTime(new Date()), {
              emitEvent: false,
            });
            control.disable({ emitEvent: false });
            this.cdr.detectChanges();
          });
        },
      );
    });
  }
}
