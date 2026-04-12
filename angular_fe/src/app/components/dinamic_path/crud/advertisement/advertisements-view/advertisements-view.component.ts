import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  PaginationComponent,
  CardComponent,
  AdvertisementItem,
  SpinnerComponent,
  EmptyStateComponent,
} from 'my-lib-inside';
import {
  BehaviorSubject,
  filter,
  finalize,
  map,
  Observable,
  of,
  startWith,
  Subject,
  take,
  takeUntil,
  timeout,
} from 'rxjs';
import { ImageDTO } from 'src/app/interfaces/dtos/image_dto.interface';
import { LikeRequestDTO } from 'src/app/interfaces/dtos/like_request_dto';
import { AdvertisementLikesService } from 'src/app/services/path/likes/advertisement-likes.service';
import { ProductService } from 'src/app/services/path/product/product.service';
import {
  calculatePriceStep,
  enrichWithCurrencySymbol,
  formatCategoryPath,
  formatPriceAdv,
  mapProductsToAds,
  openAdDetailDialog,
  paginateItems,
} from 'src/app/utils/advertisement-utils';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { showSnackBar } from 'src/app/utils/snackbar.utils';
import { ProductSearchCriteriaDTO } from 'src/app/interfaces/dtos/criteria_dto/product_search_criteria_dto.interface';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
  AbstractControlOptions,
  AbstractControl,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faChevronDown,
  faChevronUp,
  faFilter,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { GeocodingService } from 'src/app/services/geo/geocoding.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { CountryResponse } from 'src/app/interfaces/country/country_response';
import {
  countryCodeToEmoji,
  extractCountryName,
  extractCountryNameReplace,
} from 'src/app/utils/country.utils';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import {
  removeUndefinedFields,
  sanitizeDateToDate,
  sanitizeNumber,
  sanitizeValue,
} from 'src/app/utils/form-utils';
import { getPriceRange } from 'src/app/utils/price-utils';
import { CartService } from 'src/app/services/path/cart_order_payment/cart/cart.service';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import Swal from 'sweetalert2';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

/**
 * @category Components
 *
 * @component AdvertisementsViewComponent
 * @description
 * Main view component displaying advertisements for a specific category.
 * Responsibilities include:
 * - Loading ads via ProductService.
 * - Enriching ads with currency symbols using GeocodingService.
 * - Managing likes for the current user.
 * - Providing advanced search/filter functionality with a reactive form.
 * - Implementing client-side pagination.
 * - Adding items to the cart via CartService.
 * - Integrating autocomplete for countries and cities.
 * - Handling price range filtering and UI drag events.
 * - SSR-safe initialization and cleanup via OnInit/OnDestroy.
 * Integrated with DashboardComponent using ngComponentOutletInputs.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Component({
  selector: 'app-advertisements-view',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    CardComponent,
    SpinnerComponent,
    MatSnackBarModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    MatAutocompleteModule,
    MatInputModule,
    EmptyStateComponent,
  ],
  templateUrl: './advertisements-view.component.html',
  styleUrls: ['./advertisements-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvertisementsViewComponent implements OnInit, OnDestroy {
  // ───────────────────────────────────────────── Input ─────────────────────────────────────────────

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

  // ───────────────────────────────────────────── Icon FontAwesome ─────────────────────────────────────────────

  /**
   * @description FontAwesome search icon for the search button.
   * @type {IconDefinition}
   */
  faSearch: IconDefinition = faSearch;

  /**
   * @description FontAwesome arrow-up icon for toggling filter collapse.
   * @type {IconDefinition}
   */
  faChevronUp: IconDefinition = faChevronUp;

  /**
   * @description FontAwesome arrow-down icon for toggling filter expansion.
   * @type {IconDefinition}
   */
  faChevronDown: IconDefinition = faChevronDown;

  /**
   * @description FontAwesome filter icon (reserved for potential UI extensions).
   * @type {IconDefinition}
   */
  faFilter: IconDefinition = faFilter;

  // ───────────────────────────────────────────── SERVICES ─────────────────────────────────────────────

  /**
   * @description Injected CartService to manage shopping cart state.
   */
  private cartStateService = inject(CartService);

  /**
   * @description ProductService instance used to retrieve product data.
   */
  productService = inject(ProductService);

  /**
   * @description AdvertisementLikesService to manage likes on advertisements.
   */
  advertisementLikeService = inject(AdvertisementLikesService);

  /**
   * @description PLATFORM_ID injection token to check for browser environment.
   */
  private platformId = inject(PLATFORM_ID);

  /**
   * @description Angular Material Dialog for opening ad detail dialogs.
   */
  private dialog = inject(MatDialog);

  /**
   * @description ChangeDetectorRef to trigger manual change detection.
   */
  private cdr = inject(ChangeDetectorRef);

  /**
   * @description MatSnackBar for showing user notifications.
   */
  private snackBar = inject(MatSnackBar);

  /**
   * @description FormBuilder instance for creating reactive forms.
   */
  fb = inject(FormBuilder);

  /**
   * @description GeocodingService for country/city data and currency symbols.
   */
  private geocodingService = inject(GeocodingService);

  /**
   * @description NgZone for running code outside Angular's change detection.
   */
  private ngZone = inject(NgZone);

  /**
   * @description AuthGoogleService for retrieving current user info.
   */
  private authService = inject(AuthGoogleService);

  // ───────────────────────────────────────────── Loading ─────────────────────────────────────────────

  /**
   * @description Path to spinner image for loading states.
   * @type {string}
   */
  spinner: string = '/t.png';

  /**
   * @description Getter function to provide the spinner path to child components.
   * @returns {string} Path to spinner image.
   */
  getspinner: Function = (): string => this.spinner;

  /**
   * @description Internal BehaviorSubject controlling loading state.
   */
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  /**
   * @description Public Observable to monitor loading state in templates.
   * @type {Observable<boolean>}
   */
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  /**
   * @description Getter function returning current loading state value.
   * Used in templates as `[isLoading]="isLoading()"`.
   * @returns {boolean} Current loading state.
   */
  get isLoading(): Function {
    return () => this.isLoadingSubject.value;
  }

  // ───────────────────────────────────────────── Data ads ─────────────────────────────────────────────

  /**
   * @description ID of the currently authenticated user, null if not logged in.
   * @type {number | null}
   */
  currentUserId: number | null = null;

  /**
   * @description Complete list of advertisements retrieved from server.
   * @type {AdvertisementItem[]}
   */
  ads: AdvertisementItem[] = [];

  /**
   * @description List of advertisements after applying search/filter criteria.
   * @type {AdvertisementItem[]}
   */
  filteredAds: AdvertisementItem[] = [];

  /**
   * @description Number of ads per page for pagination.
   * @type {number}
   */
  pageSize: number = 5;

  /**
   * @description Current page index (0-based) for pagination.
   * @type {number}
   */
  currentPage: number = 0;

  /**
   * @description Subset of filteredAds displayed on the current page.
   * @type {AdvertisementItem[]}
   */
  pagedAds: AdvertisementItem[] = [];

  /**
   * @description Full product list with images for detailed dialogs.
   * @type {any[]}
   */
  pagedAdsWithAllImage: any[] = [];

  /** @description Single image reference (optional) for ads. */
  images: ImageDTO[] = [];

  /** @description Map of country name (lowercase) to currency symbol. */
  countryCurrencySymbolMap = new Map<string, string>();

  /** @description Image references for ads. */
  image: any;

  // ───────────────────────────────────────────── Search form ─────────────────────────────────────────────

  /** @description True if normal initial load (without filters). */
  searchForm!: FormGroup;

  /** @description Visibility of search filter panel. */
  isSearchOpen = false;

  /** @description True if normal initial load (without filters). */
  isNormalLoad = true;

  // ───────────────────────────────────────────── Autocomplete country/city ─────────────────────────────────────────────

  /** @description List of countries for autocomplete e.g., "🇮🇹 Italy". */
  countries: string[] = [];

  /** @description Filtered countries observable for autocomplete. */
  filteredCountries: Observable<string[]> = of([]);

  /** @description List of cities for selected country. */
  cities: string[] = [];

  //** @description Filtered cities observable for autocomplete. */
  filteredCities: Observable<string[]> = of([]);

  /** @description Raw countries data fetched from API. */
  allCountries: any[] = [];

  /** @description Currently selected country (lowercase, no emoji). */
  countryName = '';

  // ───────────────────────────────────────────── Price range ─────────────────────────────────────────────

  /** @description Shows price tooltip on desktop. */
  showPriceValues = false;

  /** @description True while dragging the min thumb of slider. */
  isDraggingMin = false;

  /** @description True while dragging the max thumb of slider. */
  isDraggingMax = false;

  /** @description Minimum price in loaded advertisements. */
  minPriceInAds = 0;

  /** @description Maximum price in loaded advertisements. */
  maxPriceInAds = 0;

  // ───────────────────────────────────────────── Tooltip title ─────────────────────────────────────────────

  /** @description Show title tooltip. */
  showTooltip = false;

  // ───────────────────────────────────────────── Destroy ─────────────────────────────────────────────

  /** @description Subject to unsubscribe from all observables on destroy. */
  private destroy$ = new Subject<void>();

  // ───────────────────────────────────────────── Lifecycle ─────────────────────────────────────────────

  /**
   * @inheritdoc
   * @description Initializes the component only on the browser (SSR-safe).
   * It performs the following steps in sequence:
   * 1. Retrieves the current user ID.
   * 2. Initializes the search form.
   * 3. Loads advertisements.
   * 4. Loads the list of countries.
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.getCurrentUserId();
      this.initSearchForm();
      this.getProductsNotDeleted();
      this.getCountries();
      this.listenToCartChanges();
    }
  }

  /**
   * @inheritdoc
   * @description Completes the `destroy$` Subject to unsubscribe from all Observables.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ───────────────────────────────────────────── Current user ─────────────────────────────────────────────

  /**
   * @description Retrieves the current user's ID in a resilient manner.
   * The method first tries synchronous retrieval via `AuthGoogleService.getCurrentUserInfo()`,
   * then subscribes to `userInfo$` with a 2-second timeout, and finally falls back to `sessionStorage`.
   */
  private getCurrentUserId(): void {
    const userInfo = this.authService.getCurrentUserInfo();

    if (userInfo?.userId) {
      this.currentUserId = +userInfo.userId;
      return;
    }

    this.authService.userInfo$
      .pipe(
        filter((info) => !!info?.userId),
        take(1),
        timeout(2000),
      )
      .subscribe({
        next: (info) => {
          this.currentUserId = +info!.userId;
        },
        error: () => {
          if (typeof sessionStorage !== 'undefined') {
            try {
              const stored = sessionStorage.getItem('user_info');
              this.currentUserId = stored ? +JSON.parse(stored).userId : null;
            } catch {
              this.currentUserId = null;
            }
          } else {
            this.currentUserId = null;
          }
        },
      });
  }

  // ───────────────────────────────────────────── Ownership / Like helpers ─────────────────────────────────────────────

  /**
   * @description Determines whether the given advertisement was created by the current user.
   * @param {AdvertisementItem} ad - The advertisement to check.
   * @returns {boolean} True if the advertisement belongs to the current user.
   */
  isUserAd(ad: AdvertisementItem): boolean {
    return !!this.currentUserId && ad.createdBy?.userId === this.currentUserId;
  }

  /**
   * @description Determines if the current user is allowed to like the given advertisement.
   * Conditions: the user must be authenticated and not the owner of the ad.
   * @param {AdvertisementItem} ad - The advertisement to check.
   * @returns {boolean} True if the user can like the advertisement.
   */
  canUserLikeAd(ad: AdvertisementItem): boolean {
    return !!this.currentUserId && !this.isUserAd(ad);
  }

  /**
   * @description Returns a function to check if a given advertisement belongs to the current user.
   * This is useful for passing ownership logic to child components like `lib-card`.
   * @param {AdvertisementItem} ad - The reference advertisement.
   * @returns {Function} A function that, when called, returns `true` if the advertisement belongs to the current user.
   */
  getIsUserAdForCard(ad: AdvertisementItem): () => boolean {
    return () => this.isUserAd(ad);
  }

  /**
   * @description Returns a function to determine if the current user can like a given advertisement.
   * Useful for passing like logic to child components like `lib-card`.
   * @param {AdvertisementItem} ad - The reference advertisement.
   * @returns {Function} A function that, when called, returns `true` if the user can like the advertisement.
   */
  getCanLikeForCard(ad: AdvertisementItem): () => boolean {
    return () => this.canUserLikeAd(ad);
  }

  /**
   * @description Returns a function that checks if a given advertisement belongs to the current user.
   * Used in `openAdDetailDialog` to hide actions from non-owners.
   * @returns {function(ad?: AdvertisementItem): boolean} A function that returns true if the ad belongs to the current user.
   */
  getIsUserAdFunction(): (ad?: AdvertisementItem) => boolean {
    return (ad?: AdvertisementItem) => !!ad && this.isUserAd(ad);
  }

  // ───────────────────────────────────────────── Loading ads ─────────────────────────────────────────────

  /**
   * @description Loads all non-deleted advertisements for the current category.
   * The process includes mapping products to advertisement items, enriching them
   * with currency symbols, updating pagination, and retrieving user likes.
   */
  private getProductsNotDeleted(): void {
    this.isNormalLoad = true;
    this.isLoadingSubject.next(true);

    const criteria: ProductSearchCriteriaDTO = {
      type: formatCategoryPath(this.category),
    };

    const isBrowser = isPlatformBrowser(this.platformId);

    this.productService
      .getProductsNotDeletedByType(criteria)
      .pipe(isBrowser ? takeUntil(this.destroy$) : take(1))
      .subscribe({
        next: (products: any[]) => {
          this.pagedAdsWithAllImage = products;
          this.ads = mapProductsToAds(products);
          this.filteredAds = [...this.ads];

          const countriesInProducts = Array.from(
            new Set(
              this.ads
                .map((ad) =>
                  extractCountryNameReplace(
                    ad.productCountry || '',
                  ).toLowerCase(),
                )
                .filter(Boolean),
            ),
          );

          this.geocodingService
            .getCountriesAdvertisementView()
            .pipe(
              isBrowser
                ? finalize(() => this.isLoadingSubject.next(false))
                : take(1),
            )
            .subscribe({
              next: (allCountries) => {
                this.countryCurrencySymbolMap.clear();
                allCountries.forEach((c) => {
                  const name = c.name.common.toLowerCase();
                  if (!countriesInProducts.includes(name)) return;
                  const code = Object.keys(c.currencies || {})[0];
                  const symbol = c.currencies?.[code]?.symbol || '';
                  this.countryCurrencySymbolMap.set(name, symbol);
                });

                this.ads = this.ads.map((ad) => this.enrichWithCurrency(ad));
                this.filteredAds = [...this.ads];
                this.updatePagedAds();
                this.getAllLikesByUser();
                this.analyzePrices(this.ads);
                this.cdr.markForCheck();

                if (isBrowser)
                  showSnackBar(this.snackBar, 'Products loaded successfully');
              },
              error: (err) => {
                this.isLoadingSubject.next(false);
                this.ads = this.ads.map((ad) => ({
                  ...ad,
                  productCurrencySymbol: '',
                }));
                this.filteredAds = [...this.ads];
                this.updatePagedAds();
                this.getAllLikesByUser();
                this.analyzePrices(this.ads);
                this.cdr.markForCheck();
              },
            });
        },
        error: (err: HttpErrorResponse) => {
          this.isLoadingSubject.next(false);
          if (isBrowser) showSnackBar(this.snackBar, `${err.error.message}`);
        },
      });
  }

  /**
   * @description Updates the `pagedAds` property based on the current `filteredAds` and pagination settings.
   */
  private updatePagedAds(): void {
    this.pagedAds = paginateItems(
      this.filteredAds,
      this.currentPage,
      this.pageSize,
    );
  }

  /**
   * @description Handles the page change event from `lib-pagination`.
   * Updates the current page and page size, then refreshes paged advertisements.
   * @param {{ pageIndex: number, pageSize: number }} event - Object containing updated pagination info.
   */
  onPageChanged(event: { pageIndex: number; pageSize: number }): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedAds();
  }

  /**
   * @description Opens the detail dialog for the selected advertisement.
   * Passes the current list, full dataset and ownership function to the dialog.
   * @param {number} adId - The unique identifier of the advertisement to display.
   * @returns {void}
   */
  onAdSelected(adId: number): void {
    openAdDetailDialog(
      this.dialog,
      this.filteredAds,
      this.pagedAdsWithAllImage,
      adId,
      this.getIsUserAdFunction(),
    );
  }

  // ───────────────────────────────────────────── Like ─────────────────────────────────────────────

  /**
   * @description Handles the like state change emitted by child components.
   * Validates user authentication and ownership before sending the update request.
   * In case of HTTP error, restores the previous like state.
   * @param {{ id: number; liked: boolean }} event - Object containing advertisement ID and new like state.
   * @returns {void}
   */
  handleLikeChange(event: { id: number; liked: boolean }): void {
    const ad = this.ads.find((a) => a.advertisementId === event.id);
    if (!ad) return;

    if (!this.currentUserId) {
      showSnackBar(this.snackBar, 'Please login to like ads');
      return;
    }
    if (this.isUserAd(ad)) {
      showSnackBar(this.snackBar, 'You cannot like your own ad');
      return;
    }

    this.advertisementLikeService
      .updateLike(this.currentUserId, event.id, {
        liked: event.liked,
      } as LikeRequestDTO)
      .subscribe({
        next: () => {
          const update = (list: AdvertisementItem[]) => {
            const i = list.findIndex((a) => a.advertisementId === event.id);
            if (i !== -1) {
              list[i].liked = event.liked;
              list[i].likes = (list[i].likes || 0) + (event.liked ? 1 : -1);
            }
          };
          update(this.ads);
          update(this.filteredAds);
          this.updatePagedAds();
          this.cdr.markForCheck();
          showSnackBar(
            this.snackBar,
            event.liked ? 'Ad liked!' : 'Like removed',
          );
        },
        error: () => {
          showSnackBar(this.snackBar, 'Error while updating the like');
          const i = this.ads.findIndex((a) => a.advertisementId === event.id);
          if (i !== -1) this.ads[i].liked = !event.liked;
        },
      });
  }

  /**
   * @description Retrieves all likes associated with the current user
   * and updates the `liked` state of each advertisement accordingly.
   * If the user is not authenticated, all ads are marked as not liked.
   * @returns {void}
   */
  getAllLikesByUser(): void {
    if (!this.currentUserId) {
      this.ads = this.ads.map((ad) => ({ ...ad, liked: false }));
      this.filteredAds = [...this.ads];
      this.updatePagedAds();
      this.cdr.markForCheck();
      return;
    }

    this.advertisementLikeService
      .getAllLikesByUser(this.currentUserId)
      .subscribe({
        next: (response) => {
          const likedIds = new Set<number>(
            response.data.map((l: any) => l.advertisementId),
          );
          this.ads = this.ads.map((ad) => ({
            ...ad,
            liked: this.isUserAd(ad)
              ? false
              : likedIds.has(ad.advertisementId!),
          }));
          this.filteredAds = [...this.ads];
          this.updatePagedAds();
          this.cdr.markForCheck();
        },
        error: () => {
          this.ads = this.ads.map((ad) => ({ ...ad, liked: false }));
          this.filteredAds = [...this.ads];
          this.updatePagedAds();
          this.cdr.markForCheck();
        },
      });
  }

  // ───────────────────────────────────────────── Cart ─────────────────────────────────────────────

  /**
   * @description Returns a function that determines whether the current user can add the given advertisement to the cart.
   * This is used for conditional rendering in child components (e.g., enabling/disabling add-to-cart button).
   * @param {AdvertisementItem} ad - The advertisement to evaluate.
   * @returns {Function} A function that returns `true` if the advertisement does not belong to the current user.
   */
  getCanAddToCartForCard(ad: AdvertisementItem): () => boolean {
    return () => !this.isUserAd(ad);
  }

  /**
   * @description Returns a function that checks whether the maximum available quantity of the given advertisement
   * has already been added to the cart. Used to disable further additions in UI components.
   * @param {AdvertisementItem} ad - The advertisement to evaluate.
   * @returns {Function} A function that returns `true` if no more items can be added to the cart.
   */
  getIsMaxQuantityReachedForCard(ad: AdvertisementItem): () => boolean {
    return () => !this.cartStateService.canAddMoreToCart(ad);
  }

  /**
   * @description Subscribes to cart state changes and triggers change detection to keep the UI in sync.
   * Automatically unsubscribes on component destruction.
   */
  private listenToCartChanges(): void {
    this.cartStateService.cart$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  /**
   * @description Adds the given advertisement to the cart after validating its availability and stock quantity.
   * Prevents adding inactive products or exceeding available stock.
   * @param {AdvertisementItem} ad - The advertisement to add to the cart.
   * @returns {void}
   */
  onAddToCart(ad: AdvertisementItem): void {
    if (!ad.productId || !ad.active || (ad.stockQuantity ?? 0) === 0) {
      showSnackBar(this.snackBar, 'Cannot add product to cart');
      return;
    }

    if (!this.cartStateService.canAddMoreToCart(ad)) {
      showSnackBar(
        this.snackBar,
        `Hai già tutta la disponibilità di "${ad.title}" nel carrello`,
      );
      return;
    }

    this.cartStateService.addProductToCart(ad);
    showSnackBar(this.snackBar, `"${ad.title}" added to cart`);
  }

  // ───────────────────────────────────────────── Search form ─────────────────────────────────────────────

  /**
   * @description Initializes the search form with validation rules and reactive listeners.
   * Configures autocomplete behavior for country and city fields
   * and applies a custom group validator for price and date ranges.
   * @returns {void}
   */
  private initSearchForm(): void {
    const formOptions: AbstractControlOptions = {
      validators: this.searchValidator,
    };

    this.searchForm = this.fb.group(
      {
        country: [''],
        city: [{ value: '', disabled: true }],
        minPrice: [null, [Validators.min(0)]],
        maxPrice: [null, [Validators.min(0)]],
        title: ['', [Validators.maxLength(100)]],
        condition: [''],
        agency: [false],
        minDate: [''],
        maxDate: [''],
      },
      formOptions,
    );

    this.ngZone.runOutsideAngular(() => {
      this.searchForm
        .get('country')
        ?.valueChanges.pipe(startWith(''), takeUntil(this.destroy$))
        .subscribe((country) => {
          const cityCtrl = this.searchForm.get('city');
          if (country?.trim()) {
            cityCtrl?.enable({ emitEvent: false });
            cityCtrl?.setValue('', { emitEvent: false });
            this.getCitiesForCountry(country);
          } else {
            cityCtrl?.disable({ emitEvent: false });
            cityCtrl?.setValue('', { emitEvent: false });
            this.cities = [];
            this.filteredCities = of([]);
          }
        });

      this.filteredCountries = this.searchForm
        .get('country')!
        .valueChanges.pipe(
          startWith(''),
          map((v) => this.filterCountries(v || '')),
        );
    });
  }

  /**
   * @description Custom validator for the search form.
   * Ensures that price and date ranges are logically valid.
   * @param {AbstractControl} control - The form group to validate.
   * @returns {ValidationErrors | null} Validation errors object or null if valid.
   */
  private searchValidator(control: AbstractControl): ValidationErrors | null {
    const g = control as FormGroup;
    const minP = g.get('minPrice')?.value;
    const maxP = g.get('maxPrice')?.value;
    const minD = g.get('minDate')?.value;
    const maxD = g.get('maxDate')?.value;
    const errors: ValidationErrors = {};

    if (minP !== null && maxP !== null && minP > maxP) {
      errors['priceRange'] =
        'Il prezzo minimo non può essere maggiore del massimo';
    }
    if (minD && maxD && new Date(minD) > new Date(maxD)) {
      errors['dateRange'] =
        'La data minima non può essere maggiore della massima';
    }
    return Object.keys(errors).length ? errors : null;
  }

  /**
   * @description Toggles the visibility of the search filters panel.
   * @returns {void}
   */
  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
  }

  /**
   * @description Applies search filters by validating the form,
   * ensuring at least one filter is set, and invoking the API
   * with a sanitized ProductSearchCriteriaDTO.
   * @returns {void}
   */
  applySearch(): void {
    this.isNormalLoad = false;

    if (!this.searchForm || this.searchForm.invalid) {
      this.showFormErrors();
      return;
    }

    const formValue = this.searchForm.value;
    if (!this.validateSearchCriteria(formValue)) return;

    this.isLoadingSubject.next(true);

    this.productService
      .getProductsNotDeletedByType(this.buildSearchCriteria(formValue))
      .pipe(finalize(() => this.isLoadingSubject.next(false)))
      .subscribe({
        next: (products: any[]) => this.handleSearchSuccess(products),
        error: (err: HttpErrorResponse) => this.handleSearchError(err),
      });
  }

  /**
   * @description Validates that at least one search filter is provided
   * before submitting the request to the backend.
   * Prevents unnecessary API calls with empty criteria.
   * @param {any} formValue - The current values of the search form.
   * @returns {boolean} True if at least one filter is set, otherwise false.
   */
  private validateSearchCriteria(formValue: any): boolean {
    const hasFilters =
      formValue.country?.trim() ||
      formValue.city?.trim() ||
      formValue.title?.trim() ||
      formValue.condition?.trim() ||
      formValue.minPrice != null ||
      formValue.maxPrice != null ||
      formValue.minDate?.trim() ||
      formValue.maxDate?.trim() ||
      formValue.agency === true;

    if (!hasFilters) {
      showSnackBar(this.snackBar, 'Please enter at least one search criterion');
      return false;
    }
    return true;
  }

  /**
   * @description Builds a sanitized ProductSearchCriteriaDTO object
   * from the search form values, removing undefined fields
   * and normalizing data before sending it to the API.
   * @param {any} formValue - The current values of the search form.
   * @returns {ProductSearchCriteriaDTO} The constructed search criteria object.
   */
  private buildSearchCriteria(formValue: any): ProductSearchCriteriaDTO {
    const criteria: any = {
      type: formatCategoryPath(this.category),
      country: sanitizeValue(formValue.country),
      city: sanitizeValue(formValue.city),
      title: sanitizeValue(formValue.title),
      condition: sanitizeValue(formValue.condition),
      agency: formValue.agency ? 'true' : undefined,
      minDate: sanitizeDateToDate(formValue.minDate),
      maxDate: sanitizeDateToDate(formValue.maxDate),
    };

    const min = sanitizeNumber(formValue.minPrice);
    const max = sanitizeNumber(formValue.maxPrice);
    if (min !== undefined) criteria.minPrice = min;
    if (max !== undefined) criteria.maxPrice = max;

    return removeUndefinedFields(criteria);
  }

  /**
   * @description Handles successful search response by updating
   * advertisements, filtered data, pagination, and like states.
   * Also provides user feedback through a notification message.
   * @param {any[]} products - The list of products returned by the API.
   * @returns {void}
   */
  private handleSearchSuccess(products: any[]): void {
    this.pagedAdsWithAllImage = products;
    this.ads = mapProductsToAds(products);
    this.filteredAds = [...this.ads];
    this.updatePagedAds();
    this.getAllLikesByUser();
    this.cdr.markForCheck();

    showSnackBar(
      this.snackBar,
      products.length > 0
        ? 'Filters applied successfully'
        : 'No ads found with the applied filters',
    );
  }

  /**
   * @description Handles search errors by clearing current data
   * and displaying an appropriate feedback message to the user.
   * @param {HttpErrorResponse} err - The HTTP error returned by the API.
   * @returns {void}
   */
  private handleSearchError(err: HttpErrorResponse): void {
    this.pagedAdsWithAllImage = [];
    this.ads = [];
    this.filteredAds = [];
    this.updatePagedAds();
    this.cdr.markForCheck();

    showSnackBar(
      this.snackBar,
      err.status === 404
        ? 'No ads found with the applied filters'
        : 'Error during search. Please try again later',
    );
  }

  /**
   * @description Displays validation error messages from the search form
   * using snackbar notifications.
   * @returns {void}
   */
  private showFormErrors(): void {
    if (this.searchForm?.errors?.['priceRange']) {
      showSnackBar(this.snackBar, this.searchForm.errors['priceRange']);
    }
    if (this.searchForm?.errors?.['dateRange']) {
      showSnackBar(this.snackBar, this.searchForm.errors['dateRange']);
    }
  }

  /**
   * @description Resets all search filters after user confirmation
   * and reloads the original dataset.
   * @returns {void}
   */
  resetSearch(): void {
    Swal.fire({
      title: 'Do you want to reset the filters?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.searchForm.reset();
        this.searchForm.patchValue({ minPrice: null, maxPrice: null });
        this.getProductsNotDeleted();
      }
    });
  }

  // ───────────────────────────────────────────── Country & City ─────────────────────────────────────────────

  /**
   * @description Retrieves the list of countries from the API,
   * filters relevant entries, and initializes autocomplete behavior.
   * @returns {void}
   */
  getCountries(): void {
    this.geocodingService.getCountries().subscribe({
      next: (countries: any[]) => {
        this.allCountries = countries.filter(
          (c) => c.region && c.region !== '' && c.population > 100000, // ← soglia più alta per escludere territori piccoli
        );
        this.countries = this.allCountries.map(
          (c) => `${countryCodeToEmoji(c.cca2)} ${c.name.common}`,
        );

        this.filteredCountries = this.searchForm.controls[
          'country'
        ].valueChanges.pipe(
          startWith(''),
          map((v) => this.filterCountries(v || '')),
        );
        this.cdr.markForCheck();
      },
      error: () => showSnackBar(this.snackBar, 'Country loading error'),
    });
  }

  /**
   * @description Filters the list of available countries based on user input.
   * Matching is case-insensitive.
   * @param {string} value - The input search string.
   * @returns {string[]} The filtered list of country names.
   */
  private filterCountries(value: string): string[] {
    const v = value.toLowerCase();
    return this.countries.filter((c) => c.toLowerCase().includes(v));
  }

  /**
   * @description Loads cities for the selected country and configures
   * autocomplete filtering for the city field.
   * @param {string} countryName - The selected country name (with or without emoji prefix).
   * @returns {void}
   */
  getCitiesForCountry(countryName: string): void {
    if (!countryName) {
      this.cities = [];
      this.filteredCities = of([]);
      return;
    }

    const clean = extractCountryName(countryName).toLowerCase();
    this.countryName = clean;

    this.geocodingService.getCities(clean).subscribe({
      next: (response: CountryResponse) => {
        this.cities = Array.isArray(response.data) ? response.data : [];
        this.filteredCities = this.searchForm.controls[
          'city'
        ].valueChanges.pipe(
          startWith(''),
          map((v) => this.filterCities(v || '')),
        );
        this.cdr.markForCheck();
      },
      error: () => {
        this.cities = [];
        this.filteredCities = of([]);
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * @description Filters the list of available cities based on user input.
   * Matching is case-insensitive.
   * @param {string} value - The input search string.
   * @returns {string[]} The filtered list of city names.
   */
  private filterCities(value: string): string[] {
    const v = value.toLowerCase();
    return this.cities.filter((c) => c.toLowerCase().includes(v));
  }

  /**
   * @description Handles country selection from the autocomplete component,
   * resets the city field and loads cities for the selected country.
   * @param {MatAutocompleteSelectedEvent} event - The selection event emitted by the autocomplete.
   * @returns {void}
   */
  onCountrySelected(event: MatAutocompleteSelectedEvent): void {
    const selected = event.option.value;
    if (selected) {
      this.searchForm.get('city')?.setValue('');
      this.getCitiesForCountry(selected);
    }
  }

  /**
   * @description Returns the formatted string representation of the selected country for display in the autocomplete input.
   * @param {string} country - The selected country value.
   * @returns {string} The formatted country string or an empty string if undefined.
   */
  displayCountry(country: string): string {
    return country || '';
  }

  /**
   * @description Returns the formatted string representation of the selected city for display in the autocomplete input.
   * @param {string} city - The selected city value.
   * @returns {string} The formatted city string or an empty string if undefined.
   */
  displayCity(city: string): string {
    return city || '';
  }

  // ───────────────────────────────────────────── Price range ─────────────────────────────────────────────

  /**
   * @description Returns the minimum price value derived from the loaded advertisements.
   * Used as the lower bound for the price range slider.
   * @returns {number} The minimum price value.
   */
  get MIN_PRICE(): number {
    return Math.floor(this.minPriceInAds);
  }

  /**
   * @description Returns the maximum price value derived from the loaded advertisements.
   * Used as the upper bound for the price range slider.
   * @returns {number} The maximum price value.
   */
  get MAX_PRICE(): number {
    return Math.ceil(this.maxPriceInAds);
  }

  /** @description Wrapper for `calculatePriceStep` */
  get PRICE_STEP(): number {
    return calculatePriceStep(this.maxPriceInAds);
  }

  /**
   * @description Wrapper for `formatPriceAdv`.
   */
  formatPriceWrapper(price: number, currencySymbol?: string): string {
    return formatPriceAdv(price, this.PRICE_STEP, currencySymbol);
  }

  /**
   * @description Analyzes advertisement prices to determine minimum and maximum values,
   * then updates the corresponding component state and synchronizes the form values.
   * @param {AdvertisementItem[]} ads - The list of advertisements to analyze.
   * @returns {void}
   */
  private analyzePrices(ads: AdvertisementItem[]): void {
    const range = getPriceRange(ads);
    [this.minPriceInAds, this.maxPriceInAds] = range ?? [0, 100];
    this.updatePriceRangeValues();
  }

  /**
   * @description Initializes or updates the price range form controls
   * with default min and max values if not already set by the user.
   * @returns {void}
   */
  private updatePriceRangeValues(): void {
    if (this.searchForm.get('minPrice')?.value == null) {
      this.searchForm.patchValue(
        { minPrice: this.MIN_PRICE },
        { emitEvent: false },
      );
    }
    if (this.searchForm.get('maxPrice')?.value == null) {
      this.searchForm.patchValue(
        { maxPrice: this.MAX_PRICE },
        { emitEvent: false },
      );
    }
    this.cdr.detectChanges();
  }

  /**
   * @description Handles changes to the minimum range slider thumb.
   * Applies step rounding, enforces bounds, and ensures consistency with the max value.
   * @param {Event} event - The native input event from the slider.
   * @returns {void}
   */
  onMinChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let min =
      Math.round(Number(input.value) / this.PRICE_STEP) * this.PRICE_STEP;
    min = Math.max(this.MIN_PRICE, Math.min(this.MAX_PRICE, min));
    if (this.PRICE_STEP < 1) min = +min.toFixed(2);

    let max = this.searchForm.get('maxPrice')?.value ?? this.MAX_PRICE;
    if (min > max) {
      max = min;
      this.searchForm.patchValue(
        { maxPrice: max },
        { emitEvent: false, onlySelf: true },
      );
    }
    this.searchForm.patchValue(
      { minPrice: min },
      { emitEvent: false, onlySelf: true },
    );
    input.value = String(min);
  }

  /**
   * @description Handles changes to the maximum range slider thumb.
   * Applies step rounding, enforces bounds, and ensures consistency with the min value.
   * @param {Event} event - The native input event from the slider.
   * @returns {void}
   */
  onMaxChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let max =
      Math.round(Number(input.value) / this.PRICE_STEP) * this.PRICE_STEP;
    max = Math.max(this.MIN_PRICE, Math.min(this.MAX_PRICE, max));
    if (this.PRICE_STEP < 1) max = +max.toFixed(2);

    let min = this.searchForm.get('minPrice')?.value ?? this.MIN_PRICE;
    if (max < min) {
      min = max;
      this.searchForm.patchValue(
        { minPrice: min },
        { emitEvent: false, onlySelf: true },
      );
    }
    this.searchForm.patchValue(
      { maxPrice: max },
      { emitEvent: false, onlySelf: true },
    );
    input.value = String(max);
  }

  /**
   * @description Calculates the percentage position of the minimum value
   * relative to the total price range. Used for UI positioning.
   * @returns {number} A value between 0 and 100.
   */
  getMinPercent(): number {
    const min = this.searchForm.get('minPrice')?.value ?? this.MIN_PRICE;
    return ((min - this.MIN_PRICE) / (this.MAX_PRICE - this.MIN_PRICE)) * 100;
  }

  /**
   * @description Calculates the percentage position of the maximum value
   * relative to the total price range.
   * @returns {number} A value between 0 and 100.
   */
  getMaxPercent(): number {
    const max = this.searchForm.get('maxPrice')?.value ?? this.MAX_PRICE;
    return ((max - this.MIN_PRICE) / (this.MAX_PRICE - this.MIN_PRICE)) * 100;
  }

  /**
   * @description Calculates the percentage width between minimum and maximum values
   * within the total price range.
   * @returns {number} A value between 0 and 100 representing the selected range width.
   */
  getRangeWidth(): number {
    const min = this.searchForm.get('minPrice')?.value ?? this.MIN_PRICE;
    const max = this.searchForm.get('maxPrice')?.value ?? this.MAX_PRICE;
    return ((max - min) / (this.MAX_PRICE - this.MIN_PRICE)) * 100;
  }

  // ───────────────────────────────────────── Host listeners per drag state ───────────────────────────────────────────

  /**
   * @description Detects which range slider thumb is being dragged
   * and updates the dragging state used for tooltip visibility.
   * @param {MouseEvent} event - The mouse down event.
   * @returns {void}
   */
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    const t = event.target as HTMLElement;
    this.isDraggingMin = t.classList.contains('range-min');
    this.isDraggingMax = t.classList.contains('range-max');
  }

  /**
   * @description Resets the dragging state when the mouse button is released.
   * @returns {void}
   */
  @HostListener('mouseup')
  onMouseUp(): void {
    this.isDraggingMin = false;
    this.isDraggingMax = false;
  }

  // ───────────────────────────────────────────── Utils ─────────────────────────────────────────────

  /** Wrapper for `enrichWithCurrencySymbol` */
  private enrichWithCurrency(ad: AdvertisementItem): AdvertisementItem {
    return enrichWithCurrencySymbol(ad, this.countryCurrencySymbolMap);
  }

  /**
   * @description Returns the currency symbol of the first loaded advertisement.
   * Used as a reference for displaying prices in the UI.
   * @returns {string | undefined} The currency symbol if available.
   */
  get productCurrencySymbol(): string | undefined {
    return this.ads[0]?.productCurrencySymbol;
  }

  /**
   * @description Determines whether there is data available in the database.
   * Returns false only when the initial load has completed and no advertisements are present.
   * @returns {boolean} True if there is data in the database.
   */
  hasDataInDb = (): boolean => !(this.isNormalLoad && this.ads.length === 0);

  /**
   * @description Checks whether the current filtered advertisements list is empty.
   * Used to display empty state UI.
   * @returns {boolean} True if no advertisements match the current filters.
   */
  isEmptyState = (): boolean =>
    this.filteredAds.length === 0 && this.hasDataInDb();

  /**
   * @description Determines whether there is no data at all in the system.
   * Used to display "no data" state UI.
   * @returns {boolean} True if there is no data in the database.
   */
  isNoData = (): boolean => !this.hasDataInDb();

  /**
   * @description Returns the path of the logo used in empty state components.
   * @returns {string} The logo image path.
   */
  getLogoSrc = (): string => 'logo_blue-removebg.png';
}
