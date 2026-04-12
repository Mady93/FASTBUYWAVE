import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { SettingsUserAdvertisementComponent } from './settings-user-advertisement.component';
import { ProductService } from 'src/app/services/path/product/product.service';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import { AdvertisementLikesService } from 'src/app/services/path/likes/advertisement-likes.service';
import { MatDialog } from '@angular/material/dialog';
import { PLATFORM_ID } from '@angular/core';
import { AdvertisementItem } from 'my-lib-inside';
import { LikersDialogComponent } from 'src/app/components/dialog/likers-dialog/likers-dialog.component';
import {
  CardComponent,
  PaginationComponent,
  SpinnerComponent,
} from 'my-lib-inside';
import { HttpErrorResponse } from '@angular/common/http';

// ============================================
// MOCK DEI COMPONENTI DI my-lib-inside CON TEMPLATE VUOTO
// ============================================
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

@Component({
  selector: 'lib-card',
  template: '',
  standalone: true,
})
class MockCardComponent {
  @Input() ad!: AdvertisementItem;
  @Input() maxWords: number = 0;
  @Input() maxWordsTitle: number = 0;
  @Output() viewAd = new EventEmitter<number>();
  @Output() likeChanged = new EventEmitter<{ id: number; liked: boolean }>();
  @Input() isUserAd: () => boolean = () => false;
  @Output() addToCart = new EventEmitter<AdvertisementItem>();
  @Input() canLike: () => boolean = () => false;
  @Input() canAddToCart: () => boolean = () => true;
  @Input() isMaxQuantityReached: () => boolean = () => false;
  @Output() viewLikers = new EventEmitter<number>();
}

@Component({
  selector: 'lib-spinner',
  template: '',
  standalone: true,
})
class MockSpinnerComponent {
  @Input() spinner: Function = () => {};
  @Input() isLoading: Function = () => {};
}

// Mock dei servizi
class MockProductService {
  getActiveProductsByUserId = jasmine.createSpy().and.returnValue(of([]));
}

class MockAuthGoogleService {
  getCurrentUserInfo = jasmine.createSpy();
  userInfo$: any = new Subject<any>();
}

class MockAdvertisementLikesService {}

class MockMatDialog {
  open = jasmine.createSpy().and.returnValue({ afterClosed: () => of(null) });
}

describe('SettingsUserAdvertisementComponent', () => {
  let component: SettingsUserAdvertisementComponent;
  let fixture: ComponentFixture<SettingsUserAdvertisementComponent>;
  let mockProductService: MockProductService;
  let mockAuthService: MockAuthGoogleService;
  let mockDialog: MockMatDialog;

  const mockUserInfo = { userId: '123', email: 'test@example.com' };

  // Mock data structure matching what the real mapProductsToAds expects
  const mockProducts: any[] = [
    {
      productId: 1,
      price: 100,
      stockQuantity: 5,
      condition: 'new',
      address: {
        country: 'Italy',
        city: 'Rome',
      },
      images: [
        {
          picByte: 'base64image1',
        },
      ],
      advertisement: {
        advertisementId: 1,
        title: 'Prodotto 1',
        description: 'Descrizione 1',
        status: 'active',
        renewedAt: new Date(),
        agency: null,
        agencyName: null,
        agencyFeePercent: null,
        agencyUrl: null,
        active: true,
        type: 'Electronics/Smartphones',
        likesNumber: 10,
        createdAt: new Date(),
        createdBy: {
          userId: 123,
          userIdGoogle: 'google123',
          email: 'test@example.com',
          roles: [],
          scopes: [],
          registrationDate: new Date(),
          lastLogin: new Date(),
          active: true,
        },
        profile: {
          profileId: 1,
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: new Date(),
          gender: 'male',
          phoneNumber: '123456789',
          userType: 'buyer',
          rating: 5,
          totalSales: 0,
          totalPurchases: 0,
          wishlist: [],
          securityQuestion: null,
          securityAnswer: null,
          newsletterSubscription: false,
          preferredLanguage: 'en',
          currency: 'EUR',
          active: true,
          notificationPreferences: {},
          privacySettings: {},
          country: 'Italy',
        },
      },
    },
    {
      productId: 2,
      price: 200,
      stockQuantity: 3,
      condition: 'used',
      address: {
        country: 'Italy',
        city: 'Milan',
      },
      images: [
        {
          picByte: 'base64image2',
        },
      ],
      advertisement: {
        advertisementId: 2,
        title: 'Prodotto 2',
        description: 'Descrizione 2',
        status: 'active',
        renewedAt: new Date(),
        agency: null,
        agencyName: null,
        agencyFeePercent: null,
        agencyUrl: null,
        active: true,
        type: 'Home/Furniture',
        likesNumber: 5,
        createdAt: new Date(),
        createdBy: {
          userId: 123,
          userIdGoogle: 'google123',
          email: 'test@example.com',
          roles: [],
          scopes: [],
          registrationDate: new Date(),
          lastLogin: new Date(),
          active: true,
        },
        profile: {
          profileId: 1,
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: new Date(),
          gender: 'male',
          phoneNumber: '123456789',
          userType: 'buyer',
          rating: 5,
          totalSales: 0,
          totalPurchases: 0,
          wishlist: [],
          securityQuestion: null,
          securityAnswer: null,
          newsletterSubscription: false,
          preferredLanguage: 'en',
          currency: 'EUR',
          active: true,
          notificationPreferences: {},
          privacySettings: {},
          country: 'Italy',
        },
      },
    },
  ];

  beforeEach(async () => {
    mockProductService = new MockProductService();
    mockAuthService = new MockAuthGoogleService();
    mockDialog = new MockMatDialog();

    await TestBed.configureTestingModule({
      imports: [SettingsUserAdvertisementComponent],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: AuthGoogleService, useValue: mockAuthService },
        {
          provide: AdvertisementLikesService,
          useValue: new MockAdvertisementLikesService(),
        },
        { provide: MatDialog, useValue: mockDialog },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SettingsUserAdvertisementComponent, {
        remove: {
          imports: [CardComponent, PaginationComponent, SpinnerComponent],
        },
        add: {
          imports: [
            MockCardComponent,
            MockPaginationComponent,
            MockSpinnerComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SettingsUserAdvertisementComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    mockProductService.getActiveProductsByUserId.calls.reset();
    mockAuthService.getCurrentUserInfo.calls.reset();
    mockDialog.open.calls.reset();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    fixture.detectChanges();
    expect(component.spinner).toBe('/t.png');
    expect(component.getspinner()).toBe('/t.png');
    expect(component.pageSize).toBe(5);
    expect(component.currentPage).toBe(0);
    expect(component.isUserAd()).toBe(true);
    expect(component.canAddToCart()).toBe(false);
    expect(component.isLoading()).toBe(false);
    expect(component.ads).toEqual([]);
    expect(component.pagedAds).toEqual([]);
    expect(component.pagedAdsWithAllImage).toEqual([]);
    expect(component.images).toEqual([]);
    expect(component.userId).toBeNull();
    expect(component.likersMap.size).toBe(0);
    expect(component.loadingLikersMap.size).toBe(0);
  });

  it('should load products when user info is available', fakeAsync(() => {
    mockAuthService.getCurrentUserInfo.and.returnValue(mockUserInfo);
    mockProductService.getActiveProductsByUserId.and.returnValue(
      of(mockProducts),
    );

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(mockProductService.getActiveProductsByUserId).toHaveBeenCalledWith(
      123,
    );
    expect(component.userId).toBe(123);
    expect(component.pagedAdsWithAllImage).toEqual(mockProducts);
    expect(component.ads.length).toBe(2);
    expect(component.ads[0].advertisementId).toBe(1);
    expect(component.ads[1].advertisementId).toBe(2);
  }));

  it('should handle user info from observable', fakeAsync(() => {
    mockAuthService.getCurrentUserInfo.and.returnValue(null);

    mockAuthService.userInfo$ = of(mockUserInfo);
    mockProductService.getActiveProductsByUserId.and.returnValue(
      of(mockProducts),
    );
    component.ngOnInit();

    tick();
    fixture.detectChanges();

    expect(component.userId).toBe(123);
    expect(mockProductService.getActiveProductsByUserId).toHaveBeenCalledWith(
      123,
    );
  }));

  it('should handle user info from sessionStorage on error', fakeAsync(() => {
    mockAuthService.getCurrentUserInfo.and.returnValue(null);
    mockProductService.getActiveProductsByUserId.and.returnValue(
      of(mockProducts),
    );

    spyOn(sessionStorage, 'getItem').and.returnValue(
      JSON.stringify(mockUserInfo),
    );

    component.ngOnInit();

    mockAuthService.userInfo$.error(new Error('Timeout'));
    tick();
    fixture.detectChanges();

    expect(component.userId).toBe(123);
    expect(mockProductService.getActiveProductsByUserId).toHaveBeenCalledWith(
      123,
    );
  }));

  it('should handle error response from getActiveProductsByUserId', fakeAsync(() => {
    mockAuthService.getCurrentUserInfo.and.returnValue(mockUserInfo);
    mockProductService.getActiveProductsByUserId.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({ status: 500, statusText: 'Server Error' }),
      ),
    );
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(component.ads).toEqual([]);
    expect(component.isLoading()).toBe(false);
  }));

  it('should handle page change', () => {
    component.ads = [
      { advertisementId: 1 } as AdvertisementItem,
      { advertisementId: 2 } as AdvertisementItem,
      { advertisementId: 3 } as AdvertisementItem,
    ];
    const pageEvent = { pageIndex: 1, pageSize: 2 };
    component.onPageChanged(pageEvent);
    expect(component.currentPage).toBe(1);
    expect(component.pageSize).toBe(2);
    expect(component.pagedAds.length).toBe(1);
  });

  it('should update pagedAds when updatePagedAds is called', () => {
    component.ads = [
      { advertisementId: 1 } as AdvertisementItem,
      { advertisementId: 2 } as AdvertisementItem,
      { advertisementId: 3 } as AdvertisementItem,
    ];
    component.currentPage = 1;
    component.pageSize = 1;

    (component as any).updatePagedAds();

    expect(component.pagedAds.length).toBe(1);
    expect(component.pagedAds[0].advertisementId).toBe(2);
  });

  it('should open likers dialog', () => {
    component.ads = [
      { advertisementId: 1, title: 'Prodotto 1' } as AdvertisementItem,
    ];
    component.openLikersDialog(1);

    expect(mockDialog.open).toHaveBeenCalledWith(
      LikersDialogComponent,
      jasmine.objectContaining({
        data: { advertisementId: 1, title: 'Prodotto 1' },
      }),
    );
  });

  it('should open likers dialog with empty title when ad not found', () => {
    component.ads = [];
    component.openLikersDialog(999);

    expect(mockDialog.open).toHaveBeenCalledWith(
      LikersDialogComponent,
      jasmine.objectContaining({
        data: { advertisementId: 999, title: '' },
      }),
    );
  });

  it('should call onAdSelected', () => {
    component.ads = [{ advertisementId: 1 } as AdvertisementItem];
    component.pagedAdsWithAllImage = mockProducts;

    spyOn(console, 'warn');

    component.onAdSelected(1);

    expect(console.warn).toHaveBeenCalledWith(component.ads);
  });

  it('should handle onViewLikers', () => {
    spyOn(component, 'openLikersDialog');
    component.onViewLikers(1);
    expect(component.openLikersDialog).toHaveBeenCalledWith(1);
  });

  it('should handle onViewLikers', () => {
    spyOn(component, 'openLikersDialog');
    component.onViewLikers(1);
    expect(component.openLikersDialog).toHaveBeenCalledWith(1);
  });

  it('should return false for canAddToCart', () => {
    expect(component.canAddToCart()).toBe(false);
  });

  it('should return true for isUserAd', () => {
    expect(component.isUserAd()).toBe(true);
  });

  it('should have isLoading observable that emits values', fakeAsync(() => {
    let emittedValues: boolean[] = [];
    component.isLoading$.subscribe((value) => emittedValues.push(value));

    (component as any).isLoadingSubject.next(true);
    (component as any).isLoadingSubject.next(false);

    expect(emittedValues).toEqual([false, true, false]);
  }));

  it('should handle getspinner function', () => {
    expect(component.getspinner()).toBe('/t.png');
    component.spinner = '/new-spinner.png';
    expect(component.getspinner()).toBe('/new-spinner.png');
  });

  it('should initialize with empty likersMap and loadingLikersMap', () => {
    expect(component.likersMap).toBeDefined();
    expect(component.likersMap.size).toBe(0);
    expect(component.loadingLikersMap).toBeDefined();
    expect(component.loadingLikersMap.size).toBe(0);
  });

  it('should handle category input', () => {
    component.category = 'products';
    expect(component.category).toBe('products');

    component.category = 'users';
    expect(component.category).toBe('users');
  });
});
