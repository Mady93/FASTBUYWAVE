import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { AdvertisementItem, ModalAction, ModalComponent } from 'my-lib-inside';
import { ProductDTO } from 'src/app/interfaces/dtos/product_dto.interface';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { showSnackBar } from 'src/app/utils/snackbar.utils';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ValidationPatterns } from 'src/app/utils/validators-pattern-utils';
import Swal from 'sweetalert2';
import { ContactMethod } from 'src/app/interfaces/dtos/contact/contactMethod.enum';
import { CreateContactRequestPayload } from 'src/app/interfaces/dtos/contact/createContactRequestPayload.interface';

// OpenLayers imports
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon } from 'ol/style';
import Overlay from 'ol/Overlay';

import { Subject } from 'rxjs/internal/Subject';
import { HttpClient } from '@angular/common/http';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { firstValueFrom, of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
  buildNominatimUrl,
  combineDateTime,
  CONTACT_FORM_DEFAULTS,
  dateRangeValidatorFn,
  formatAddressForPopup,
  getFieldError,
  hasFormChanges,
  nominatimDisplayFn,
  NominatimResult,
  resetFormFields,
} from 'src/app/utils/components-utils/send-message-dialog.utils';
import { ContactRequestService } from 'src/app/services/path/contact/contact-request/contact-request.service';

/**
 * @category Dialogs
 *
 * @description
 * Dialog component that allows a user to contact a seller about a product advertisement.
 * Supports Email, Phone, WhatsApp, and Meeting contact modes.
 * Handles reactive form setup, validation, map integration (OpenLayers + Nominatim),
 * and sending contact requests.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Component({
  selector: 'app-send-message-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDatepickerModule,
    MatChipsModule,
    MatAutocompleteModule,
    ModalComponent,
  ],
  templateUrl: './send-message-dialog.component.html',
  styleUrl: './send-message-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendMessageDialogComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  // ───────────────────────────────────────────── Map container ─────────────────────────────────────────────

  /** @description Internal reference to the native map container element. */
  private _mapContainer?: ElementRef<HTMLDivElement>;

  /**
   * @description Setter triggered by Angular whenever the `#mapContainer` template
   * reference enters or leaves the DOM (controlled by `*ngIf="isMeetingMode()"`).
   *
   * - When `el` is defined and the map has not yet been created,
   *   initialises the OpenLayers map after a short delay.
   * - When `el` is `undefined` (element removed), disposes the map
   *   and cleans up the `ResizeObserver` to prevent memory leaks.
   */
  @ViewChild('mapContainer')
  set mapContainer(el: ElementRef<HTMLDivElement> | undefined) {
    this._mapContainer = el;

    if (el && !this.map) {
      setTimeout(() => {
        this.initializeMap();
        const observer = new ResizeObserver(() => this.forceMapResize());
        observer.observe(el.nativeElement);
        (this as any).resizeObserver = observer;
      }, 200);
    }

    if (!el && this.map) {
      if ((this as any).resizeObserver) {
        (this as any).resizeObserver.disconnect();
        (this as any).resizeObserver = null;
      }
      this.map.setTarget(undefined);
      this.map.dispose();
      this.map = undefined;
      this.vectorLayer = undefined;
      this.markerFeature = undefined;
    }
  }

  // ───────────────────────────────────────────── Signals ─────────────────────────────────────────────

  /** @description `true` while the form submission HTTP request is in flight. */
  isSubmitting = signal(false);

  /** `true` during the animated reset sequence. */
  isResetting = signal(false);

  /**
   * @description `true` when the user has changed at least one field from its
   * default value. Controls the enabled state of the Reset button.
   */
  isFormFilled = signal(false);

  /**
   * @description `true` when `preferredContactMethod === ContactMethod.MEETING`.
   * Drives the visibility of the meeting-specific form sections.
   */
  isMeetingMode = signal(false);

  /** @description `true` while the Nominatim address search HTTP request is pending. */
  isLoadingAddresses = signal(false);

  /** @description Current list of Nominatim address suggestions for the autocomplete. */
  addressSuggestions = signal<NominatimResult[]>([]);

  /** @description The Nominatim result the user has selected from the autocomplete. */
  selectedPlace = signal<NominatimResult | null>(null);

  /**
   * @description `true` once the user has picked a valid address from the
   * Nominatim autocomplete. Used to gate form submission and to show
   * the map marker.
   */
  isAddressValid = signal(false);

  // ───────────────────────────────────────────── Form ─────────────────────────────────────────────

  /** @description The main reactive form group. Initialised in {@link setupForm}. */
  contactForm!: FormGroup;

  // ───────────────────────────────────────────── Date bounds ─────────────────────────────────────────────

  /** @description Minimum selectable date for the datepicker (today). */
  minDate = new Date();

  /** @description Maximum selectable date for the datepicker (today + 12 months). */
  maxDate = new Date();

  // ───────────────────────────────────────────── Static data ─────────────────────────────────────────────

  /** @description Predefined time options rendered as quick-select chips. */
  suggestedTimes = ['09:00', '11:00', '13:00', '15:00', '17:00'];

  /** @description Predefined duration options rendered as quick-select chips. */
  suggestedDurations = [
    { label: '30 min', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '1.5 hours', value: 90 },
    { label: '2 hours', value: 120 },
  ];

  /** @description Available contact method options rendered in the `<mat-select>`. */
  contactMethods = [
    { value: ContactMethod.EMAIL, label: 'Email Response', icon: 'email' },
    { value: ContactMethod.PHONE, label: 'Phone Call', icon: 'phone' },
    { value: ContactMethod.WHATSAPP, label: 'WhatsApp/SMS', icon: 'chat' },
    { value: ContactMethod.MEETING, label: 'In-person Meeting', icon: 'event' },
  ];

  /** @description Expose the enum to the template. */
  ContactMethod = ContactMethod;

  // ───────────────────────────────────────────── Map internals ─────────────────────────────────────────────

  /** @description The OpenLayers {@link Map} instance. `undefined` when not in meeting mode. */
  private map?: Map;

  /** @description Vector layer used to render the address marker. */
  private vectorLayer?: VectorLayer<VectorSource>;

  /** @description The currently displayed marker feature. */
  private markerFeature?: Feature;

  /** @description RxJS subject that debounces address search input before calling Nominatim. */
  private searchSubject = new Subject<string>();

  // ───────────────────────────────────────────── DI ─────────────────────────────────────────────

  /** @description Angular FormBuilder used to construct the reactive contact form. */
  private fb = inject(FormBuilder);

  /** @description Angular Material SnackBar service used for toast notifications. */
  private snackBar = inject(MatSnackBar);

  /** @description Service for creating contact requests to the backend API. */
  private contactRequestService = inject(ContactRequestService);

  /** @description Angular HttpClient used for HTTP requests (e.g., Nominatim geocoding). */
  private http = inject(HttpClient);

  /** @description Angular ChangeDetectorRef used to manually trigger change detection. */
  private cdr = inject(ChangeDetectorRef);

  // ───────────────────────────────────────────── Constructor ─────────────────────────────────────────────

  /**
   * @constructor
   * @description
   * Initializes the SendMessageDialogComponent.
   * - Sets the maximum selectable date for meeting appointments to 12 months from today.
   * - Injects Angular Material dialog reference and dialog data.
   *
   * @param dialogRef - Reference to the opened MatDialog instance, used to close the dialog.
   * @param data - Data injected into the dialog via MAT_DIALOG_DATA:
   *   - `ad`: The advertisement item being contacted.
   *   - `currentUserId`: ID of the currently logged-in user.
   *   - `product`: List of product DTOs associated with the ad.
   */
  constructor(
    public dialogRef: MatDialogRef<SendMessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      ad: AdvertisementItem;
      currentUserId: number;
      product: ProductDTO[];
    },
  ) {
    this.maxDate.setMonth(this.maxDate.getMonth() + 12);
  }

  // ───────────────────────────────────────────── Lifecycle ─────────────────────────────────────────────

  /**
   * @inheritdoc
   * @description
   * Angular lifecycle hook. Initializes the reactive form,
   * address search pipeline, and watches for form/contact method changes.
   */
  ngOnInit(): void {
    this.setupForm();
    this.setupAddressSearch();
    this.watchFormChanges();
    this.watchContactMethodChanges();
  }

  /**
   * @inheritdoc
   * @description
   * Angular lifecycle hook after the view has been initialized.
   * Currently unused.
   */
  ngAfterViewInit(): void {}

  /**
   * @inheritdoc
   * @description
   * Cleans up subscriptions, the ResizeObserver, and the OpenLayers map
   * when the component is destroyed to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.searchSubject.complete();

    if ((this as any).resizeObserver) {
      (this as any).resizeObserver.disconnect();
    }

    if (this.map) {
      this.map.setTarget(undefined);
      this.map.dispose();
    }
  }

  /**
   * @description
   * Configures map scroll behavior inside the modal, allowing smooth scroll
   * of the modal while maintaining zoom functionality on the map.
   */
  private setupMapScrollBehavior(): void {
    setTimeout(() => {
      if (!this.map) return;

      // 1. NASCONDI I BOTTONI DI ZOOM (opzionale)
      this.hideZoomButtons();

      // 2. CONFIGURA IL COMPORTAMENTO DI SCROLL
      const mapViewport =
        this._mapContainer?.nativeElement.querySelector('.ol-viewport');

      if (mapViewport) {
        // Variabile per tracciare se l'utente sta interagendo con la mappa
        let isInteractingWithMap = false;

        // Quando l'utente inizia a muovere la mappa (pan)
        mapViewport.addEventListener('mousedown', () => {
          isInteractingWithMap = true;
        });

        // Quando l'utente rilascia il mouse
        mapViewport.addEventListener('mouseup', () => {
          setTimeout(() => {
            isInteractingWithMap = false;
          }, 100);
        });

        // Quando il mouse esce dalla mappa
        mapViewport.addEventListener('mouseleave', () => {
          isInteractingWithMap = false;
        });

        // Gestione scroll
        mapViewport.addEventListener(
          'wheel',
          (event: Event) => {
            const wheelEvent = event as WheelEvent;
            const scrollContainer = document.querySelector('.dialog-content');

            if (!scrollContainer) return;

            // Se l'utente sta interagendo con la mappa (pan), lascia che la mappa gestisca tutto
            if (isInteractingWithMap) {
              return;
            }

            // Calcola la direzione dello scroll
            const isScrollingUp = wheelEvent.deltaY < 0;
            const isScrollingDown = wheelEvent.deltaY > 0;

            // Verifica se la modale può scrollare nella direzione desiderata
            const canScrollUp = scrollContainer.scrollTop > 0;
            const canScrollDown =
              scrollContainer.scrollTop <
              scrollContainer.scrollHeight - scrollContainer.clientHeight;

            // Se la modale può scrollare nella direzione dello scroll
            if (
              (isScrollingDown && canScrollDown) ||
              (isScrollingUp && canScrollUp)
            ) {
              // Scrolla la modale
              scrollContainer.scrollTop += wheelEvent.deltaY;
              wheelEvent.preventDefault();
              wheelEvent.stopPropagation();
            } else {
              // Se la modale non può più scrollare, permetti alla mappa di fare zoom
              // Ma solo se non è premuto CTRL (per evitare zoom involontari)
              if (!wheelEvent.ctrlKey && !wheelEvent.metaKey) {
                // Simula lo zoom della mappa (opzionale)
                const view = this.map?.getView();
                const zoom = view?.getZoom() || 0;
                if (isScrollingUp) {
                  view?.setZoom(zoom + 0.5);
                } else if (isScrollingDown) {
                  view?.setZoom(zoom - 0.5);
                }
                wheelEvent.preventDefault();
              }
            }
          },
          { passive: false },
        );
      }
    }, 500);
  }

  /**
   * @description
   * Hides OpenLayers zoom buttons.
   */
  private hideZoomButtons(): void {
    // Aspetta che i bottoni siano renderizzati
    setTimeout(() => {
      const zoomButtons = document.querySelectorAll('.ol-zoom');
      zoomButtons.forEach((btn) => {
        (btn as HTMLElement).style.display = 'none';
      });
    }, 300);
  }

  // ───────────────────────────────────────────── Form setup ─────────────────────────────────────────────

  /**
   * @description
   * Builds the reactive contact form with validators and conditional phone requirements.
   */
  private setupForm(): void {
    this.contactForm = this.fb.group({
      senderContactEmail: [
        CONTACT_FORM_DEFAULTS.senderContactEmail,
        [Validators.required, Validators.email, Validators.maxLength(100)],
      ],
      senderPhone: [
        CONTACT_FORM_DEFAULTS.senderPhone,
        [
          Validators.pattern(ValidationPatterns.phoneNumberPattern),
          Validators.maxLength(20),
        ],
      ],
      subject: [
        {
          value: this.data.ad.title
            ? `Interested in: ${this.data.ad.title}`.substring(0, 50)
            : '',
          disabled: true,
        },
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.minLength(5),
        ],
      ],
      message: [
        CONTACT_FORM_DEFAULTS.message,
        [
          Validators.required,
          Validators.maxLength(1000),
          Validators.minLength(10),
        ],
      ],
      preferredContactMethod: [ContactMethod.EMAIL, [Validators.required]],
      additionalNotes: [CONTACT_FORM_DEFAULTS.additionalNotes],
      // ───────────────────────────────────────────── Meeting-specific ─────────────────────────────────────────────
      appointmentDate: [CONTACT_FORM_DEFAULTS.appointmentDate],
      appointmentTime: [CONTACT_FORM_DEFAULTS.appointmentTime],
      durationMinutes: [CONTACT_FORM_DEFAULTS.durationMinutes],
      locationAddress: [CONTACT_FORM_DEFAULTS.locationAddress],
      locationNotes: [CONTACT_FORM_DEFAULTS.locationNotes],
    });

    // Make senderPhone required when the user chooses PHONE or WHATSAPP.
    this.contactForm
      .get('preferredContactMethod')
      ?.valueChanges.subscribe((method) => {
        const phoneControl = this.contactForm.get('senderPhone');
        const baseValidators = [
          Validators.pattern(ValidationPatterns.phoneNumberPattern),
          Validators.maxLength(20),
        ];

        phoneControl?.setValidators(
          method === ContactMethod.PHONE || method === ContactMethod.WHATSAPP
            ? [Validators.required, ...baseValidators]
            : baseValidators,
        );
        phoneControl?.updateValueAndValidity();
      });
  }

  /**
   * @description
   * Watches the form for changes to update the {@link isFormFilled} signal.
   */
  private watchFormChanges(): void {
    this.contactForm.valueChanges.subscribe(() => {
      this.isFormFilled.set(hasFormChanges(this.contactForm));
      this.cdr.markForCheck();
    });
  }

  /**
   * @description
   * Watches changes of `preferredContactMethod` to toggle meeting mode,
   * reset fields, clear map state, and update validators.
   */
  private watchContactMethodChanges(): void {
    this.contactForm
      .get('preferredContactMethod')
      ?.valueChanges.subscribe((method) => {
        const isMeeting = method === ContactMethod.MEETING;
        this.isMeetingMode.set(isMeeting);

        // Reset every editable field to its default value.
        resetFormFields(
          this.contactForm,
          [
            'senderContactEmail',
            'senderPhone',
            'message',
            'additionalNotes',
            'appointmentDate',
            'appointmentTime',
            'durationMinutes',
            'locationAddress',
            'locationNotes',
          ],
          (field) =>
            (CONTACT_FORM_DEFAULTS as Record<string, unknown>)[field] ?? '',
        );

        // Clear map/address state.
        this.selectedPlace.set(null);
        this.isAddressValid.set(false);
        this.addressSuggestions.set([]);
        this.vectorLayer?.getSource()?.clear();

        this.isFormFilled.set(false);
        this.updateMeetingFieldsValidators(isMeeting);
        this.cdr.markForCheck();
      });
  }

  /**
   * @description
   * Sets up debounced Nominatim address search via {@link searchSubject}.
   * Ignores queries shorter than 3 characters.
   */
  private updateMeetingFieldsValidators(required: boolean): void {
    const meetingFields = [
      'appointmentDate',
      'appointmentTime',
      'durationMinutes',
      'locationAddress',
    ];

    meetingFields.forEach((fieldName) => {
      const control = this.contactForm.get(fieldName);

      if (required) {
        if (fieldName === 'durationMinutes') {
          control?.setValidators([
            Validators.required,
            Validators.min(15),
            Validators.max(480),
          ]);
        } else if (fieldName === 'appointmentDate') {
          control?.setValidators([
            Validators.required,
            dateRangeValidatorFn(this.minDate, this.maxDate),
          ]);
        } else if (fieldName === 'appointmentTime') {
          control?.setValidators([
            Validators.required,
            Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
          ]);
        } else {
          control?.setValidators([Validators.required]);
        }
      } else {
        control?.clearValidators();
      }

      control?.updateValueAndValidity();
    });
  }

  // ───────────────────────────────────────────── Address search ─────────────────────────────────────────────
  /**
   * @description Sets up the debounced Nominatim address search pipeline.
   *
   * Keystrokes are pushed into {@link searchSubject}; after 500 ms of
   * inactivity a request is made. Short queries (<3 chars) are
   * short-circuited without a network call.
   */
  private setupAddressSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query || query.length < 3) {
            this.addressSuggestions.set([]);
            return of([]);
          }
          return this.searchAddress(query);
        }),
      )
      .subscribe({
        next: (results) => {
          this.addressSuggestions.set(results);
          this.isLoadingAddresses.set(false);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error searching address:', error);
          this.addressSuggestions.set([]);
          this.isLoadingAddresses.set(false);
          this.cdr.markForCheck();
        },
      });
  }

  /**
   * @description
   * Performs a Nominatim geocoding request for a given query.
   * @param query - Free-text address.
   * @returns A promise resolving to an array of {@link NominatimResult}.
   */
  private searchAddress(query: string): Promise<NominatimResult[]> {
    return firstValueFrom(
      this.http.get<NominatimResult[]>(buildNominatimUrl(query), {
        headers: { 'User-Agent': 'MeetingSchedulerApp/1.0' },
      }),
    );
  }

  // ───────────────────────────────────────────── Map ─────────────────────────────────────────────

  /**
   * @description
   * Initializes the OpenLayers map inside the `_mapContainer`.
   * Centers on Rome by default and adds tile and vector layers.
   * Guards against double initialization.
   */
  private initializeMap(): void {
    if (!this._mapContainer) {
      console.warn('Map container not found');
      return;
    }
    if (this.map) {
      console.warn('Map already initialized');
      return;
    }

    try {
      const container = this._mapContainer.nativeElement;
      container.style.height = '250px';
      container.style.width = '100%';
      container.style.display = 'block';

      const markerStyle = new Style({
        image: new Icon({
          src:
            'data:image/svg+xml;utf8,' +
            encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#d32f2f" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="9" r="4" fill="white"/>
            </svg>
          `),
          scale: 1.5,
          anchor: [0.5, 1],
        }),
      });

      const vectorSource = new VectorSource();
      this.vectorLayer = new VectorLayer({
        source: vectorSource,
        style: markerStyle,
      });

      this.map = new Map({
        target: container,
        layers: [new TileLayer({ source: new OSM() }), this.vectorLayer],
        view: new View({
          center: fromLonLat([12.4964, 41.9028]), // Default: Rome
          zoom: 6,
          maxZoom: 19,
          minZoom: 3,
        }),
      });

      console.log('Map initialized successfully');
      this.setupMapScrollBehavior();
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  /**
   * @description
   * Forces the OpenLayers map to recalculate size after layout changes.
   */
  private forceMapResize(): void {
    if (this.map) {
      setTimeout(() => {
        this.map?.updateSize();
        this.map?.renderSync();
      }, 150);
    }
  }

  // ───────────────────────────────────────────── Template helpers ─────────────────────────────────────────────

  /**
   * @description
   * Returns full name of the advertisement owner, defaults to `'the seller'`.
   */
  get fullName(): string {
    const profile = this.data.ad?.profile;
    if (!profile) return 'the seller';
    const full = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
    return full || 'the seller';
  }

  /**
   * @description
   * Returns a validation error message for the given form field.
   * @param fieldName - Form control name.
   */
  getFieldError(fieldName: string): string {
    return getFieldError(this.contactForm.get(fieldName), fieldName);
  }

  /**
   * @description
   * Converts a {@link NominatimResult} or string into a displayable label.
   * Used for autocomplete `[displayWith]`.
   * @param result - Nominatim result or string.
   */
  displayFn(result: NominatimResult | string): string {
    return nominatimDisplayFn(result);
  }

  /**
   * @description
   * Determines if a phone number is required based on the selected contact method.
   */
  needsPhoneNumber(): boolean {
    const method = this.contactForm.get('preferredContactMethod')?.value;
    return method === ContactMethod.PHONE || method === ContactMethod.WHATSAPP;
  }

  /**
   * @description
   * Returns the display label of the selected contact method.
   * @param value - `ContactMethod` enum value.
   */
  getSelectedLabel(value: string): string {
    return (
      this.contactMethods.find((m) => m.value === value)?.label ??
      'Select contact method'
    );
  }

  /**
   * @description
   * Returns human-readable label for a duration in minutes.
   * @param minutes - Duration in minutes.
   */
  private getDurationLabel(minutes: number): string {
    return (
      this.suggestedDurations.find((d) => d.value === minutes)?.label ??
      `${minutes} min`
    );
  }

  // ───────────────────────────────────────────── Event handlers ─────────────────────────────────────────────

  /**
   * @description
   * Handles input events on the address field.
   * Debounces and forwards queries to the Nominatim search pipeline.
   * @param event - Native input event.
   */
  onAddressInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;

    if (input.length < 3) {
      this.addressSuggestions.set([]);
      this.isAddressValid.set(false);
      this.selectedPlace.set(null);
      this.vectorLayer?.getSource()?.clear();
      this.cdr.markForCheck();
      return;
    }

    this.isLoadingAddresses.set(true);
    this.isAddressValid.set(false);
    this.selectedPlace.set(null);
    this.searchSubject.next(input);
  }

  /**
   * @description
   * Handles selection of an address from autocomplete.
   * Updates form state, places a map marker, and shows a temporary popup.
   * @param result - Selected {@link NominatimResult}.
   */
  selectAddress(result: NominatimResult): void {
    this.selectedPlace.set(result);
    this.isAddressValid.set(true);
    this.addressSuggestions.set([]);

    this.contactForm.patchValue(
      { locationAddress: result.display_name },
      { emitEvent: false },
    );

    if (!this.map || !this.vectorLayer) {
      console.warn('Map or vector layer not initialized');
      return;
    }

    this.forceMapResize();

    setTimeout(() => {
      if (!this.map || !this.vectorLayer) return;

      const coordinates = fromLonLat([
        parseFloat(result.lon),
        parseFloat(result.lat),
      ]);

      this.map
        .getView()
        .animate({ center: coordinates, zoom: 16, duration: 500 });

      const source = this.vectorLayer.getSource();
      if (source) {
        source.clear();
        const markerFeature = new Feature({ geometry: new Point(coordinates) });
        source.addFeature(markerFeature);
        this.markerFeature = markerFeature;
      }

      this.addPopupToMarker(coordinates, result);
    }, 200);

    this.cdr.markForCheck();
  }

  /**
   * @description
   * Adds a temporary HTML popup overlay to the map at given coordinates.
   * @param coordinates - Projected [x, y] coordinates.
   * @param result - Nominatim result to display.
   */
  private addPopupToMarker(
    coordinates: number[],
    result: NominatimResult,
  ): void {
    if (!this.map) return;

    const popupElement = document.createElement('div');
    popupElement.className = 'ol-popup';
    popupElement.innerHTML = formatAddressForPopup(result);
    popupElement.style.cssText = `
      background: white; border-radius: 4px; padding: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15); border: 1px solid #ccc;
      font-size: 12px; min-width: 200px;
    `;

    const popupOverlay = new Overlay({
      element: popupElement,
      positioning: 'bottom-center',
      offset: [0, -15],
      autoPan: true,
    });

    this.map.addOverlay(popupOverlay);
    popupOverlay.setPosition(coordinates);
    setTimeout(() => this.map?.removeOverlay(popupOverlay), 5000);
  }

  /**
   * @description
   * Sets the appointment time from a quick-select chip.
   * @param time - Time in HH:MM format.
   */
  setTime(time: string): void {
    this.contactForm.patchValue({ appointmentTime: time });
  }

  /**
   * @description
   * Sets the appointment duration from a quick-select chip.
   * @param minutes - Duration in minutes.
   */
  setDuration(minutes: number): void {
    this.contactForm.patchValue({ durationMinutes: minutes });
  }

  // ───────────────────────────────────────────── Form actions ─────────────────────────────────────────────

  /**
   * @description
   * Handles form submission:
   * - Validates the form.
   * - Validates meeting-specific fields if in meeting mode.
   * - Sends request via {@link ContactRequestService}.
   * - Shows success/error feedback.
   */
  async onSubmit(): Promise<void> {
    if (this.contactForm.invalid) {
      this.showValidationErrors();
      return;
    }

    if (this.isMeetingMode()) {
      const place = this.selectedPlace();
      if (!place) {
        showSnackBar(
          this.snackBar,
          'Please select a valid address from the suggestions',
        );
        return;
      }

      const lat = parseFloat(place.lat);
      const lon = parseFloat(place.lon);
      if (isNaN(lat) || isNaN(lon)) {
        showSnackBar(this.snackBar, 'Invalid address coordinates');
        return;
      }

      const appointmentDateTime = combineDateTime(
        this.contactForm.value.appointmentDate,
        this.contactForm.value.appointmentTime,
      );

      if (appointmentDateTime < new Date()) {
        showSnackBar(this.snackBar, 'Appointment date cannot be in the past');
        return;
      }
      if (appointmentDateTime > this.maxDate) {
        showSnackBar(this.snackBar, 'Appointment date cannot exceed 12 months');
        return;
      }

      const confirmResult = await Swal.fire({
        title: 'Schedule meeting?',
        html: `
          <div style="text-align: left;">
            <p><strong>Date:</strong> ${this.contactForm.value.appointmentDate.toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${this.contactForm.value.appointmentTime}</p>
            <p><strong>Duration:</strong> ${this.getDurationLabel(this.contactForm.value.durationMinutes)}</p>
            <p><strong>Location:</strong> ${this.contactForm.value.locationAddress}</p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, schedule',
        cancelButtonText: 'Review',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      });

      if (!confirmResult.isConfirmed) return;
    }

    this.isSubmitting.set(true);

    try {
      const formValue = this.contactForm.value;
      const advertiserId = this.data.ad.createdBy?.userId;
      const productId = this.data.ad.productId;

      if (!advertiserId) {
        showSnackBar(this.snackBar, 'Error: Could not identify advertiser');
        return;
      }
      if (!this.data.currentUserId) {
        showSnackBar(this.snackBar, 'Error: User not authenticated');
        return;
      }

      const payload: any = {
        sender: { userId: this.data.currentUserId },
        receiver: { userId: advertiserId },
        product: { productId: productId! },
        subject: this.contactForm.get('subject')?.value?.trim(),
        message: formValue.message.trim(),
        additionalNotes: formValue.additionalNotes?.trim() || undefined,
        preferredContactMethod: formValue.preferredContactMethod,
        senderPhone: formValue.senderPhone?.trim() || undefined,
        senderContactEmail: formValue.senderContactEmail?.trim(),
      };

      if (this.isMeetingMode()) {
        const place = this.selectedPlace()!;
        const appointmentDateTime = combineDateTime(
          formValue.appointmentDate,
          formValue.appointmentTime,
        );

        payload.appointmentDateTime = appointmentDateTime
          .toISOString()
          .slice(0, 19);
        payload.locationAddress = formValue.locationAddress;
        payload.locationNotes = formValue.locationNotes?.trim() || undefined;
        payload.durationMinutes = formValue.durationMinutes;
        payload.latitude = parseFloat(place.lat);
        payload.longitude = parseFloat(place.lon);
      }

      const response = await this.contactRequestService
        .createContactRequest(payload as CreateContactRequestPayload)
        .toPromise();

      showSnackBar(
        this.snackBar,
        this.isMeetingMode()
          ? 'Meeting request sent! The seller will schedule an appointment'
          : 'Your message has been sent successfully! The seller will contact you soon',
      );

      this.dialogRef.close(response);
    } catch (error: any) {
      console.error('Error sending contact request:', error);
      showSnackBar(
        this.snackBar,
        error?.error?.message ??
          'Failed to send your message. Please try again',
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * @description
   * Marks all form controls as touched and scrolls to the first invalid field.
   */
  private showValidationErrors(): void {
    this.contactForm.markAllAsTouched();
    showSnackBar(this.snackBar, 'Please fill in all required fields correctly');
    this.scrollToFirstInvalidField();
  }

  /**
   * @description
   * Scrolls to the first visible validation error.
   */
  private scrollToFirstInvalidField(): void {
    document
      .querySelector('.mat-mdc-form-field-error, .mat-form-field-invalid')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /**
   * @description
   * Closes the dialog, optionally asking the user to confirm if the form has unsaved changes.
   */
  async onClose(): Promise<void> {
    if (this.isSubmitting()) return;

    if (this.contactForm.dirty) {
      const result = await Swal.fire({
        title: 'Unsaved Changes',
        text: 'You have unsaved changes. Are you sure you want to close?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, close it!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
      });
      if (!result.isConfirmed) return;
    } else {
      const result = await Swal.fire({
        title: 'Close?',
        text: 'Are you sure you want to close this window?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, close',
        cancelButtonText: 'Stay',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      });
      if (!result.isConfirmed) return;
    }

    this.dialogRef.close();
  }

  /**
   * @description
   * Resets all form fields to defaults, clears map and address state,
   * and resets {@link isFormFilled}.
   */
  async onReset(): Promise<void> {
    if (this.contactForm.dirty) {
      const result = await Swal.fire({
        title: 'Reset Form?',
        text: 'Are you sure you want to reset all fields?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, reset!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      });
      if (!result.isConfirmed) return;
    }

    if (this.isResetting()) return;
    this.isResetting.set(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    this.contactForm.reset({
      ...CONTACT_FORM_DEFAULTS,
      subject: this.data.ad.title
        ? `Interested in: ${this.data.ad.title}`.substring(0, 50)
        : '',
      preferredContactMethod: ContactMethod.EMAIL,
    });

    this.selectedPlace.set(null);
    this.isAddressValid.set(false);
    this.vectorLayer?.getSource()?.clear();

    showSnackBar(this.snackBar, 'Form reset successfully');
    this.isFormFilled.set(false);
    this.isResetting.set(false);
  }

  /**
   * @description
   * Returns modal footer actions with appropriate enabled/disabled/loading states.
   */
  get modalActions(): ModalAction[] {
    return [
      {
        id: 'reset',
        label: this.isResetting() ? 'Resetting...' : 'Reset',
        type: 'danger-outline',
        disabled:
          !this.isFormFilled() || this.isSubmitting() || this.isResetting(),
        loading: this.isResetting(),
      },
      {
        id: 'submit',
        label: this.isSubmitting() ? 'Sending...' : 'Send Request',
        type: 'primary',
        disabled:
          this.contactForm.invalid ||
          (this.isMeetingMode() && !this.isAddressValid()) ||
          this.isSubmitting(),
        loading: this.isSubmitting(),
      },
    ];
  }

  /**
   * @description
   * Handles clicks on footer actions, dispatching `reset` or `submit`.
   * Ensures Angular change detection sees the event correctly.
   * @param actionId - Action ID ('reset' | 'submit').
   */
  onModalAction(actionId: string): void {
    // Forza l'esecuzione in un nuovo ciclo di eventi per rientrare nella zona Angular
    setTimeout(() => {
      switch (actionId) {
        case 'reset':
          this.onReset();
          break;
        case 'submit':
          this.onSubmit();
          break;
      }
    });
  }
}
