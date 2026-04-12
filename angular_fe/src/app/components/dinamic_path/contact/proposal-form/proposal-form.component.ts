import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ModalAction, ModalComponent } from 'my-lib-inside';
import { UserProfileDTO } from 'src/app/interfaces/dtos/comment/user_profile_dto.interface';
import { AppointmentDTO } from 'src/app/interfaces/dtos/contact/appointment_dto.interface';
import { ProposalStatus } from 'src/app/interfaces/dtos/contact/appointment_proposal.interface';
import { AppointmentProposalDTO } from 'src/app/interfaces/dtos/contact/appointment_proposal_dto';
import {
  buildNominatimUrl,
  combineDateTime,
  formatAddressForPopup,
  nominatimDisplayFn,
  NominatimResult,
} from 'src/app/utils/components-utils/send-message-dialog.utils';
import Swal from 'sweetalert2';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import Overlay from 'ol/Overlay';
import {
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  of,
  Subject,
  switchMap,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

/**
 * @category Dialogs
 * 
 * @description
 * Manages the proposal form modal for scheduling appointments.
 *
 * Features:
 * - Date, time, location, and duration input fields
 * - Address autocomplete with Nominatim search
 * - Map visualization with marker for selected location
 * - Suggested times and durations
 * - Modal submission with confirmation dialogs
 *
 * Lifecycle:
 * - Initializes address search on AfterViewInit
 * - Cleans up subscriptions and map on OnDestroy
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Component({
  selector: 'app-proposal-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatAutocompleteModule,
  ],
  templateUrl: './proposal-form.component.html',
  styleUrl: './proposal-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProposalFormComponent implements AfterViewInit, OnDestroy {
  /**
   * @description Reference to the map container HTML element.
   */
  private _mapContainer?: ElementRef<HTMLDivElement>;

  /**
   * @description Sets the map container element and initializes or disposes the map.
   * @param el HTML div element for map or undefined
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

  /**
   * @description OpenLayers Map instance.
   */
  private map?: Map;

  /**
   * @description Vector layer used for placing markers on the map.
   */
  private vectorLayer?: VectorLayer<VectorSource>;

  /**
   * @description Feature representing the current marker on the map.
   */
  private markerFeature?: Feature;

  /**
   * @description Subject to handle debounced address search queries.
   */
  private searchSubject = new Subject<string>();

  // ───────────────────────────────────────────── Signals ─────────────────────────────────────────────

  /**
   * @description Indicates if the address search is loading.
   */
  isLoadingAddresses = signal(false);

  /**
   * @description Holds the list of address suggestions from Nominatim.
   */
  addressSuggestions = signal<NominatimResult[]>([]);

  /**
   * @description Holds the currently selected place from the suggestions.
   */
  selectedPlace = signal<NominatimResult | null>(null);

  /**
   * @description Flag to indicate if the selected address is valid.
   */
  isAddressValid = signal(false);

  // ───────────────────────────────────────────── Form data ─────────────────────────────────────────────

  /**
   * @description Reactive form for the proposal inputs.
   */
  form: FormGroup;

  /**
   * @description Minimum allowed date for appointment (today).
   */
  minDate = new Date();

  /**
   * @description Maximum allowed date for appointment (12 months from today).
   */
  maxDate = new Date(new Date().setMonth(new Date().getMonth() + 12));

  /**
   * @description Suggested appointment times.
   */
  suggestedTimes = ['09:00', '11:00', '13:00', '15:00', '17:00'];

  /**
   * @description Suggested appointment durations in minutes.
   */
  suggestedDurations = [
    { label: '30 min', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '1.5h', value: 90 },
    { label: '2 hours', value: 120 },
  ];

  // ───────────────────────────────────────────── Constructor ─────────────────────────────────────────────

  /**
   * @description Initializes the proposal form component with injected services
   * and sets up the reactive form controls.
   * @param fb FormBuilder service for creating the reactive form
   * @param http HttpClient for making address search requests
   * @param cdr ChangeDetectorRef for manual change detection
   * @param data Dialog input data containing the appointment
   * @param dialogRef Reference to the modal dialog
   */
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { appointment: AppointmentDTO },
    private dialogRef: MatDialogRef<ProposalFormComponent>,
  ) {
    this.form = this.fb.group({
      proposedDate: [null],
      proposedTime: [
        '',
        [Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)],
      ],
      proposedLocationAddress: [''],
      proposedLocationNotes: [''],
      proposedDuration: [null, [Validators.min(15)]],
    });
  }

  // ───────────────────────────────────────────── Lifecycle ─────────────────────────────────────────────

  /**
   * @inheritdoc
   * @description Lifecycle hook. Sets up the address search after the view initializes.
   */
  ngAfterViewInit(): void {
    this.setupAddressSearch();
  }

  /**
   * @inheritdoc
   * @description Lifecycle hook. Cleans up subscriptions and map resources.
   */
  ngOnDestroy(): void {
    this.searchSubject.complete();
    if ((this as any).resizeObserver) (this as any).resizeObserver.disconnect();
    if (this.map) {
      this.map.setTarget(undefined);
      this.map.dispose();
    }
  }

  /**
   * @description Sets up the address search observable with debounce and updates suggestions.
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
          this.addressSuggestions.set(results as NominatimResult[]);
          this.isLoadingAddresses.set(false);
          this.cdr.markForCheck();
        },
        error: () => {
          this.addressSuggestions.set([]);
          this.isLoadingAddresses.set(false);
          this.cdr.markForCheck();
        },
      });
  }

  /**
   * @description Performs an HTTP request to fetch address suggestions.
   * @param query The search string typed by the user
   * @returns Promise resolving with an array of NominatimResult
   */
  private searchAddress(query: string): Promise<NominatimResult[]> {
    return firstValueFrom(
      this.http.get<NominatimResult[]>(buildNominatimUrl(query), {
        headers: { 'User-Agent': 'MeetingSchedulerApp/1.0' },
      }),
    );
  }

  /**
   * @description Handles user input in the address field and triggers search.
   * @param event Input event from HTML input element
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
   * @description Handles selection of an address suggestion from dropdown.
   * Updates the form, selectedPlace signal, and map marker.
   * @param result Selected NominatimResult
   */
  selectAddress(result: NominatimResult): void {
    this.selectedPlace.set(result);
    this.isAddressValid.set(true);
    this.addressSuggestions.set([]);

    this.form.patchValue(
      { proposedLocationAddress: result.display_name },
      { emitEvent: false },
    );

    if (!this.map || !this.vectorLayer) return;

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
        const marker = new Feature({ geometry: new Point(coordinates) });
        source.addFeature(marker);
        this.markerFeature = marker;
      }

      this.addPopupToMarker(coordinates, result);
    }, 200);

    this.cdr.markForCheck();
  }

  /**
   * @description Formats an address for display in the autocomplete input.
   * @param result NominatimResult or string
   * @returns The string to display in the input field
   */
  displayFn(result: NominatimResult | string): string {
    return nominatimDisplayFn(result);
  }

  /**
   * @description Adds a temporary popup overlay to the map marker.
   * @param coordinates Map coordinates [lon, lat]
   * @param result NominatimResult for popup content
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

    const overlay = new Overlay({
      element: popupElement,
      positioning: 'bottom-center',
      offset: [0, -15],
      autoPan: true,
    });

    this.map.addOverlay(overlay);
    overlay.setPosition(coordinates);
    setTimeout(() => this.map?.removeOverlay(overlay), 5000);
  }

  /**
   * @description Initializes OpenLayers map and vector layer for markers.
   */
  private initializeMap(): void {
    if (!this._mapContainer || this.map) return;

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
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                fill="#d32f2f" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="9" r="4" fill="white"/>
            </svg>`),
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
          center: fromLonLat([12.4964, 41.9028]),
          zoom: 6,
          maxZoom: 19,
          minZoom: 3,
        }),
      });

      this.setupMapScrollBehavior();
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  /**
   * @description Forces the map to resize and re-render.
   */
  private forceMapResize(): void {
    if (this.map) {
      setTimeout(() => {
        this.map?.updateSize();
        this.map?.renderSync();
      }, 150);
    }
  }

  /**
   * @description Sets up map scroll and zoom behavior for better UX.
   */
  private setupMapScrollBehavior(): void {
    setTimeout(() => {
      if (!this.map) return;
      this.hideZoomButtons();

      const mapViewport =
        this._mapContainer?.nativeElement.querySelector('.ol-viewport');
      if (!mapViewport) return;

      let isInteracting = false;
      mapViewport.addEventListener('mousedown', () => {
        isInteracting = true;
      });
      mapViewport.addEventListener('mouseup', () => {
        setTimeout(() => {
          isInteracting = false;
        }, 100);
      });
      mapViewport.addEventListener('mouseleave', () => {
        isInteracting = false;
      });

      mapViewport.addEventListener(
        'wheel',
        (event: Event) => {
          const e = event as WheelEvent;
          const scrollContainer = document.querySelector('.lm-body');
          if (!scrollContainer || isInteracting) return;

          const up = e.deltaY < 0;
          const down = e.deltaY > 0;
          const canUp = scrollContainer.scrollTop > 0;
          const canDown =
            scrollContainer.scrollTop <
            scrollContainer.scrollHeight - scrollContainer.clientHeight;

          if ((down && canDown) || (up && canUp)) {
            scrollContainer.scrollTop += e.deltaY;
            e.preventDefault();
            e.stopPropagation();
          } else if (!e.ctrlKey && !e.metaKey) {
            const view = this.map?.getView();
            const zoom = view?.getZoom() || 0;
            view?.setZoom(up ? zoom + 0.5 : zoom - 0.5);
            e.preventDefault();
          }
        },
        { passive: false },
      );
    }, 500);
  }

  /**
   * @description Hides the default OpenLayers zoom buttons.
   */
  private hideZoomButtons(): void {
    setTimeout(() => {
      document.querySelectorAll('.ol-zoom').forEach((btn) => {
        (btn as HTMLElement).style.display = 'none';
      });
    }, 300);
  }

  // ───────────────────────────────────────────── Chip helpers ─────────────────────────────────────────────

  /**
   * @description Sets the selected time in the form.
   * @param time Time string in HH:mm format
   */
  setTime(time: string): void {
    this.form.get('proposedTime')?.setValue(time);
  }

  /**
   * @description Sets the selected duration in the form.
   * @param minutes Duration in minutes
   */
  setDuration(minutes: number): void {
    this.form.get('proposedDuration')?.setValue(minutes);
  }

  // ───────────────────────────────────────────── Modal actions ─────────────────────────────────────────────

  /**
   * @description Returns the available actions for the modal footer.
   * @returns Array of ModalAction objects
   */
  get modalActions(): ModalAction[] {
    return [
      {
        id: 'submit',
        label: 'Send',
        type: 'primary',
        disabled: this.form.invalid,
        loading: false,
      },
    ];
  }

  /**
   * @description Handles click on a modal action button.
   * @param actionId The ID of the clicked action
   */
  onModalAction(actionId: string): void {
    setTimeout(() => {
      if (actionId === 'submit') this.submit();
    });
  }

  /**
   * @description Validates and submits the proposal form.
   * Shows confirmation dialogs and prepares payload for submission.
   */
  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;

    const hasDate = !!raw.proposedDate;
    const hasTime = !!raw.proposedTime?.trim();
    const hasLocation = !!raw.proposedLocationAddress?.trim();
    const hasDuration = !!raw.proposedDuration;

    if (!hasDate && !hasTime && !hasLocation && !hasDuration) {
      Swal.fire({
        icon: 'warning',
        title: 'Nothing to propose',
        text: 'Please fill in at least one field.',
      });
      return;
    }

    let appointmentDateTime: Date | null = null;
    if (hasDate && hasTime) {
      appointmentDateTime = combineDateTime(raw.proposedDate, raw.proposedTime);
      if (appointmentDateTime < new Date()) {
        Swal.fire(
          'Invalid date',
          'The proposed date cannot be in the past.',
          'warning',
        );
        return;
      }
    }

    const place = this.selectedPlace();

    if (hasLocation && !place) {
      Swal.fire({
        icon: 'warning',
        title: 'Select address from suggestions',
        text: 'Please select an address from the dropdown to get coordinates.',
      });
      return;
    }

    const rows = [
      appointmentDateTime
        ? `<p><strong>📅 Date:</strong> ${appointmentDateTime.toLocaleString('it-IT')}</p>`
        : hasDate
          ? `<p><strong>📅 Date:</strong> ${new Date(raw.proposedDate).toLocaleDateString('it-IT')}</p>`
          : '',
      hasLocation
        ? `<p><strong>📍 Location:</strong> ${raw.proposedLocationAddress}</p>`
        : '',
      hasDuration
        ? `<p><strong>⏱ Duration:</strong> ${raw.proposedDuration} min</p>`
        : '',
    ].join('');

    const result = await Swal.fire({
      title: 'Send proposal?',
      html: `<div style="text-align:left;font-size:0.85rem">${rows}</div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, send',
      cancelButtonText: 'Review',
      confirmButtonColor: '#1e6ef5',
      cancelButtonColor: '#94a3b8',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    const payload: AppointmentProposalDTO = {
      proposedDatetime: appointmentDateTime
        ? appointmentDateTime.toISOString().slice(0, 19)
        : hasDate
          ? new Date(raw.proposedDate).toISOString().slice(0, 19)
          : (null as any),
      proposedLocationAddress: raw.proposedLocationAddress || (null as any),
      proposedLocationNotes: raw.proposedLocationNotes || undefined,
      proposedDuration: raw.proposedDuration || undefined,
      latitude: place ? parseFloat(place.lat) : undefined,
      longitude: place ? parseFloat(place.lon) : undefined,
      appointment: {} as AppointmentDTO,
      proposedBy: {} as UserProfileDTO,
      status: ProposalStatus.PENDING,
    };

    this.dialogRef.close(payload);
  }

  /**
   * @description Closes the dialog. Prompts confirmation if form has unsaved changes.
   */
  async closeDialog(): Promise<void> {
    if (this.form.dirty) {
      const result = await Swal.fire({
        title: 'Discard changes?',
        text: 'Your proposal will not be saved.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, discard',
        cancelButtonText: 'Keep editing',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#94a3b8',
        reverseButtons: true,
      });
      if (!result.isConfirmed) return;
    }
    this.dialogRef.close();
  }
}
