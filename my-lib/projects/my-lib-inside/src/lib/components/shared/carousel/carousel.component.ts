import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { register } from 'swiper/element/bundle';
// Register Swiper web component globally (only once)
let swiperRegistered = false;
if (!swiperRegistered) {
  register();
  swiperRegistered = true;
}

/**
 * @fileoverview Image carousel component with zoom modal functionality.
 *
 * @description
 * A touch-friendly image carousel built with Swiper.js that supports:
 * - Multiple images with navigation arrows and pagination
 * - Thumbnail navigation
 * - Full-screen zoom modal with keyboard navigation (arrows, ESC)
 * - Responsive design with mobile optimizations
 *
 * @implements {AfterViewInit}
 * @implements {OnChanges}
 * @implements {OnDestroy}
 *
 * @category Components
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```html
 * <lib-carousel
 *   [images]="productImages"
 *   [mimeTypeFn]="getMimeType"
 * ></lib-carousel>
 * ```
 *
 * @example
 * ```typescript
 * // In your component
 * images = [
 *   { picByte: '/9j/4AAQSkZJRg...' },
 *   { picByte: 'iVBORw0KGgoAAAANS...' }
 * ];
 *
 * getMimeType(bytes: string): string {
 *   if (bytes.startsWith('/9j/')) return 'image/jpeg';
 *   if (bytes.startsWith('iVBOR')) return 'image/png';
 *   return 'image/jpeg';
 * }
 * ```
 */
@Component({
  selector: 'lib-carousel',
  standalone: true,
  imports: [],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent implements AfterViewInit, OnChanges, OnDestroy {
  // ── Inputs ────────────────────────────────────────────────────────────────

  /**
   * @description Array of images to display in the carousel.
   * Each image should have a `picByte` property containing base64-encoded image data.
   */
  @Input() images: { picByte: string }[] = [];

  /**
   * @description Function that determines the MIME type from base64 image data.
   * Default returns 'image/jpeg'.
   *
   * @param bytes - First few characters of the base64 string
   * @returns MIME type string (e.g., 'image/jpeg', 'image/png')
   */
  @Input() mimeTypeFn: (bytes: string) => string = () => 'image/jpeg';

  // ── ViewChild ─────────────────────────────────────────────────────────────

  /** @description Reference to the Swiper container DOM element */
  @ViewChild('swiperContainer') swiperContainerRef!: ElementRef;

  // ── State ─────────────────────────────────────────────────────────────────

  /** @description Current active slide index (0-based) */
  activeIndex = 0;

  /** @description Whether the zoom modal is open */
  showZoomModal = false;

  /** @description Base64 image data for the currently zoomed image */
  currentZoomImage = '';

  /** @description Index of the currently zoomed image */
  currentZoomIndex = 0;

  // ── Privates ───────────────────────────────────────────────────────────────

  /** @description Swiper instance reference */
  private swiper: any;

  /** @description Change detector reference for manual change detection */
  private readonly cdRef: ChangeDetectorRef;

  /** @description NgZone reference for running code inside Angular zone */
  private readonly ngZone: NgZone;

  constructor(cdRef: ChangeDetectorRef, ngZone: NgZone) {
    this.cdRef = cdRef;
    this.ngZone = ngZone;
  }

  /**
   * @description Keyboard event handler stored as arrow function to maintain reference
   * for proper removal in `removeEventListener`.
   */
  private readonly keyDownHandler = (e: KeyboardEvent) => this.onKeyDown(e);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  /**
   * @inheritdoc
   * @description Lifecycle hook: initializes Swiper after view is ready.
   */
  ngAfterViewInit(): void {
    this.initSwiper();
  }

  /**
   * @inheritdoc
   * @description Lifecycle hook: updates Swiper when images input changes.
   * @param changes - Object containing changed input properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['images'] && this.swiper) {
      this.swiper.update();
      this.goToSlide(0, false);
    }
  }

  /**
   * @inheritdoc
   * @description Lifecycle hook: cleans up event listeners and destroys Swiper instance.
   */
  ngOnDestroy(): void {
    this.restoreBodyScroll();
    document.removeEventListener('keydown', this.keyDownHandler);
    if (this.swiper) {
      this.swiper.destroy(true, true);
    }
  }

  // ── Swiper init ───────────────────────────────────────────────────────────

  /**
   * @description Initializes the Swiper instance with configuration options.
   */
  private initSwiper(): void {
    const el = this.swiperContainerRef?.nativeElement;
    if (!el) return;

    const hasMultiple = this.images.length > 1;

    Object.assign(el, {
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 380,
      navigation: hasMultiple,
      pagination: hasMultiple
        ? { clickable: true, dynamicBullets: true }
        : false,
      keyboard: { enabled: true, onlyInViewport: true },
      on: {
        slideChange: () => {
          this.ngZone.run(() => {
            this.activeIndex = el.swiper?.activeIndex ?? 0;
            if (this.showZoomModal) {
              this.currentZoomIndex = this.activeIndex;
              this.currentZoomImage = this.getImageSrc(
                this.images[this.activeIndex].picByte,
              );
            }
            this.cdRef.markForCheck();
          });
        },
      },
    });

    el.initialize();
    this.swiper = el.swiper;
  }

  // ── Navigazion carousel ──────────────────────────────────────────────────

  /**
   * @description Navigates to a specific slide.
   * @param index - Target slide index (0-based)
   * @param animate - Whether to animate the transition (default: true)
   */
  goToSlide(index: number, animate = true): void {
    if (!this.swiper) return;
    this.swiper.slideTo(index, animate ? undefined : 0);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * @description Converts base64 image data to a complete data URL with MIME type.
   * @param picByte - Base64-encoded image data
   * @returns Complete data URL (e.g., 'data:image/jpeg;base64,/9j/4AAQ...')
   */
  getImageSrc(picByte: string): string {
    const mime = this.mimeTypeFn(picByte.slice(0, 10));
    return `data:${mime};base64,${picByte}`;
  }

  // ── Zoom Modal ────────────────────────────────────────────────────────────

  /**
   * @description Opens the zoom modal for a specific image.
   * @param index - Index of the image to zoom
   */
  openZoomModal(index: number): void {
    this.currentZoomIndex = index;
    this.currentZoomImage = this.getImageSrc(this.images[index].picByte);
    this.showZoomModal = true;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this.keyDownHandler);
    this.cdRef.markForCheck();
  }

  /**
   * @description Closes the zoom modal and restores body scroll.
   */
  closeZoomModal(): void {
    this.showZoomModal = false;
    this.currentZoomImage = '';
    this.restoreBodyScroll();
    document.removeEventListener('keydown', this.keyDownHandler);
    this.cdRef.markForCheck();
  }

  /**
   * @description Navigates to the next image in the zoom modal.
   * @param event - Optional click event to stop propagation
   */
  nextZoomImage(event?: Event): void {
    event?.stopPropagation();

    if (this.currentZoomIndex >= this.images.length - 1) return;

    this.currentZoomIndex++;
    this.syncZoomImage();
    this.goToSlide(this.currentZoomIndex);
  }

  /**
   * @description Navigates to the previous image in the zoom modal.
   * @param event - Optional click event to stop propagation
   */
  previousZoomImage(event?: Event): void {
    event?.stopPropagation();

    if (this.currentZoomIndex <= 0) return;

    this.currentZoomIndex--;
    this.syncZoomImage();
    this.goToSlide(this.currentZoomIndex);
  }

  /**
   * @description Synchronizes the zoom modal image with the current index.
   * Called from dot indicator clicks.
   * @param index - Index to sync to
   */
  syncZoom(index: number): void {
    this.currentZoomIndex = index;
    this.syncZoomImage();
    this.goToSlide(index);
  }

  /**
   * @description Updates the zoom modal image based on current index.
   */
  private syncZoomImage(): void {
    this.currentZoomImage = this.getImageSrc(
      this.images[this.currentZoomIndex].picByte,
    );
    this.cdRef.markForCheck();
  }

  /**
   * @description Handles keyboard events for the zoom modal.
   * Supports: ESC (close), ArrowRight (next), ArrowLeft (previous).
   * @param event - Keyboard event
   */
  private onKeyDown(event: KeyboardEvent): void {
    if (!this.showZoomModal) return;
    switch (event.key) {
      case 'Escape':
        this.closeZoomModal();
        break;
      case 'ArrowRight':
        this.nextZoomImage();
        break;
      case 'ArrowLeft':
        this.previousZoomImage();
        break;
    }
  }

  /**
   * @description Restores body scroll when modal closes.
   */
  private restoreBodyScroll(): void {
    document.body.style.overflow = 'auto';
  }

  /**
   * @description Returns whether the current zoom image is the first image.
   */
  get isFirstZoom(): boolean {
    return this.currentZoomIndex === 0;
  }

  /**
   * @description Returns whether the current zoom image is the last image.
   */
  get isLastZoom(): boolean {
    return this.currentZoomIndex === this.images.length - 1;
  }
}
