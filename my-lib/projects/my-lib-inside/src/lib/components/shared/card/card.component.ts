import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { AdvertisementItem } from '../../../interfaces/advertisement_item.interface';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TruncateWordsPipe } from '../../pipes/truncate_words_pipe/truncate-words.pipe';
import { FormatLikesPipe } from '../../pipes/format_likes_pipe/format-likes.pipe';
import { CommonModule } from '@angular/common';

/**
 * @fileoverview Product card component for displaying advertisement items.
 *
 * @description
 * A comprehensive card component that displays advertisement/product information
 * with support for likes, add to cart, view details, and stock management.
 * Features responsive design, tooltips, and conditional rendering based on user
 * permissions and stock availability.
 *
 * @category Components
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```html
 * <lib-card
 *   [ad]="product"
 *   [maxWords]="20"
 *   [maxWordsTitle]="5"
 *   [canLike]="isLoggedIn"
 *   [canAddToCart]="isAuthenticated"
 *   (viewAd)="onViewProduct($event)"
 *   (likeChanged)="onLikeChanged($event)"
 *   (addToCart)="onAddToCart($event)"
 * ></lib-card>
 * ```
 */
@Component({
  selector: 'lib-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    TruncateWordsPipe,
    MatTooltipModule,
    FormatLikesPipe,
  ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  /** @description Advertisement item data to display */
  @Input() ad!: AdvertisementItem;

  /** @description Maximum number of words to show in description */
  @Input() maxWords: number = 0;

  /** @description Maximum number of words to show in title */
  @Input() maxWordsTitle: number = 0;

  /** @description Emitted when user clicks view details */
  @Output() viewAd = new EventEmitter<number>();

  /** @description Emitted when user likes/unlikes the advertisement */
  @Output() likeChanged = new EventEmitter<{ id: number; liked: boolean }>();

  /** @description Function that returns whether the current user owns this ad */
  @Input() isUserAd: () => boolean = () => false;

  /** @description Emitted when user adds item to cart */
  @Output() addToCart = new EventEmitter<AdvertisementItem>();

  /** @description Function that returns whether user can like this ad */
  @Input() canLike: () => boolean = () => false;

  /** @description Function that returns whether user can add to cart */
  @Input() canAddToCart: () => boolean = () => true;

  /** @description Function that returns whether max quantity is reached in cart */
  @Input() isMaxQuantityReached: () => boolean = () => false;

  /** @description Emitted when user clicks to view likers list */
  @Output() viewLikers = new EventEmitter<number>();

  /** @description Change detector for manual change detection */
  private cdr: ChangeDetectorRef;

  constructor(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  /**
   * @description Handles like button click.
   * If user owns the ad, shows likers list.
   * Otherwise toggles like status if permitted.
   */
  onLikeClick() {
    if (this.isUserAd()) {
      this.viewLikers.emit(this.ad.advertisementId!);
      return;
    }
    if (!this.canLike()) return;
    this.ad.liked = !this.ad.liked;
    this.likeChanged.emit({
      id: this.ad.advertisementId!,
      liked: this.ad.liked,
    });
    this.cdr.markForCheck();
  }

  /**
   * @description Handles view ad click event.
   * @param adId - The advertisement ID to view
   */
  onViewAdClick(adId: number) {
    this.viewAd.emit(adId);
  }

  /**
   * @description Checks if the product is out of stock.
   * @returns True if stock quantity is 0 or undefined
   */
  isOutOfStock(): boolean {
    return (this.ad.stockQuantity ?? 0) === 0;
  }

  /**
   * @description Determines if add to cart button should be disabled.
   * Disabled when out of stock OR max quantity reached in cart.
   * @returns True if button should be disabled
   */
  isAddToCartDisabled(): boolean {
    return this.isOutOfStock() || this.isMaxQuantityReached();
  }

  /**
   * @description Handles add to cart click event.
   * Emits the advertisement if not disabled.
   */
  onAddToCartClick() {
    if (this.isAddToCartDisabled()) return;
    this.addToCart.emit(this.ad);
  }
}
