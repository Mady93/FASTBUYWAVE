import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChildren,
  QueryList,
  ElementRef,
  OnChanges,
  SimpleChanges,
  PLATFORM_ID,
  ViewChild,
  Inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

/**
 * @fileoverview Animated empty state component with particle effects and HUD grid.
 *
 * @description
 * A visually engaging empty state component that displays when data is not available.
 * Features:
 * - Floating animated particles with random movement
 * - Perspective HUD grid background
 * - Floating logo animation
 * - Responsive to parent container size
 * - Content projection for custom messages
 *
 * @implements {OnChanges}
 * @implements {AfterViewInit}
 *
 * @category Components
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```html
 * <lib-empty-state [show]="!items.length" [logoSrc]="'assets/logo.svg'">
 *   <h3>No items found</h3>
 *   <p>Start adding some items to see them here</p>
 * </lib-empty-state>
 * ```
 *
 * @example
 * ```typescript
 * // With dynamic show condition
 * <lib-empty-state [show]="() => isLoading && !hasData">
 *   <p>Loading your data...</p>
 * </lib-empty-state>
 * ```
 */
@Component({
  selector: 'lib-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent implements OnChanges {
  /**
   * @description Controls visibility of the empty state.
   * Can be a boolean or a function that returns a boolean.
   */
  @Input() show: boolean | (() => boolean) = false;

  /**
   * @description Path to the logo image.
   * Can be a string or a function that returns a string.
   */
  @Input() logoSrc: string | (() => string) = '';

  /**
   * @description Computes whether the component should be visible.
   * @returns Boolean indicating visibility
   */
  get isVisible(): boolean {
    return typeof this.show === 'function' ? this.show() : this.show;
  }

  /**
   * @description Computes the logo source URL.
   * @returns Logo image path
   */
  get logo(): string {
    return typeof this.logoSrc === 'function' ? this.logoSrc() : this.logoSrc;
  }

  /** @description References to all particle elements in the DOM */
  @ViewChildren('particleEl') particleEls!: QueryList<ElementRef>;

  /** @description Reference to the HUD grid canvas element */
  @ViewChild('hudGrid') hudGridRef!: ElementRef<HTMLCanvasElement>;

  /** @description Platform identifier for browser/server detection */
  private platformId: Object;

  /** @description Host element reference */
  private hostEl: ElementRef;

  constructor(@Inject(PLATFORM_ID) platformId: Object, hostEl: ElementRef) {
    this.platformId = platformId;
    this.hostEl = hostEl;
  }

  /** @description Array of 100 particles for animation */
  particles = Array.from({ length: 100 });

  /** @description Container width for particle positioning */
  private containerWidth = 640;

  /** @description Container height for particle positioning */
  private containerHeight = 320;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  /**
   * @inheritdoc
   * @description Lifecycle hook: called after view initialization.
   * Initializes particle animations and HUD grid when visible.
   */
  ngAfterViewInit() {
    if (this.isVisible) {
      this.initParticles();
      this.initHudGrid();
    }
  }

  /**
   * @inheritdoc
   * @description Lifecycle hook: called when input properties change.
   * Re-initializes animations when visibility becomes true.
   * @param changes - Object containing changed input properties
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['show']?.currentValue === true) {
      setTimeout(() => {
        this.initParticles();
        this.initHudGrid();
      }, 50);
    }
  }

  // ── Particle System ────────────────────────────────────────────────────────

  /**
   * @description Initializes the particle animation system.
   * Gets parent container dimensions and starts animations for all particles.
   */
  private initParticles() {
    if (!isPlatformBrowser(this.platformId)) return;

    const parent = this.hostEl.nativeElement.parentElement;
    const rect = parent.getBoundingClientRect();
    this.containerWidth = rect.width || 640;
    this.containerHeight = rect.height || 320;

    this.particleEls.forEach((el) => this.animateParticle(el.nativeElement));
  }

  /**
   * @description Converts a hex color to rgba format.
   * @param hex - Hex color string (e.g., '#1e6ef5')
   * @param alpha - Alpha transparency value (0-1)
   * @returns RGBA color string
   */
  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * @description Animates a single particle with random movement, size, and color.
   * Creates a 3D floating effect using translate3d.
   * @param el - DOM element to animate
   */
  private animateParticle(el: HTMLElement) {
    const size = 3 + Math.random() * 5;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;

    const initX = Math.random() * (this.containerWidth - size);
    const initY = Math.random() * (this.containerHeight - size);
    el.style.left = `${initX}px`;
    el.style.top = `${initY}px`;

    const maxLeft = -initX;
    const maxRight = this.containerWidth - initX - size;
    const maxUp = -initY;
    const maxDown = this.containerHeight - initY - size;

    const range = 150;
    const moveX = Math.max(
      maxLeft,
      Math.min(maxRight, (Math.random() - 0.5) * range * 2),
    );
    const moveY = Math.max(
      maxUp,
      Math.min(maxDown, (Math.random() - 0.5) * range * 2),
    );

    const startZ = Math.random() * 320;
    const endZ = Math.random() * 320;
    const duration = 12000 + Math.random() * 8000;

    const colors = ['#1e6ef5', '#3b82f6', '#6366f1', '#8b5cf6', '#0ea5e9'];
    const color = this.hexToRgba(
      colors[Math.floor(Math.random() * colors.length)],
      0.5 + Math.random() * 0.4,
    );
    el.style.backgroundColor = color;
    el.style.boxShadow = `0 0 8px ${color}`;

    el.animate(
      [
        { transform: `translate3d(0px, 0px, ${startZ}px)`, opacity: 0 },
        {
          transform: `translate3d(${moveX / 2}px, ${moveY / 2}px, ${(startZ + endZ) / 2}px)`,
          opacity: 1,
        },
        {
          transform: `translate3d(${moveX}px, ${moveY}px, ${endZ}px)`,
          opacity: 0,
        },
      ],
      {
        duration,
        iterations: Infinity,
        easing: 'ease-in-out',
        delay: -(Math.random() * duration),
        fill: 'both',
      },
    );
  }

  // ── HUD Grid ──────────────────────────────────────────────────────────────

  /**
   * @description Initializes the HUD grid canvas.
   * Sets canvas dimensions and draws the perspective grid.
   */
  private initHudGrid() {
    if (!isPlatformBrowser(this.platformId)) return;
    const canvas = this.hudGridRef?.nativeElement;
    if (!canvas) return;

    const parent = this.hostEl.nativeElement.parentElement;
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width || 640;
    canvas.height = rect.height || 320;

    this.drawHudGrid(canvas);
  }

  /**
   * @description Draws a perspective HUD grid on the canvas.
   * Creates a vanishing point grid with fade effect.
   * @param canvas - Canvas element to draw on
   */
  private drawHudGrid(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cellSize = 40;

    ctx.clearRect(0, 0, W, H);

    const vanishX = W / 2;
    const vanishY = H * 0.3;
    const rows = 18;
    const cols = 20;

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
    ctx.lineWidth = 0.8;

    // Draw horizontal lines in perspective
    for (let i = 0; i <= rows; i++) {
      const t = i / rows;
      const y = vanishY + (H - vanishY) * t;
      const spreadX = W * 0.5 * t;
      ctx.beginPath();
      ctx.moveTo(vanishX - spreadX, y);
      ctx.lineTo(vanishX + spreadX, y);
      ctx.stroke();
    }

    // Draw vertical lines in perspective
    for (let j = 0; j <= cols; j++) {
      const t = j / cols;
      const bottomX = (W / cols) * j;
      ctx.beginPath();
      ctx.moveTo(vanishX, vanishY);
      ctx.lineTo(bottomX, H);
      ctx.stroke();
    }

    // Apply fade gradient overlay
    const fadeGrad = ctx.createLinearGradient(0, 0, 0, H);
    fadeGrad.addColorStop(0, 'rgba(0,0,0,0)');
    fadeGrad.addColorStop(0.3, 'rgba(0,0,0,0)');
    fadeGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(0, 0, W, H);
  }
}
