import { CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

// OpenLayers
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { OSM } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon } from 'ol/style';
import { AppointmentDTO } from 'src/app/interfaces/dtos/contact/appointment_dto.interface';
import { AppointmentStatus } from 'src/app/interfaces/dtos/contact/appointmentStatus.enum';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AppointmentProposalDTO } from 'src/app/interfaces/dtos/contact/appointment_proposal_dto';
import { AppointmentProposalService } from 'src/app/services/path/contact/appointment-proposal/appointment-proposal.service';
import { ProposalStatus } from 'src/app/interfaces/dtos/contact/appointment_proposal.interface';
import { ModalAction, ModalComponent } from 'my-lib-inside';
import { getAppointmentStatusLabel } from 'src/app/utils/filter-display-utils';

/**
 * @category Interfaces
 * 
 * @fileoverview Data interface for the appointment detail dialog component.
 * Used to pass appointment data and user context to the dialog.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @description
 * Defines the structure of data passed to the appointment detail dialog.
 * Contains the appointment object to display and the current user's ID
 * for permission checks and action handling.
 *
 * @property {AppointmentDTO} apt - The appointment data to display in the dialog
 * @property {number} currentUserId - ID of the currently logged-in user for determining available actions
 *
 */
export interface AppointmentDialogData {
  apt: AppointmentDTO;
  currentUserId: number;
}

/**
 * @category Dialogs
 * 
 * @description
 * Dialog component to display details of a specific appointment.
 * Shows appointment location on a map (OpenLayers) and pending proposals.
 * Provides modal interface with dynamic title, subtitle, and actions.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Component({
  selector: 'app-appointment-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    ModalComponent,
  ],
  templateUrl: './appointment-detail-dialog.component.html',
  styleUrl: './appointment-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentDetailDialogComponent
  implements AfterViewInit, OnDestroy
{
  /** @description Reference to the map container element in the template */
  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLDivElement>;

  /** @description Appointment data to display in the dialog */
  apt: AppointmentDTO;

  /** @description Current logged-in user ID */
  currentUserId: number;

  /** @description List of appointment proposals that are pending */
  proposals: AppointmentProposalDTO[] = [];

  /** @description Enum exposing appointment statuses to the template */
  AppointmentStatus = AppointmentStatus;

  /** @description Internal OpenLayers map instance */
  private olMap: Map | null = null;

  /**
   * @description
   * Component constructor. Injects dialog reference, appointment data,
   * proposal service, and change detector.
   *
   * Loads pending proposals immediately on construction.
   *
   * @param dialogRef Reference to the MatDialog controlling this component
   * @param data Appointment dialog input data
   * @param proposalService Service to fetch appointment proposals
   * @param cdRef Change detector to manually trigger updates
   */
  constructor(
    public dialogRef: MatDialogRef<AppointmentDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: AppointmentDialogData,
    private proposalService: AppointmentProposalService,
    private cdRef: ChangeDetectorRef,
  ) {
    this.apt = data.apt;
    this.currentUserId = data.currentUserId;
    this.loadProposals();
  }

  // ───────────────────────────────────────────── Lifecycle ─────────────────────────────────────────────

  /**
   * @inheritdoc
   * @description
   * Angular lifecycle hook. Initializes the map if coordinates are available.
   */
  ngAfterViewInit(): void {
    if (this.apt.latitude && this.apt.longitude && this.mapContainer) {
      setTimeout(() => this.initMap(), 150);
    }
  }

  /**
   * @inheritdoc
   * @description
   * Angular lifecycle hook. Cleans up OpenLayers map to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.olMap) {
      this.olMap.setTarget(undefined as any);
      this.olMap = null;
    }
  }

  // ───────────────────────────────────────────── Map ─────────────────────────────────────────────

  /**
   * @description
   * Initializes the OpenLayers map centered on the appointment location.
   * Adds a marker for the appointment coordinates.
   */
  private initMap(): void {
    if (!this.mapContainer || !this.apt.latitude || !this.apt.longitude) return;

    const coords = fromLonLat([this.apt.longitude, this.apt.latitude]);

    const marker = new Feature({ geometry: new Point(coords) });
    marker.setStyle(
      new Style({
        image: new Icon({
          src:
            'data:image/svg+xml;utf8,' +
            encodeURIComponent(`
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              fill="#1e6ef5" stroke="white" stroke-width="1.5"/>
            <circle cx="12" cy="9" r="3" fill="white"/>
          </svg>`),
          scale: 1.2,
          anchor: [0.5, 1],
        }),
      }),
    );

    this.olMap = new Map({
      target: this.mapContainer.nativeElement,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({ source: new VectorSource({ features: [marker] }) }),
      ],
      view: new View({ center: coords, zoom: 15 }),
      controls: [],
    });
  }

  // ───────────────────────────────────────────── Proposals ─────────────────────────────────────────────

  /**
   * @description
   * Loads all pending proposals for the current appointment.
   * Updates the `proposals` array and triggers change detection.
   */
  private loadProposals(): void {
    if (!this.apt.appointmentId) return;
    this.proposalService.getProposals(this.apt.appointmentId).subscribe({
      next: (proposals) => {
        this.proposals = proposals.filter(
          (p) => p.status === ProposalStatus.PENDING,
        );
        this.cdRef.markForCheck();
      },
      error: () => {},
    });
  }

  // ───────────────────────────────────────────── Helpers ─────────────────────────────────────────────

  /**
   * @description
   * Returns `true` if the current user is the organizer of this appointment.
   */
  get isOrganizer(): boolean {
    return this.apt.organizer.userId === this.currentUserId;
  }

  /**

  // ───────────────────────────────────────────── Modal ─────────────────────────────────────────────
 
  
   /** @description Returns modal title derived from the appointment title */
  get modalTitle(): string {
    return this.apt.title.replace(/^Meeting:\s*/, '');
  }

  /**
   * Template wrapper.
   * @param status - Appointment status enum
   * @returns Label string
   */
  getStatusLabel(status: AppointmentStatus): string {
    return getAppointmentStatusLabel(status);
  }

  /** @description Returns modal subtitle derived from the appointment status */
  get modalSubtitle(): string {
    return this.getStatusLabel(this.apt.status);
  }

  /** @description Returns available modal actions */
  get modalActions(): ModalAction[] {
    return [];
  }

  /**
   * @description
   * Handles modal action clicks, e.g., 'close'.
   * @param actionId - Action identifier string
   */
  onModalAction(actionId: string): void {
    if (actionId === 'close') this.dialogRef.close();
  }

  /** @description Closes the dialog */
  closeDialog(): void {
    this.dialogRef.close();
  }

  /** @description Star rating range for template rendering */
  starRange = [1, 2, 3, 4, 5];
}
