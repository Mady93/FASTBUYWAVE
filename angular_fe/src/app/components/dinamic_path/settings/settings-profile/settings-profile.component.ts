import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormLayoutComponent, ModalAction } from 'my-lib-inside';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  delay,
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
  timeout,
} from 'rxjs';
import { ProfileService } from 'src/app/services/path/profile/profile.service';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GeocodingService } from 'src/app/services/geo/geocoding.service';
import {
  enableFormFields,
  markAllFormsTouched,
  resetAndDisableFormFields,
  validateAllForms,
} from 'src/app/utils/form-utils';
import { ProfileDTO } from 'src/app/interfaces/dtos/profile_dto.interface';
import { AddressDTO } from 'src/app/interfaces/dtos/adress_dto.interface';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { LanguageCurrencyUtils } from 'src/app/utils/languages-curency-utils';
import { ValidationPatterns } from 'src/app/utils/validators-pattern-utils';
import { arrayNotEmptyValidator } from 'src/app/utils/arrayNotEmptyValidator';
import {
  convertAssetToDataURL,
  detectMimeType,
} from 'src/app/utils/file-utils';
import { HttpErrorResponse } from '@angular/common/http';
import { SafeUrlPipe } from 'src/app/pipes/shared/pipes/safe-url.pipe';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import {
  countryCodeToEmoji,
  extractCountryName,
  filterCitiesArray,
  filterCountriesArray,
} from 'src/app/utils/country.utils';
import { CountryResponse } from 'src/app/interfaces/country/country_response';
import { CountryStatesResponse } from 'src/app/interfaces/country/countryStatesResponse';
import { showSnackBar } from 'src/app/utils/snackbar.utils';
import {
  composeFullAddress,
  extractProvinceCodes,
  filterItalianStates,
  hasAllRequiredAddressFields,
} from 'src/app/utils/geocoding.utils';
import { Router } from '@angular/router';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import { EMPTY } from 'rxjs';
import Swal from 'sweetalert2';

/**
 * @category Components
 *
 * @description
 * Handles the user profile settings page. This component:
 * - Manages reactive forms for user profile and address information.
 * - Supports both "create" and "edit" modes for the profile.
 * - Fetches existing profile data and populates the forms.
 * - Handles profile image upload, removal, and reset to default.
 * - Integrates with geocoding services to automatically update latitude and longitude.
 * - Enables/disables Submit and Reset buttons based on form changes and validity.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 */
@Component({
  selector: 'app-settings-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    SafeUrlPipe,
    FormsModule,
    MatAutocompleteModule,
    MatInputModule,
    FormLayoutComponent,
  ],
  templateUrl: './settings-profile.component.html',
  styleUrl: './settings-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsProfileComponent implements OnInit, OnDestroy {
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
   * @property spinner
   * @description Path to loading spinner image.
   * @whatitis - Local image asset path string
   * @howused - Used by getspinner() to return spinner image
   */
  spinner = '/t.png';

  /**
   * @method getspinner
   * @description Returns the spinner image path.
   * @whatitis - Getter function for spinner property
   * @howused - Used in template or other logic to show spinner
   * @returns {Function}
   */
  getspinner: Function = (): string => this.spinner;

  /**
   * @property isLoadingSubject
   * @description Tracks loading state for async operations.
   * @whatitis - BehaviorSubject<boolean>
   * @howused - Used internally to expose isLoading$ observable
   */
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  /**
   * @property isLoading$
   * @description Observable exposing current loading state.
   * @whatitis - Observable<boolean>
   * @howused - Can be subscribed in template with async pipe for spinner
   */
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  /**
   * @method isLoading
   * @description Getter returning current loading value.
   * @whatitis - Function returning boolean
   * @howused - Used to check loading synchronously in logic
   */
  get isLoading(): Function {
    return () => this.isLoadingSubject.value;
  }

  /**
   * @property destroy$
   * @description Signals component teardown for subscriptions.
   * @whatitis - Subject<void>
   * @howused - Used with takeUntil to auto-unsubscribe
   */
  private destroy$ = new Subject<void>();

  /**
   * @property addressChangesSub
   * @description Subscription tracking address form changes.
   * @whatitis - Subscription | undefined
   * @howused - Used to unsubscribe on destroy or reset
   */
  private addressChangesSub?: Subscription;

  /**
   * @property imageRemovedManually
   * @description Tracks if user manually removed profile image.
   * @whatitis - boolean
   * @howused - Controls whether default image should be restored
   */
  imageRemovedManually: boolean = false;

  /**
   * @property imgDefault
   * @description Default profile image path.
   * @whatitis - string
   * @howused - Used when resetting or loading default image
   */
  imgDefault = '/logo11.png';

  /**
   * @property addressForm
   * @description FormGroup for user address.
   * @whatitis - FormGroup
   * @howused - Bound to template fields for address input
   */
  addressForm!: FormGroup;

  /**
   * @property selectedFile
   * @description File object for uploaded profile image.
   * @whatitis - File | null
   * @howused - Used in submit logic to send image to backend
   */
  selectedFile: File | null = null;

  /**
   * @property profileForm
   * @description FormGroup for user profile details.
   * @whatitis - FormGroup
   * @howused - Bound to template fields for profile input
   */
  profileForm!: FormGroup;

  /**
   * @property userTypes
   * @description Allowed user types.
   * @whatitis - Readonly array of 'Buyer' | 'Seller' | 'Both'
   * @howused - Populates select/dropdown in template
   */
  readonly userTypes = ['Buyer', 'Seller', 'Both'] as const;

  /**
   * @property countries
   * @description Array of country names with emoji.
   * @whatitis - string[]
   * @howused - Used for autocomplete and selection in address form
   */
  countries: string[] = [];

  /**
   * @property filteredCountries
   * @description Observable of filtered countries based on input.
   * @whatitis - Observable<string[]>
   * @howused - Used in template autocomplete pipe
   */
  filteredCountries: Observable<string[]> = of([]);

  /**
   * @property allCountries
   * @description Full array of country objects from geocoding service.
   * @whatitis - any[]
   * @howused - Used internally to filter countries
   */
  allCountries: any[] = [];

  /**
   * @property countryName
   * @description Selected country lowercase name for service queries.
   * @whatitis - string | undefined
   * @howused - Used to fetch cities and states
   */
  countryName: any;

  /**
   * @property countryCode
   * @description Selected country code.
   * @whatitis - any
   * @howused - Optional, used for display/emoji conversion
   */
  countryCode: any;

  /**
   * @property cities
   * @description List of cities for selected country.
   * @whatitis - string[]
   * @howused - Used in autocomplete for city selection
   */
  cities: string[] = [];

  /**
   * @property filteredCities
   * @description Filtered cities observable based on input.
   * @whatitis - Observable<string[]>
   * @howused - Used in template autocomplete for city field
   */
  filteredCities: Observable<string[]> = of([]);

  /**
   * @property regions
   * @description Observable list of regions/states.
   * @whatitis - Observable<string[]>
   * @howused - Bound to region autocomplete in template
   */
  regions: Observable<string[]> = of([]);

  /**
   * @property filteredProvinces
   * @description Observable list of filtered provinces.
   * @whatitis - Observable<string[]>
   * @howused - Bound to province autocomplete in template
   */
  filteredProvinces: Observable<string[]> = of([]);

  /**
   * @property allRegions
   * @description Complete list of regions for selected country.
   * @whatitis - string[]
   * @howused - Internal filtering and autocomplete logic
   */
  allRegions: string[] = [];

  /**
   * @property allProvinces
   * @description Complete list of provinces for selected country.
   * @whatitis - string[]
   * @howused - Internal filtering and autocomplete logic
   */
  allProvinces: string[] = [];

  /**
   * @property genders
   * @description Allowed gender options.
   * @whatitis - Readonly array 'Male' | 'Female'
   * @howused - Populates select in profile form
   */
  readonly genders = ['Male', 'Female'] as const;

  /**
   * @property languages
   * @description List of language codes.
   * @whatitis - string[]
   * @howused - Populates select/dropdown for language preference
   */
  languages = LanguageCurrencyUtils.getLanguageCodes();

  /**
   * @property currencies
   * @description List of currency codes.
   * @whatitis - string[]
   * @howused - Populates select/dropdown for currency preference
   */
  currencies = LanguageCurrencyUtils.getCurrencyCodes();

  /**
   * @property notificationOptions
   * @description Options for notification preferences.
   * @whatitis - string[]
   * @howused - Bound to checkbox group in template
   */
  notificationOptions = ['email', 'sms', 'push'];

  /**
   * @property privacyOptions
   * @description Options for privacy settings.
   * @whatitis - string[]
   * @howused - Bound to radio buttons in template
   */
  privacyOptions = ['visible', 'friends only', 'anonymous'];

  /**
   * @property isSubmitting
   * @description Tracks submit state for form.
   * @whatitis - boolean
   * @howused - Disables buttons and shows spinner during submit
   */
  isSubmitting = false;

  /**
   * @property userId
   * @description Logged-in user ID.
   * @whatitis - number | null
   * @howused - Used to fetch and update profile
   */
  userId: number | null = null;

  /**
   * @property isEditMode
   * @description Flag indicating if editing existing profile.
   * @whatitis - boolean
   * @howused - Controls whether form is in create or update mode
   */
  isEditMode: boolean = false;

  /**
   * @property existingProfile
   * @description Stores fetched profile data for editing.
   * @whatitis - ProfileDTO | null
   * @howused - Used to populate form and compare changes
   */
  existingProfile: ProfileDTO | null = null;

  /**
   * @property profileId
   * @description Current profile ID (if editing).
   * @whatitis - number | null
   * @howused - Used in update requests
   */
  profileId: number | null = null;

  /**
   * @property isResetting
   * @description Flag tracking reset operation in progress.
   * @whatitis - boolean
   * @howused - Disables buttons and shows spinner during reset
   */
  isResetting = false;

  /**
   * @property initialProfileValues
   * @description Snapshot of initial profile form values.
   * @whatitis - any
   * @howused - Used to detect changes for update
   */
  private initialProfileValues: any = null;

  /**
   * @property initialAddressValues
   * @description Snapshot of initial address form values.
   * @whatitis - any
   * @howused - Used to detect changes for update
   */
  private initialAddressValues: any = null;

  /**
   * @property formsModified
   * @description True if user modified any form fields.
   * @whatitis - boolean
   * @howused - Used to enable/disable submit/reset buttons
   */
  private formsModified = false;

  /**
   * @property formsHaveValues
   * @description True if any form has values (for create mode).
   * @whatitis - boolean
   * @howused - Used to enable/disable submit/reset buttons
   */
  private formsHaveValues = false;

  /**
   * @description Angular FormBuilder service for creating and managing reactive forms.
   */
  private fb = inject(FormBuilder);

  /**
   * @description Service to manage user profile data, including retrieval and updates.
   */
  private profileService = inject(ProfileService);

  /**
   * @description ChangeDetectorRef allows manual triggering of Angular change detection.
   */
  private cdRef = inject(ChangeDetectorRef);

  /**
   * @description Angular Material MatSnackBar service for displaying popup notifications.
   */
  private snackBar = inject(MatSnackBar);

  /**
   * @description Service to handle geocoding operations, converting addresses to coordinates and vice versa.
   */
  private geocodingService = inject(GeocodingService);

  /**
   * @description Current platform identifier, e.g., 'browser' or 'server'. Useful for platform-specific logic.
   */
  private platformId = inject(PLATFORM_ID);

  /**
   * @description Angular Router service for navigating between application routes.
   */
  private router = inject(Router);

  /**
   * @description Service handling authentication with Google, including registration, login, logout, and retrieving user info.
   */
  private authService = inject(AuthGoogleService);

  /**
   * @description Angular NgZone service for running code inside or outside Angular zone to optimize change detection.
   */
  private ngZone = inject(NgZone);

  /**
   * @inheritdoc
   * @method ngOnInit
   * @description Lifecycle hook called once the component is initialized.
   * @whatitis - Initializes forms, fetches countries and states, subscribes to value changes, and gets current user ID.
   * @howused - Angular automatically calls this on component creation.
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initForm();
      this.getCountries();
      this.getStatesDetails();
      this.getCountryDetails();
      this.initCountryValueChanges();
      this.getCurrentUserId();
    }
  }

  /**
   * @method getCurrentUserId
   * @description Retrieves the current user ID using multiple strategies: direct info, JWT, or observable.
   * @whatitis - Private helper function returning void.
   * @howused - Called on init to set this.userId and continue initialization.
   */
  private getCurrentUserId(): void {
    const userInfo = this.authService.getCurrentUserInfo();
    if (userInfo && userInfo.userId) {
      this.userId = this.parseUserIdToNumber(userInfo.userId);
      this.initializeAfterUserId();
      return;
    }

    const token = this.authService.getAccessToken();
    if (token) {
      try {
        const payload = this.decodeJwtManually(token);
        const userIdFromToken =
          payload.sub || payload.user_id || payload.id || payload.userId;

        if (userIdFromToken) {
          this.userId = this.parseUserIdToNumber(userIdFromToken);
          this.initializeAfterUserId();
          return;
        }
      } catch (error) {}
    }

    const userInfoWithTimeout$ = this.authService.userInfo$.pipe(
      filter((userInfo) => userInfo !== null && !!userInfo.userId),
      take(1),
      timeout(3000),
      catchError((error) => {
        this.handleAuthError();
        return EMPTY;
      }),
    );

    userInfoWithTimeout$.subscribe({
      next: (userInfo) => {
        this.userId = this.parseUserIdToNumber(userInfo!.userId);
        this.initializeAfterUserId();
      },
      error: (error) => {
        this.handleAuthError();
      },
    });
  }

  /**
   * @method parseUserIdToNumber
   * @description Converts a userId from string/other type to number.
   * @param userIdValue - The input userId to parse.
   * @returns number | null
   * @howused - Used internally after retrieving userId to ensure numeric format.
   */
  private parseUserIdToNumber(userIdValue: any): number | null {
    if (typeof userIdValue === 'number') {
      return userIdValue;
    }

    if (typeof userIdValue === 'string') {
      const parsed = parseInt(userIdValue, 10);
      return isNaN(parsed) ? null : parsed;
    }

    return null;
  }

  /**
   * @method decodeJwtManually
   * @description Decodes a JWT string manually without external libraries.
   * @param token - JWT string to decode.
   * @returns any - Decoded payload object.
   * @howused - Used internally if userId needs extraction from JWT.
   */
  private decodeJwtManually(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Formato JWT non valido');
      }

      let payload = parts[1];
      payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const pad = payload.length % 4;
      if (pad) {
        payload += '='.repeat(4 - pad);
      }

      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @method initializeAfterUserId
   * @description Initializes profile data once userId is available.
   * @whatitis - Private helper.
   * @howused - Called after getCurrentUserId() resolves userId.
   */
  private initializeAfterUserId(): void {
    if (!this.userId) {
      this.handleAuthError();
      return;
    }

    this.checkExistingProfile();
  }

  /**
   * @method handleAuthError
   * @description Handles errors in authentication (userId missing).
   * @whatitis - Private helper to show snack bar and redirect to login.
   * @howused - Called whenever userId is invalid or not retrieved.
   */
  private handleAuthError(): void {
    this.ngZone.run(() => {
      showSnackBar(this.snackBar, 'Authentication error. Please login again.');
      this.router.navigate(['/login']);
    });
  }

  /**
   * @method initCountryValueChanges
   * @description Subscribes to country field changes to enable/disable dependent address fields.
   * @whatitis - Private helper function.
   * @howused - Called on ngOnInit to automatically update address controls.
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
   * @method initForm
   * @description Initializes both profileForm and addressForm and sets up listeners.
   * @whatitis - Private helper function.
   * @howused - Called on ngOnInit to prepare forms and change detection.
   */
  private initForm(): void {
    this.initProfileForm();
    this.initAddressForm();
    this.setupAddressListeners();
    this.setupFormChangeDetection();
  }

  /**
   * @method initProfileForm
   * @description Initializes profileForm with all required validators and default values.
   * @whatitis - Private helper function.
   * @howused - Called inside initForm().
   */
  private initProfileForm(): void {
    this.profileForm = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.pattern(ValidationPatterns.namePattern),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.pattern(ValidationPatterns.namePattern),
        ],
      ],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(ValidationPatterns.phoneNumberPattern),
        ],
      ],
      profilePicture: [''],
      userType: ['Buyer'],
      securityQuestion: ['', [Validators.required]],
      securityAnswer: ['', [Validators.required]],
      newsletterSubscription: [false],
      preferredLanguage: ['it', [Validators.required]],
      currency: ['EUR', [Validators.required]],
      active: [true],
      notificationPreferences: [['email'], [arrayNotEmptyValidator]],
      privacySettings: [['visible'], [arrayNotEmptyValidator]],
    });
  }

  /**
   * @method initAddressForm
   * @description Initializes addressForm with validators and sets up reactive listeners for province/region filters.
   * @whatitis - Private helper function.
   * @howused - Called inside initForm().
   */
  private initAddressForm(): void {
    this.addressForm = this.fb.group(
      {
        street: ['', Validators.required],
        streetNumber: ['', Validators.required],
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

    this.addressForm
      .get('region')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((val: string) => {
        const query = val?.toLowerCase() ?? '';
        const filteredRegions = this.allRegions.filter((r) =>
          r.toLowerCase().includes(query),
        );
        this.regions = of(filteredRegions);
      });

    this.addressForm
      .get('province')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((val: string) => {
        const query = val?.toLowerCase() ?? '';
        const filteredProvinces = this.allProvinces.filter((p) =>
          p.toLowerCase().includes(query),
        );
        this.filteredProvinces = of(filteredProvinces);
      });
  }

  /**
   * @method setupFormChangeDetection
   * @description Watches profileForm and addressForm for changes to update internal flags.
   * @whatitis - Private helper function.
   * @howused - Called after forms are initialized.
   */
  private setupFormChangeDetection(): void {
    this.saveInitialFormValues();
    merge(this.profileForm.valueChanges, this.addressForm.valueChanges)
      .pipe(takeUntil(this.destroy$), debounceTime(100))
      .subscribe(() => {
        this.checkFormsState();
      });
  }

  /**
   * @method saveInitialFormValues
   * @description Saves snapshot of profileForm and addressForm values for change detection.
   * @whatitis - Private helper function.
   * @howused - Called after populating or resetting forms.
   */
  private saveInitialFormValues(): void {
    this.initialProfileValues = JSON.parse(
      JSON.stringify(this.profileForm.getRawValue()),
    );
    this.initialAddressValues = JSON.parse(
      JSON.stringify(this.addressForm.getRawValue()),
    );
  }

  /**
   * @method checkFormsState
   * @description Updates flags formsModified and formsHaveValues based on current form values.
   * @whatitis - Private helper function.
   * @howused - Used internally to enable/disable buttons dynamically.
   */
  private checkFormsState(): void {
    this.formsHaveValues = this.hasAnyValue();
    this.formsModified = this.hasFormsChanged();
    this.cdRef.markForCheck();
  }

  /**
   * @method hasAnyValue
   * @description Checks if at least one input in profileForm or addressForm has a user-provided value.
   * @returns boolean
   * @howused - Used for create mode to enable submit/reset buttons.
   */
  private hasAnyValue(): boolean {
    const profileValues = this.profileForm.getRawValue();
    const addressValues = this.addressForm.getRawValue();

    const excludeProfile = [
      'userType',
      'newsletterSubscription',
      'preferredLanguage',
      'currency',
      'active',
      'notificationPreferences',
      'privacySettings',
    ];
    const excludeAddress = ['active', 'latitude', 'longitude'];

    const hasProfileValue = Object.keys(profileValues).some((key) => {
      if (excludeProfile.includes(key)) return false;
      const value = profileValues[key];
      return value !== null && value !== undefined && value !== '';
    });

    const hasAddressValue = Object.keys(addressValues).some((key) => {
      if (excludeAddress.includes(key)) return false;
      const value = addressValues[key];
      return value !== null && value !== undefined && value !== '';
    });

    return hasProfileValue || hasAddressValue;
  }

  /**
   * @method hasFormsChanged
   * @description Checks if current form values differ from initial snapshots.
   * @returns boolean
   * @howused - Used for edit mode to enable submit/reset buttons.
   */
  private hasFormsChanged(): boolean {
    if (!this.initialProfileValues || !this.initialAddressValues) {
      return false;
    }

    const currentProfile = this.profileForm.getRawValue();
    const currentAddress = this.addressForm.getRawValue();

    const profileChanged =
      JSON.stringify(currentProfile) !==
      JSON.stringify(this.initialProfileValues);

    const addressChanged =
      JSON.stringify(currentAddress) !==
      JSON.stringify(this.initialAddressValues);

    return profileChanged || addressChanged;
  }

  /**
   * @getter isResetButtonEnabled
   * @description Determines if the reset button should be active.
   * @returns boolean
   * @howused - Used in template to enable/disable reset button.
   */
  get isResetButtonEnabled(): boolean {
    if (this.isResetting || this.isSubmitting) {
      return false;
    }

    if (this.isEditMode) {
      return this.formsModified;
    } else {
      return this.formsHaveValues;
    }
  }

  /**
   * @getter isSubmitButtonEnabled
   * @description Determines if the submit (create/update) button should be active.
   * @returns boolean
   * @howused - Used in template to enable/disable submit button.
   */
  get isSubmitButtonEnabled(): boolean {
    if (this.isSubmitting || this.isResetting) {
      return false;
    }

    const formsValid = this.profileForm.valid && this.addressForm.valid;

    if (this.isEditMode) {
      return this.formsModified && formsValid;
    } else {
      return formsValid;
    }
  }

  /**
   * @method checkExistingProfile
   * @description Fetches the profile for current userId and populates the form if exists.
   * @whatitis - Private method interacting with ProfileService.
   * @howused - Called after userId is retrieved to set edit/create mode.
   */
  private checkExistingProfile(): void {
    if (!this.userId) {
      this.handleAuthError();
      return;
    }

    this.isLoadingSubject.next(true);

    this.profileService
      .getProfileByUserId(this.userId)
      .pipe(
        take(1),
        finalize(() => {
          this.isLoadingSubject.next(false);
          this.cdRef.markForCheck();
        }),
      )
      .subscribe({
        next: (profile) => {
          if (profile) {
            this.isEditMode = true;
            this.existingProfile = profile;
            this.profileId = profile.profileId || null;
            this.populateFormsWithExistingData(profile);
            showSnackBar(
              this.snackBar,
              'Profile loaded - you can now edit your information',
            );
          } else {
            this.isEditMode = false;
            showSnackBar(
              this.snackBar,
              'Welcome! Create your profile to get started',
            );
          }
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 404) {
            this.isEditMode = false;
            showSnackBar(
              this.snackBar,
              'Welcome! Create your profile to access all features',
            );
          } else {
            showSnackBar(
              this.snackBar,
              'Unable to load profile data - please try again',
            );
            this.isEditMode = false;
          }
        },
      });
  }

  /**
   * @method populateFormsWithExistingData
   * @description Fills profileForm and addressForm with data from an existing profile.
   * @param profile - ProfileDTO object fetched from server.
   * @howused - Called from checkExistingProfile() when editing.
   */
  private populateFormsWithExistingData(profile: ProfileDTO): void {
    this.addressChangesSub?.unsubscribe();
    let profilePictureValue = '';

    if (profile.profilePicture) {
      if (typeof profile.profilePicture === 'string') {
        const base64 = profile.profilePicture as string;
        const mimeType = detectMimeType(base64.slice(0, 10));
        profilePictureValue = `data:${mimeType};base64,${base64}`;
      } else if (
        Array.isArray(profile.profilePicture) &&
        profile.profilePicture.length > 0
      ) {
        profilePictureValue = this.byteArrayToBase64(profile.profilePicture);
      } else {
        showSnackBar(this.snackBar, 'Unsupported image type');
      }
    }

    this.profileForm.patchValue({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      dateOfBirth: profile.dateOfBirth || '',
      gender: profile.gender || '',
      phoneNumber: profile.phoneNumber || '',
      profilePicture: profilePictureValue,
      userType: profile.userType || 'Buyer',
      securityQuestion: profile.securityQuestion || '',
      securityAnswer: profile.securityAnswer || '',
      newsletterSubscription: profile.newsletterSubscription || false,
      preferredLanguage: profile.preferredLanguage || 'it',
      currency: profile.currency || 'EUR',
      active: profile.active !== undefined ? profile.active : true,
      notificationPreferences: profile.notificationPreferences || ['email'],
      privacySettings: profile.privacySettings || ['visible'],
    });

    if (profile.address) {
      const countryValue = this.getCountryDisplayValue(profile.address.country);

      this.addressForm.patchValue({
        street: profile.address.street || '',
        streetNumber: profile.address.streetNumber || '',
        province: profile.address.province || '',
        region: profile.address.region || '',
        zipCode: profile.address.zipCode || '',
        city: profile.address.city || '',
        country: countryValue,
        latitude: profile.address.latitude || null,
        longitude: profile.address.longitude || null,
        active:
          profile.address.active !== undefined ? profile.address.active : true,
      });

      if (profile.address.country) {
        this.onCountrySelected(countryValue);
      }
    }

    this.saveInitialFormValues();
    this.setupAddressListeners();
    this.cdRef.markForCheck();
  }

  /**
   * @method getCountryDisplayValue
   * @description Returns formatted country name with emoji.
   * @param countryName - Name of the country.
   * @returns string - Country with emoji for display.
   * @howused - Used in form patching and autocomplete display.
   */
  private getCountryDisplayValue(countryName: string): string {
    if (!countryName) return '';

    const country = this.allCountries.find(
      (c) => c.name.common.toLowerCase() === countryName.toLowerCase(),
    );

    if (country) {
      const emoji = countryCodeToEmoji(country.cca2);
      return `${emoji} ${country.name.common}`;
    }

    return countryName;
  }

  /**
   * @method setupAddressListeners
   * @description Subscribes to address field changes to trigger geocoding.
   * @whatitis - Private helper for reactive coordinates updates.
   * @howused - Called on form initialization and after reset.
   */
  private setupAddressListeners(): void {
    this.addressChangesSub?.unsubscribe();

    const controls = [
      this.addressForm.get('street')!,
      this.addressForm.get('streetNumber')!,
      this.addressForm.get('province')!,
      this.addressForm.get('region')!,
      this.addressForm.get('zipCode')!,
      this.addressForm.get('city')!,
      this.addressForm.get('country')!,
    ];

    this.addressChangesSub = merge(...controls.map((c) => c.valueChanges))
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(() => {
        this.tryUpdateCoordinates();
      });
  }

  /**
   * @method tryUpdateCoordinates
   * @description Updates latitude and longitude based on address form values using GeocodingService.
   * @whatitis - Private async operation.
   * @howused - Triggered automatically on address form changes.
   */
  tryUpdateCoordinates(): void {
    this.addressForm.updateValueAndValidity({
      onlySelf: false,
      emitEvent: true,
    });
    const address = this.addressForm.value;

    if (!hasAllRequiredAddressFields(address)) {
      this.addressForm.patchValue(
        {
          latitude: null,
          longitude: null,
        },
        { emitEvent: false },
      );
      this.cdRef.markForCheck();
      return;
    }

    const fullAddress = composeFullAddress(address);

    this.geocodingService
      .getCoordinatesFromAddress(fullAddress)
      .pipe(
        take(1),
        timeout(5000),
        catchError((error) => {
          return of(null);
        }),
        finalize(() => this.cdRef.markForCheck()),
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
   * @method getCountries
   * @description Fetches countries from GeocodingService and sets up autocomplete.
   * @whatitis - Private helper.
   * @howused - Called on ngOnInit.
   */
  getCountries() {
    this.geocodingService
      .getCountries()
      .pipe(
        take(1),
        finalize(() => this.cdRef.markForCheck()),
      )
      .subscribe({
        next: (countries: any[]) => {
          this.allCountries = countries.filter(
            (c) => c.region && c.region !== '' && c.population > 100000,
          );

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
        },
        error: (err) => {
          showSnackBar(this.snackBar, 'Country loading error');
        },
      });
  }

  /**
   * @method displayCountry
   * @description Returns string for country display in autocomplete.
   * @param country - Country string.
   * @returns string
   */
  displayCountry(country: string): string {
    return country || '';
  }

  /**
   * @method displayRegion
   * @description Returns string for region display in autocomplete.
   * @param region - Region string.
   * @returns string
   */
  displayRegion(region: string): string {
    return region || '';
  }

  /**
   * @method displayCity
   * @description Returns string for city display in autocomplete.
   * @param city - City string.
   * @returns string
   */
  displayCity(city: string): string {
    return city || '';
  }

  /**
   * @method displayProvince
   * @description Returns string for province display in autocomplete.
   * @param province - Province string.
   * @returns string
   */
  displayProvince(province: string): string {
    return province || '';
  }

  /**
   * @method onCountrySelected
   * @description Handles country selection from autocomplete and fetches relevant states/cities.
   * @param event - MatAutocompleteSelectedEvent or string.
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

  /**
   * @method getCountryDetails
   * @description Fetches city list for current country and sets filteredCities observable.
   */
  getCountryDetails() {
    if (!this.countryName) return;

    this.geocodingService
      .getCities(this.countryName)
      .pipe(
        take(1),
        finalize(() => this.cdRef.markForCheck()),
      )
      .subscribe({
        next: (response: CountryResponse) => {
          if (response.data && Array.isArray(response.data)) {
            this.cities = response.data;
            this.filteredCities = this.addressForm.controls[
              'city'
            ].valueChanges.pipe(
              startWith(''),
              map((value) => filterCitiesArray(this.cities, value || '')),
            );
          } else {
            this.cities = [];
            this.filteredCities = of([]);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.cities = [];
          this.filteredCities = of([]);
        },
      });
  }

  /**
   * @method getStatesDetails
   * @description Fetches states/regions for current country and sets filteredProvinces observable.
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

          if (provinceCodes.length > 0) {
            this.addressForm.get('province')?.enable({ emitEvent: false });
            this.addressForm
              .get('province')
              ?.setValidators([Validators.required]);
          } else {
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

          this.addressForm.get('province')?.disable({ emitEvent: false });
          this.addressForm.get('province')?.clearValidators();
          this.addressForm.get('province')?.setValue('', { emitEvent: false });
        }

        this.addressForm
          .get('province')
          ?.updateValueAndValidity({ emitEvent: false });
        this.cdRef.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.regions = of([]);
        this.filteredProvinces = of([]);
        this.addressForm.get('province')?.disable({ emitEvent: false });
        this.addressForm.get('province')?.clearValidators();
        this.addressForm
          .get('province')
          ?.updateValueAndValidity({ emitEvent: false });
        this.cdRef.markForCheck();
        showSnackBar(this.snackBar, 'Error loading region');
      },
    });
  }

  /**
   * @inheritdoc
   * @method ngOnDestroy
   * @description Lifecycle hook called once the component is destroyed.
   * @whatitis - Completes all subscriptions and cleans up resources.
   * @howused - Angular automatically calls this on component destruction.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.addressChangesSub?.unsubscribe();
    this.isLoadingSubject.complete();
  }

  /**
   * @method loadDefaultImage
   * @description Loads default profile image as File object.
   * @returns Promise<File>
   */
  private async loadDefaultImage(): Promise<File> {
    try {
      const currentValue = this.profileForm.get('profilePicture')?.value;

      if (currentValue && currentValue.startsWith('data:')) {
        return await this.dataURLtoFile(currentValue, 'profile.png');
      }

      const defaultImageDataURL = await convertAssetToDataURL(this.imgDefault);
      this.profileForm.patchValue({
        profilePicture: defaultImageDataURL,
      });

      return await this.dataURLtoFile(defaultImageDataURL, 'default.png');
    } catch (error) {
      showSnackBar(this.snackBar, 'Error loading default image');
      return new File([], 'empty.png', { type: 'image/png' });
    }
  }

  /**
   * @method maybeSetDefaultImage
   * @description Sets default image in profileForm if none exists or removed manually.
   */
  private async maybeSetDefaultImage(): Promise<void> {
    const currentValue = this.profileForm.get('profilePicture')?.value;

    if (!currentValue || currentValue === '' || this.imageRemovedManually) {
      try {
        const defaultImageDataURL = await convertAssetToDataURL(
          this.imgDefault,
        );
        this.profileForm.patchValue({
          profilePicture: defaultImageDataURL,
        });
      } catch (error) {
        showSnackBar(this.snackBar, 'Error setting default image');
        this.profileForm.patchValue({
          profilePicture: '',
        });
      }
    }
  }

  /**
   * @method dataURLtoFile
   * @description Converts DataURL string to File object.
   * @param dataUrl - DataURL string
   * @param filename - File name
   * @returns Promise<File>
   */
  private async dataURLtoFile(
    dataUrl: string,
    filename: string,
  ): Promise<File> {
    const res: Response = await fetch(dataUrl);
    const blob: Blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
  }

  /**
   * @method onSubmit
   * @description Handles create/update of profile, validates forms, confirms with user, sends data to backend.
   */
  async onSubmit(): Promise<void> {
    if (!this.userId) {
      showSnackBar(this.snackBar, 'Authentication error. Please login again.');
      return;
    }

    if (!validateAllForms(this.profileForm, this.addressForm)) {
      markAllFormsTouched(this.profileForm, this.addressForm);
      showSnackBar(this.snackBar, 'Please correct the errors in the form');
      return;
    }

    const actionText = this.isEditMode ? 'update' : 'create';
    const result = await Swal.fire({
      title: `Are you sure you want to ${actionText} your profile?`,
      text: this.isEditMode
        ? 'Your existing profile data will be updated.'
        : 'This will create a new profile.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionText}`,
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) {
      return;
    }

    this.isSubmitting = true;
    this.isLoadingSubject.next(true);

    try {
      await this.maybeSetDefaultImage();

      let profilePictureFile: File | null = null;
      const currentImage = this.profileForm.get('profilePicture')?.value;

      if (this.selectedFile) {
        profilePictureFile = this.selectedFile;
      } else if (
        currentImage &&
        typeof currentImage === 'string' &&
        currentImage.startsWith('data:')
      ) {
        profilePictureFile = await this.dataURLtoFile(
          currentImage,
          'profile_picture.png',
        );
      } else {
        profilePictureFile = await this.loadDefaultImage();
      }

      const profileData = this.prepareProfileData();
      const addressData = this.prepareAddressData();

      const serviceCall = this.isEditMode
        ? this.profileService.updateProfile(
            this.userId,
            profileData,
            addressData,
            profilePictureFile,
          )
        : this.profileService.createProfile(
            profileData,
            addressData,
            this.userId,
            profilePictureFile,
          );

      serviceCall
        .pipe(
          take(1),
          finalize(() => {
            this.isSubmitting = false;
            this.isLoadingSubject.next(false);
            this.imageRemovedManually = false;
            this.cdRef.markForCheck();
          }),
        )
        .subscribe({
          next: (result) => this.handleSuccess(result),
          error: (error) => this.handleError(error),
        });
    } catch (error) {
      this.handleFileError(error);
    }
  }

  /**
   * @method byteArrayToBase64
   * @description Converts byte array to base64 string with MIME detection.
   * @param byteArray - Array of numbers.
   * @returns string
   */
  private byteArrayToBase64(byteArray: number[]): string {
    if (!byteArray || byteArray.length === 0) return '';

    try {
      const uint8Array = new Uint8Array(byteArray);
      let mimeType = 'image/jpeg';

      if (
        uint8Array.length >= 8 &&
        uint8Array[0] === 0x89 &&
        uint8Array[1] === 0x50 &&
        uint8Array[2] === 0x4e &&
        uint8Array[3] === 0x47
      ) {
        mimeType = 'image/png';
      } else if (
        uint8Array.length >= 12 &&
        uint8Array[0] === 0x52 &&
        uint8Array[1] === 0x49 &&
        uint8Array[2] === 0x46 &&
        uint8Array[3] === 0x46 &&
        uint8Array[8] === 0x57 &&
        uint8Array[9] === 0x45 &&
        uint8Array[10] === 0x42 &&
        uint8Array[11] === 0x50
      ) {
        mimeType = 'image/webp';
      }

      let binary = '';
      const len = uint8Array.length;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }

      return `data:${mimeType};base64,${window.btoa(binary)}`;
    } catch (error) {
      showSnackBar(this.snackBar, 'Error converting byte array to base64');
      return '';
    }
  }

  /**
   * @method prepareProfileData
   * @description Extracts and returns profile data from profileForm for service calls.
   * @returns ProfileDTO
   */
  private prepareProfileData(): ProfileDTO {
    const profileData = this.profileForm.getRawValue();

    return {
      profileId: this.isEditMode ? this.profileId! : undefined,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      dateOfBirth: profileData.dateOfBirth,
      gender: profileData.gender,
      phoneNumber: profileData.phoneNumber,
      userType: profileData.userType,
      securityQuestion: profileData.securityQuestion,
      securityAnswer: profileData.securityAnswer,
      newsletterSubscription: profileData.newsletterSubscription,
      preferredLanguage: profileData.preferredLanguage,
      currency: profileData.currency,
      active: profileData.active,
      notificationPreferences: profileData.notificationPreferences,
      privacySettings: profileData.privacySettings,
      rating: this.existingProfile?.rating,
      totalSales: this.existingProfile?.totalSales,
      totalPurchases: this.existingProfile?.totalPurchases,
      wishlist: this.existingProfile?.wishlist,
    };
  }

  /**
   * @method prepareAddressData
   * @description Extracts and returns address data from addressForm for service calls.
   * @returns AddressDTO
   */
  private prepareAddressData(): AddressDTO {
    const addressData = this.addressForm.getRawValue();

    return {
      addressId:
        this.isEditMode && this.existingProfile?.address
          ? this.existingProfile.address.addressId
          : undefined,
      street: addressData.street,
      streetNumber: addressData.streetNumber,
      city: addressData.city,
      province: addressData.province,
      region: addressData.region,
      country: addressData.country,
      zipCode: addressData.zipCode,
      latitude: addressData.latitude,
      longitude: addressData.longitude,
      active: addressData.active,
    };
  }

  /**
   * @method handleSuccess
   * @description Handles successful profile creation/update.
   * @param result - ProfileDTO returned from backend
   */
  private handleSuccess(result: ProfileDTO): void {
    const successMessage = this.isEditMode
      ? 'Profile updated successfully'
      : 'Profile created successfully';
    showSnackBar(this.snackBar, successMessage);
    this.imageRemovedManually = false;
    this.selectedFile = null;
    this.existingProfile = result;
    this.profileId = result.profileId || null;

    const wasCreateMode = !this.isEditMode;

    if (!this.isEditMode) {
      this.isEditMode = true;
    }

    this.profileService.notifyProfileUpdated(result);

    if (wasCreateMode) {
      setTimeout(() => {
        this.ngZone.run(() => {
          this.router.navigate(['/dashboard']);
        });
      }, 500);
    } else {
      this.checkExistingProfile();
    }
  }

  /**
   * @method handleError
   * @description Handles errors from profile service.
   * @param error - Error object
   */
  private handleError(error: any): void {
    const errorMessage = this.isEditMode
      ? 'Error updating profile'
      : 'Error creating profile';
    showSnackBar(this.snackBar, errorMessage);
  }

  /**
   * @method handleFileError
   * @description Handles errors related to profile image file processing.
   * @param error - Error object
   */
  private handleFileError(error: any): void {
    this.isSubmitting = false;
    this.isLoadingSubject.next(false);
    showSnackBar(this.snackBar, 'Failed to process image file');
  }

  /**
   * @method resetForm
   * @description Resets profileForm and addressForm to initial or default values.
   */
  resetForm(): void {
    if (!this.isResetButtonEnabled) return;

    Swal.fire({
      title: 'Do you want to reset the form?',
      text: 'All changes will be lost!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isResetting = true;
        this.addressChangesSub?.unsubscribe();
        this.imageRemovedManually = false;
        this.selectedFile = null;

        of(null)
          .pipe(
            delay(100),
            tap(() => {
              if (this.isEditMode && this.existingProfile) {
                this.populateFormsWithExistingData(this.existingProfile);
              } else {
                this.resetToDefaultValues();
              }

              this.saveInitialFormValues();
              this.formsModified = false;
              this.formsHaveValues = false;
              this.cdRef.markForCheck();
              this.setupAddressListeners();
            }),
          )
          .subscribe({
            next: () => {
              this.isResetting = false;
            },
            error: () => {
              this.isResetting = false;
            },
          });
      }
    });
  }

  /**
   * @method resetToDefaultValues
   * @description Resets forms to default initial values (used in create mode).
   */
  private resetToDefaultValues(): void {
    this.profileForm.reset({
      userType: 'Buyer',
      newsletterSubscription: false,
      preferredLanguage: 'it',
      currency: 'EUR',
      active: true,
      notificationPreferences: ['email'],
      privacySettings: ['visible'],
    });

    this.addressForm.reset({
      active: true,
    });

    showSnackBar(this.snackBar, 'Form has been reset');
  }

  /**
   * @method handleFileInput
   * @description Handles user file input for profile image with validation.
   * @param event - Input event from file selector
   */
  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();

      const allowedExtensions = ['png', 'webp', 'jpeg', 'jpg'];
      if (!ext || !allowedExtensions.includes(ext)) {
        showSnackBar(this.snackBar, 'Only PNG, WebP or JPEG files are allowed');
        this.cdRef.markForCheck();
        return;
      }

      if (!file.type.startsWith('image/')) {
        showSnackBar(this.snackBar, 'Please select a valid image file');
        this.cdRef.markForCheck();
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showSnackBar(this.snackBar, 'The image must not exceed 5MB');
        this.cdRef.markForCheck();
        return;
      }

      this.selectedFile = file;
      this.imageRemovedManually = false;

      const reader = new FileReader();
      const img = new Image();

      reader.onload = () => {
        img.onload = () => {
          this.ngZone.run(() => {
            this.profileForm.patchValue({
              profilePicture: reader.result,
            });
            this.cdRef.markForCheck();
          });
        };
        img.src = reader.result as string;
      };

      reader.onerror = () => {
        this.ngZone.run(() => {
          showSnackBar(this.snackBar, 'Error reading the image file');
          this.cdRef.markForCheck();
        });
      };

      reader.readAsDataURL(file);
    }
  }

  /**
   * @method removeProfileImage
   * @description Removes current profile image and sets default.
   */
  removeProfileImage(): void {
    try {
      const defaultImageDataURL = convertAssetToDataURL(this.imgDefault);

      Promise.resolve(defaultImageDataURL).then((dataUrl) => {
        this.ngZone.run(() => {
          this.profileForm.patchValue({
            profilePicture: dataUrl,
          });

          this.selectedFile = null;
          this.imageRemovedManually = true;
          this.cdRef.detectChanges();
          showSnackBar(
            this.snackBar,
            'Profile image has been removed. Add a new one, or a default image will be used',
          );
        });
      });
    } catch (error) {
      this.ngZone.run(() => {
        showSnackBar(this.snackBar, 'Error removing profile image');
        this.profileForm.patchValue({
          profilePicture: '',
        });
      });
    }
  }

  /**
   * @method togglePrivacySetting
   * @description Toggles privacy setting in profileForm.
   * @param selectedOption - Option to set
   */
  togglePrivacySetting(selectedOption: string): void {
    const control = this.profileForm.get('privacySettings');
    control?.setValue([selectedOption]);
    control?.markAsTouched();
    control?.updateValueAndValidity();
  }

  /**
   * @method toggleNotification
   * @description Toggles notification preference checkbox.
   * @param option - Notification option to toggle
   */
  toggleNotification(option: string): void {
    const control = this.profileForm.get('notificationPreferences');
    const currentSelections = control?.value || [];

    if (currentSelections.includes(option)) {
      control?.setValue(
        currentSelections.filter((item: string) => item !== option),
      );
    } else {
      control?.setValue([...currentSelections, option]);
    }

    control?.markAsTouched();
    control?.updateValueAndValidity();
  }

  /**
   * @getter selectedCurrencySymbol
   * @description Returns the symbol for the selected currency.
   * @returns string
   */
  get selectedCurrencySymbol(): string {
    const code = this.profileForm?.get('currency')?.value;
    return LanguageCurrencyUtils.getCurrencySymbol(code);
  }

  /**
   * @getter formTitle
   * @description Returns dynamic title string based on edit/create mode.
   * @returns string
   */
  get formTitle(): string {
    return this.isEditMode
      ? 'You can update your profile at any time. Your product details in ads will be updated automatically'
      : 'Create a profile to showcase your products and reach your target audience with personalized content and ads.';
  }

  /**
   * @getter formSubtitle
   * @description Returns dynamic subtitle string based on edit/create mode.
   * @returns string
   */
  get formSubtitle(): string {
    return this.isEditMode
      ? 'Modify your profile information'
      : 'Enter all details to create a complete profile';
  }

  /**
   * @getter submitButtonText
   * @description Returns dynamic text for submit button based on mode.
   * @returns string
   */
  get submitButtonText(): string {
    return this.isEditMode ? 'Update' : 'Create';
  }

  /**
   * @getter formActions
   * @description Returns array of modal actions for buttons with dynamic loading/disabled state.
   * @returns ModalAction[]
   */
  get formActions(): ModalAction[] {
    return [
      {
        id: 'reset',
        label: this.isResetting ? 'Resetting...' : 'Reset',
        type: 'danger-outline',
        disabled: !this.isResetButtonEnabled,
        loading: this.isResetting,
      },
      {
        id: 'submit',
        label: this.isSubmitting
          ? this.isEditMode
            ? 'Updating...'
            : 'Creating...'
          : this.submitButtonText,
        type: 'primary',
        disabled: !this.isSubmitButtonEnabled,
        loading: this.isSubmitting,
      },
    ];
  }

  /**
   * @method onFormAction
   * @description Handles clicks on form action buttons (reset or submit).
   * @param actionId - ID of the action triggered
   */
  onFormAction(actionId: string): void {
    switch (actionId) {
      case 'reset':
        this.resetForm();
        break;
      case 'submit':
        this.onSubmit();
        break;
    }
  }
}
