import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  AdvertisementItem,
  CardComponent,
  PaginationComponent,
  SpinnerComponent,
} from 'my-lib-inside';
import {
  BehaviorSubject,
  filter,
  finalize,
  Observable,
  take,
  timeout,
} from 'rxjs';
import { LikersDialogComponent } from 'src/app/components/dialog/likers-dialog/likers-dialog.component';
import { ImageDTO } from 'src/app/interfaces/dtos/image_dto.interface';
import { LikeUserDTO } from 'src/app/interfaces/dtos/like-user.dto';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import { AdvertisementLikesService } from 'src/app/services/path/likes/advertisement-likes.service';
import { ProductService } from 'src/app/services/path/product/product.service';
import {
  mapProductsToAds,
  openAdDetailDialog,
  paginateItems,
} from 'src/app/utils/advertisement-utils';

/**
 * @category Components
 *
 * @description SettingsUserAdvertisementComponent is responsible for displaying
 * and managing user advertisements. Handles pagination, viewing ad details,
 * and listing users who liked each advertisement. Integrates with ProductService,
 * AdvertisementLikesService, and authentication for user context.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Component({
  selector: 'app-settings-user-advertisement',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    CardComponent,
    SpinnerComponent,
    MatIconModule,
  ],
  templateUrl: './settings-user-advertisement.component.html',
  styleUrls: ['./settings-user-advertisement.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsUserAdvertisementComponent implements OnInit {
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
   * @description Path to the spinner image used during loading state.
   */
  spinner = '/t.png';

  /**
   * @description Function wrapper returning spinner path for template bindings.
   * @returns {string}
   */
  getspinner: Function = (): string => this.spinner;

  /**
   * @description Internal loading state subject.
   */
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  /**
   * @description Observable exposing loading state to the template.
   */
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  /**
   * @description Returns current loading state.
   * @returns {boolean} True if loading is active.
   */
  get isLoading(): Function {
    return () => this.isLoadingSubject.value;
  }

  /**
   * @description Checks if the ads belong to the current user.
   * @returns {boolean}
   */
  isUserAd = (): boolean => true;

  /**
   * @description Current user ID.
   */
  userId: number | null = null;

  /**
   * @description Current user image reference.
   */
  image: any;

  /**
   * @description List of advertisements.
   */
  ads: AdvertisementItem[] = [];

  /**
   * @description Pagination settings: page size.
   */
  pageSize: number = 5;

  /**
   * @description Pagination settings: current page index.
   */
  currentPage: number = 0;

  /**
   * @description Current page of advertisements.
   */
  pagedAds: AdvertisementItem[] = [];

  /**
   * @description All advertisements including images.
   */
  pagedAdsWithAllImage: any[] = [];

  /**
   * @description List of advertisement images.
   */
  images: ImageDTO[] = [];

  /**
   * @description Maps advertisement ID to the list of users who liked it.
   */
  likersMap = new Map<number, LikeUserDTO[]>();

  /**
   * @description Tracks loading state of likers per advertisement.
   */
  loadingLikersMap = new Map<number, boolean>();

  /**
   * @description Product service used to fetch active products for the user.
   */
  productService = inject(ProductService);

  /**
   * @description Angular platform identifier to detect browser environment.
   */
  private platformId = inject(PLATFORM_ID);

  /**
   * @description Dialog service for opening modal dialogs.
   */
  private dialog = inject(MatDialog);

  /**
   * @description Authentication service to fetch current user info.
   */
  private authService = inject(AuthGoogleService);

  /**
   * @description Service for handling advertisement likes.
   */
  advertisementLikeService = inject(AdvertisementLikesService);

  /**
   * @inheritdoc
   * @description Component initialization lifecycle hook.
   * Checks platform and triggers fetching of user ID and advertisements.
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.getUserIdSimply();
    }
  }

  /**
   * @description Retrieves the current user ID with fallback strategies:
   * immediate value, observable with timeout, or sessionStorage.
   * @returns {void}
   */
  private getUserIdSimply(): void {
    const userInfo = this.authService.getCurrentUserInfo();

    if (userInfo && userInfo.userId) {
      this.userId = +userInfo.userId;
      this.getActiveProductsByUserId();
      return;
    }

    this.authService.userInfo$
      .pipe(
        filter((info) => !!info && !!info.userId),
        take(1),
        timeout(2000),
      )
      .subscribe({
        next: (info) => {
          this.userId = +info!.userId;
          this.getActiveProductsByUserId();
        },
        error: () => {
          if (typeof sessionStorage !== 'undefined') {
            const storedUserInfo = sessionStorage.getItem('user_info');
            if (storedUserInfo) {
              try {
                const parsedInfo = JSON.parse(storedUserInfo);
                this.userId = +parsedInfo.userId;
                this.getActiveProductsByUserId();
              } catch (e) {
                console.error('Errore parsing sessionStorage:', e);
              }
            }
          }
        },
      });
  }

  /**
   * @description Fetches active products/ads for the current user and maps them to ads.
   * Updates the paginated list.
   * @returns {void}
   */
  private getActiveProductsByUserId(): void {
    this.isLoadingSubject.next(true);

    this.productService
      .getActiveProductsByUserId(this.userId!)
      .pipe(finalize(() => this.isLoadingSubject.next(false)))
      .subscribe({
        next: (val: any[]) => {
          this.pagedAdsWithAllImage = val;
          this.ads = mapProductsToAds(val);
          this.updatePagedAds();
        },
        error: (err: HttpErrorResponse) => {},
      });
  }

  /**
   * @description Updates the current page of paginated advertisements.
   * @returns {void}
   */
  private updatePagedAds(): void {
    this.pagedAds = paginateItems(this.ads, this.currentPage, this.pageSize);
  }

  /**
   * @description Handles page change event from the pagination component.
   * @param {object} event - Event containing pageIndex and pageSize.
   */
  onPageChanged(event: { pageIndex: number; pageSize: number }) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedAds();
  }

  /**
   * @description Opens advertisement detail dialog for a selected ad.
   * @param {number} adId - Advertisement ID.
   */
  onAdSelected(adId: number) {
    console.warn(this.ads);
    openAdDetailDialog(
      this.dialog,
      this.ads,
      this.pagedAdsWithAllImage,
      adId,
      this.isUserAd,
    );
  }

  /**
   * @description Determines whether items can be added to cart (currently false).
   * @returns {boolean}
   */
  canAddToCart = (): boolean => false;

  /**
   * @description Handles viewing the likers of an advertisement.
   * @param {any} event - Event containing advertisement ID.
   * @returns {void}
   */
  onViewLikers(event: any): void {
    console.log('onViewLikers chiamato con:', event);
    this.openLikersDialog(event as number);
  }

  /**
   * @description Opens dialog displaying users who liked a specific advertisement.
   * @param {number} advertisementId - Advertisement ID.
   * @returns {void}
   */
  openLikersDialog(advertisementId: number): void {
    console.log('openLikersDialog chiamato con id:', advertisementId);
    const ad = this.ads.find((a) => a.advertisementId === advertisementId);
    console.log('ad trovato:', ad);
    this.dialog.open(LikersDialogComponent, {
      data: {
        advertisementId,
        title: ad?.title ?? '',
      },
      width: window.innerWidth < 430 ? '95vw' : '420px',
      maxWidth: '95vw',
    });
  }
}
