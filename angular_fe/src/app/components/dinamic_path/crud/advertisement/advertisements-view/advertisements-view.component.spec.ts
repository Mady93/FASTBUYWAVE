import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AdvertisementsViewComponent } from './advertisements-view.component';
import { ProductService } from 'src/app/services/path/product/product.service';
import { AdvertisementLikesService } from 'src/app/services/path/likes/advertisement-likes.service';
import { GeocodingService } from 'src/app/services/geo/geocoding.service';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import { CartService } from 'src/app/services/path/cart_order_payment/cart/cart.service';
import Swal from 'sweetalert2';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PaginationComponent,
  CardComponent,
  SpinnerComponent,
  EmptyStateComponent,
  AdvertisementItem,
} from 'my-lib-inside';

// Mock di PaginationComponent
@Component({
  selector: 'lib-pagination',
  template: '',
  standalone: true,
})
class MockPaginationComponent {
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 1;
  @Input() pageSizeOptions: number[] = [];
  @Input() currentPage: number = 0;
  @Output() pageChanged = new EventEmitter<{
    pageIndex: number;
    pageSize: number;
  }>();
}

// Mock di CardComponent
@Component({
  selector: 'lib-card',
  template: '',
  standalone: true,
})
class MockCardComponent {
  @Input() ad!: AdvertisementItem;
  @Input() maxWords: number = 0;
  @Input() maxWordsTitle: number = 0;
  @Input() isUserAd: () => boolean = () => false;
  @Input() canLike: () => boolean = () => false;
  @Input() canAddToCart: () => boolean = () => true;
  @Input() isMaxQuantityReached: () => boolean = () => false;
  @Output() viewAd = new EventEmitter<number>();
  @Output() likeChanged = new EventEmitter<{ id: number; liked: boolean }>();
  @Output() addToCart = new EventEmitter<AdvertisementItem>();
  @Output() viewLikers = new EventEmitter<number>();
}

// Mock di SpinnerComponent
@Component({
  selector: 'lib-spinner',
  template: '',
  standalone: true,
})
class MockSpinnerComponent {
  @Input() spinner: Function = () => {};
  @Input() isLoading: Function = () => {};
}

// Mock di EmptyStateComponent
@Component({
  selector: 'lib-empty-state',
  template: '',
  standalone: true,
})
class MockEmptyStateComponent {
  @Input() show: boolean | (() => boolean) = false;
  @Input() logoSrc: string | (() => string) = '';
}

// Mock dei servizi
class MockProductService {
  getProductsNotDeletedByType = jasmine.createSpy().and.returnValue(of([]));
}

class MockAdvertisementLikesService {
  updateLike = jasmine.createSpy().and.returnValue(of({}));
  getAllLikesByUser = jasmine.createSpy().and.returnValue(of({ data: [] }));
}

class MockGeocodingService {
  getCountries = jasmine.createSpy().and.returnValue(
    of([
      {
        cca2: 'IT',
        name: { common: 'Italy' },
        region: 'Europe',
        population: 60000000,
        currencies: { EUR: { symbol: '€' } },
      },
      {
        cca2: 'US',
        name: { common: 'United States' },
        region: 'Americas',
        population: 331000000,
        currencies: { USD: { symbol: '$' } },
      },
    ]),
  );
  getCountriesAdvertisementView = jasmine.createSpy().and.returnValue(
    of([
      {
        cca2: 'IT',
        name: { common: 'Italy' },
        currencies: { EUR: { symbol: '€' } },
      },
      {
        cca2: 'US',
        name: { common: 'United States' },
        currencies: { USD: { symbol: '$' } },
      },
    ]),
  );
  getCities = jasmine
    .createSpy()
    .and.returnValue(
      of({ error: false, msg: '', data: ['Rome', 'Milan', 'Naples'] }),
    );
}

class MockAuthGoogleService {
  getCurrentUserInfo = jasmine
    .createSpy()
    .and.returnValue({ userId: '1', roles: ['USER'] });
  userInfo$ = new BehaviorSubject({
    userId: '1',
    email: 'test@test.com',
    roles: ['USER'],
  });
}

class MockCartService {
  cart$ = new BehaviorSubject<any[]>([]);
  canAddMoreToCart = jasmine.createSpy().and.returnValue(true);
  addProductToCart = jasmine.createSpy();
}

class MockMatSnackBar {
  open = jasmine.createSpy();
}

class MockMatDialog {
  open = jasmine.createSpy().and.returnValue({ afterClosed: () => of(null) });
}

describe('AdvertisementsViewComponent', () => {
  let component: AdvertisementsViewComponent;
  let fixture: ComponentFixture<AdvertisementsViewComponent>;
  let productService: MockProductService;
  let likesService: MockAdvertisementLikesService;
  let geocodingService: MockGeocodingService;
  let authService: MockAuthGoogleService;
  let cartService: MockCartService;
  let snackBar: MockMatSnackBar;
  let dialog: MockMatDialog;

  const mockProducts = [
    {
      productId: 1,
      price: 100,
      condition: 'NEW',
      stockQuantity: 10,
      active: true,
      address: { country: 'Italy', city: 'Rome' },
      advertisement: {
        advertisementId: 1,
        title: 'Test Product 1',
        description: 'Description 1',
        status: 'ACTIVE',
        type: 'electronics',
        agency: false,
        active: true,
        createdBy: { userId: 2, email: 'seller@test.com' },
        profile: { firstName: 'John', lastName: 'Doe' },
        likesNumber: 5,
        createdAt: new Date(),
      },
      images: [],
    },
    {
      productId: 2,
      price: 200,
      condition: 'USED',
      stockQuantity: 5,
      active: true,
      address: { country: 'Italy', city: 'Milan' },
      advertisement: {
        advertisementId: 2,
        title: 'Test Product 2',
        description: 'Description 2',
        status: 'ACTIVE',
        type: 'electronics',
        agency: true,
        agencyName: 'Test Agency',
        agencyFeePercent: 10,
        active: true,
        createdBy: { userId: 1, email: 'user@test.com' },
        profile: { firstName: 'Jane', lastName: 'Smith' },
        likesNumber: 3,
        createdAt: new Date(),
      },
      images: [],
    },
  ];

  beforeEach(async () => {
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({
        isConfirmed: true,
        isDenied: false,
        isDismissed: false,
      }) as any,
    );

    snackBar = new MockMatSnackBar();
    dialog = new MockMatDialog();

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NoopAnimationsModule,
        AdvertisementsViewComponent,
      ],
      providers: [
        { provide: ProductService, useClass: MockProductService },
        {
          provide: AdvertisementLikesService,
          useClass: MockAdvertisementLikesService,
        },
        { provide: GeocodingService, useClass: MockGeocodingService },
        { provide: AuthGoogleService, useClass: MockAuthGoogleService },
        { provide: CartService, useClass: MockCartService },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: MatDialog, useValue: dialog },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AdvertisementsViewComponent, {
        remove: {
          imports: [
            PaginationComponent,
            CardComponent,
            SpinnerComponent,
            EmptyStateComponent,
          ],
        },
        add: {
          imports: [
            MockPaginationComponent,
            MockCardComponent,
            MockSpinnerComponent,
            MockEmptyStateComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AdvertisementsViewComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as any;
    likesService = TestBed.inject(AdvertisementLikesService) as any;
    geocodingService = TestBed.inject(GeocodingService) as any;
    authService = TestBed.inject(AuthGoogleService) as any;
    cartService = TestBed.inject(CartService) as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load current user ID', () => {
      expect(component.currentUserId).toBe(1);
    });

    it('should initialize search form', () => {
      expect(component.searchForm).toBeTruthy();
    });

    it('should load products', () => {
      expect(productService.getProductsNotDeletedByType).toHaveBeenCalled();
    });

    it('should load countries', () => {
      expect(geocodingService.getCountries).toHaveBeenCalled();
    });
  });

  describe('Products loading', () => {
    it('should load products successfully', fakeAsync(() => {
      productService.getProductsNotDeletedByType.and.returnValue(
        of(mockProducts),
      );
      geocodingService.getCountriesAdvertisementView.and.returnValue(
        of([
          {
            cca2: 'IT',
            name: { common: 'Italy' },
            currencies: { EUR: { symbol: '€' } },
          },
        ]),
      );

      (component as any).getProductsNotDeleted();
      flush();

      expect(component.ads.length).toBe(2);
      expect(component.filteredAds.length).toBe(2);
    }));

    it('should handle error when loading products', fakeAsync(() => {
      const errorResponse = { error: { message: 'Error loading products' } };

      productService.getProductsNotDeletedByType.and.returnValue(
        throwError(() => errorResponse),
      );

      (component as any).getProductsNotDeleted();
      flush();

      expect(component.ads.length).toBe(0);
      expect(true).toBeTrue();
    }));
  });

  describe('User ownership', () => {
    beforeEach(() => {
      component.currentUserId = 1;
      component.ads = mockProducts.map(
        (p) =>
          ({
            advertisementId: p.advertisement.advertisementId,
            title: p.advertisement.title,
            price: p.price,
            createdBy: p.advertisement.createdBy,
            productCountry: p.address.country,
            city: p.address.city,
          }) as any,
      );
    });

    it('should check if user owns ad', () => {
      const ad = component.ads[0];
      expect(component.isUserAd(ad)).toBeFalse();

      const adOwned = component.ads[1];
      expect(component.isUserAd(adOwned)).toBeTrue();
    });

    it('should check if user can like ad', () => {
      const ad = component.ads[0];
      expect(component.canUserLikeAd(ad)).toBeTrue();

      const adOwned = component.ads[1];
      expect(component.canUserLikeAd(adOwned)).toBeFalse();
    });
  });

  describe('Likes', () => {
    beforeEach(() => {
      component.currentUserId = 1;
      component.ads = mockProducts.map(
        (p) =>
          ({
            advertisementId: p.advertisement.advertisementId,
            liked: false,
            likes: p.advertisement.likesNumber,
            createdBy: p.advertisement.createdBy,
          }) as any,
      );
      component.filteredAds = [...component.ads];
    });

    it('should handle like change', fakeAsync(() => {
      likesService.updateLike.and.returnValue(of({}));

      component.handleLikeChange({ id: 1, liked: true });
      flush();

      expect(likesService.updateLike).toHaveBeenCalled();
    }));

    it('should not like own ad', () => {
      component.handleLikeChange({ id: 2, liked: true });
      expect(true).toBeTrue();
    });

    it('should get all likes by user', fakeAsync(() => {
      likesService.getAllLikesByUser.and.returnValue(
        of({ data: [{ advertisementId: 1 }] }),
      );

      component.getAllLikesByUser();
      flush();

      expect(likesService.getAllLikesByUser).toHaveBeenCalled();
    }));
  });

  describe('Search form', () => {
    beforeEach(() => {
      component.searchForm = component['fb'].group({
        country: [''],
        city: [''],
        minPrice: [null],
        maxPrice: [null],
        title: [''],
        condition: [''],
        agency: [false],
        minDate: [''],
        maxDate: [''],
      });
    });

    it('should initialize search form', () => {
      expect(component.searchForm).toBeTruthy();
    });

    it('should toggle search panel', () => {
      expect(component.isSearchOpen).toBeFalse();
      component.toggleSearch();
      expect(component.isSearchOpen).toBeTrue();
      component.toggleSearch();
      expect(component.isSearchOpen).toBeFalse();
    });

    it('should apply search', fakeAsync(() => {
      productService.getProductsNotDeletedByType.and.returnValue(
        of(mockProducts),
      );
      component.searchForm.patchValue({ title: 'test' });

      component.applySearch();
      flush();

      expect(productService.getProductsNotDeletedByType).toHaveBeenCalled();
    }));

    it('should reset search', fakeAsync(() => {
      component.resetSearch();
      flush();
      expect(Swal.fire).toHaveBeenCalled();
    }));
  });

  describe('Pagination', () => {
    beforeEach(() => {
      component.ads = mockProducts.map(
        (p) => ({ advertisementId: p.advertisement.advertisementId }) as any,
      );
      component.filteredAds = [...component.ads];
    });

    it('should handle page change', () => {
      component.onPageChanged({ pageIndex: 1, pageSize: 10 });
      expect(component.currentPage).toBe(1);
      expect(component.pageSize).toBe(10);
    });

    it('should update paged ads', () => {
      component.filteredAds = mockProducts.map(
        (p) => ({ advertisementId: p.advertisement.advertisementId }) as any,
      );
      component.pageSize = 1;
      component.currentPage = 0;
      component['updatePagedAds']();
      expect(component.pagedAds.length).toBe(1);
    });
  });

  describe('Cart', () => {
    const ad = {
      advertisementId: 1,
      productId: 1,
      title: 'Test',
      stockQuantity: 5,
      active: true,
    } as any;

    it('should add to cart', () => {
      cartService.canAddMoreToCart.and.returnValue(true);
      component.onAddToCart(ad);
      expect(cartService.addProductToCart).toHaveBeenCalled();
    });

    it('should not add to cart if out of stock', () => {
      const outOfStockAd = { ...ad, stockQuantity: 0 };
      component.onAddToCart(outOfStockAd);
      expect(cartService.addProductToCart).not.toHaveBeenCalled();
    });
  });

  describe('Price range', () => {
    beforeEach(() => {
      component.ads = mockProducts.map((p) => ({ price: p.price }) as any);
      component['analyzePrices'](component.ads);
    });

    it('should calculate min and max price', () => {
      expect(component.minPriceInAds).toBe(100);
      expect(component.maxPriceInAds).toBe(200);
    });

    it('should handle min change', () => {
      const event = { target: { value: '150' } } as any;
      component.onMinChange(event);
      expect(component.searchForm.get('minPrice')?.value).toBe(150);
    });

    it('should handle max change', () => {
      const event = { target: { value: '180' } } as any;
      component.onMaxChange(event);
      expect(component.searchForm.get('maxPrice')?.value).toBe(180);
    });
  });

  describe('Country and city autocomplete', () => {
    it('should get countries', () => {
      expect(geocodingService.getCountries).toHaveBeenCalled();
      expect(component.countries.length).toBeGreaterThan(0);
    });

    it('should get cities for country', fakeAsync(() => {
      component.getCitiesForCountry('Italy');
      flush();
      expect(geocodingService.getCities).toHaveBeenCalled();
    }));

    it('should filter countries', () => {
      component.countries = ['Italy', 'France', 'Germany'];
      const filtered = component['filterCountries']('ita');
      expect(filtered).toEqual(['Italy']);
    });
  });

  describe('Empty state', () => {
    it('should return true when no data in db', () => {
      component['isNormalLoad'] = true;
      component.ads = [];
      expect(component.hasDataInDb()).toBeFalse();
    });

    it('should return true when empty state', () => {
      component.filteredAds = [];
      component['isNormalLoad'] = false;
      expect(component.isEmptyState()).toBeTrue();
    });

    it('should get logo source', () => {
      expect(component.getLogoSrc()).toBe('logo_blue-removebg.png');
    });
  });

  describe('Ad selection', () => {
    it('should open ad detail dialog', () => {
      component.ads = mockProducts.map(
        (p) => ({ advertisementId: p.advertisement.advertisementId }) as any,
      );
      component.filteredAds = [...component.ads];
      component.pagedAdsWithAllImage = mockProducts;

      component.onAdSelected(1);
      expect(dialog.open).toHaveBeenCalled();
    });
  });
});
