import { Input, Output, EventEmitter } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject, BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  PLATFORM_ID,
  NgZone,
  Component,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { DashboardComponent } from './dashboard.component';
import { RouteManagerService } from 'src/app/services/utils/route_manager/route-manager.service';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import { CategoryService } from 'src/app/services/path/category/category.service';
import { ProfileService } from 'src/app/services/path/profile/profile.service';
import { SortService } from 'src/app/services/utils/sort/sort.service';
import { SidebarService, BreadcrumbItem } from 'my-lib-inside';
import { UserInfo } from 'src/app/interfaces/jwt/user_info_dto.interface';
import { ApiConfigService } from 'src/app/services/api-config/api-config.service';
import { CommonModule } from '@angular/common';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: STUB COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'lib-layout',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class StubLayoutComponent {}

@Component({ selector: 'lib-navbar', template: '', standalone: true })
class StubNavbarComponent {
  @Input() menuItems: any[] = [];
  @Input() logoUrl: any;
  @Input() currentYear: number = 0;
  @Input() currentRoute: string = '';
  @Input() routeSource: any;
  @Output() breadcrumbChangeNav = new EventEmitter();
  @Output() linkActive = new EventEmitter();
  @Output() navigateDasboard = new EventEmitter();
  @Output() navigateLink = new EventEmitter();
  @Output() logout = new EventEmitter();
}

@Component({ selector: 'lib-sidebar', template: '', standalone: true })
class StubSidebarComponent {
  @Input() menuItemsSidebar: any[] = [];
  @Input() routeSource: any;
  @Output() breadcrumbChangeSidebar = new EventEmitter();
  @Output() linkActive = new EventEmitter();
  @Output() navigateDasboard = new EventEmitter();
  @Output() navigateLink = new EventEmitter();
}

@Component({ selector: 'lib-spinner', template: '', standalone: true })
class StubSpinnerComponent {
  @Input() spinner: any;
  @Input() isLoading: any;
}

@Component({ selector: 'lib-breadcrumb', template: '', standalone: true })
class StubBreadcrumbComponent {
  @Input() breadcrumbListSidebar: any[] = [];
  @Input() breadcrumbListNavbar: any[] = [];
}

@Component({ selector: 'lib-footer', template: '', standalone: true })
class StubFooterComponent {
  @Input() footerLinkItems: any[] = [];
  @Input() footerPaymentMethodItems: any[] = [];
}

@Component({ selector: 'app-cart', template: '', standalone: true })
class StubCartComponent {}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: MOCK SERVICES
// ─────────────────────────────────────────────────────────────────────────────

class MockMatSnackBar {
  open() {
    return {
      onAction: () => of({}),
      afterDismissed: () => of({}),
      dismiss: () => {},
    };
  }
}

class MockSidebarService {
  isSidebarVisible$ = new BehaviorSubject<boolean>(false);
  toggleSidebar() {}
}

class MockRouteManagerService {
  getComponentForRoute(
    category: string | null,
    source: 'navbar' | 'sidebar' | null,
  ) {
    return { component: null, source: source || null };
  }
}

class MockAuthGoogleService {
  userInfo$ = new BehaviorSubject<UserInfo | null>(null);
  isAuthenticated$ = new BehaviorSubject<boolean>(true);
  getUserRoles() {
    return ['USER'];
  }
  getCurrentUserInfo(): UserInfo | null {
    return { userId: '1', email: 'test@test.com', roles: ['USER'], scopes: [] };
  }
  logoutUser(_manual = false) {
    return of(void 0);
  }
  waitForHydration() {
    return of(true);
  }
  ensureUserDataLoaded() {
    return of(true);
  }
}

class MockCategoryService {
  categoriesUpdated$ = new Subject<void>();
  getAllActiveCategories = jasmine
    .createSpy('getAllActiveCategories')
    .and.returnValue(
      of([
        {
          categoryId: 1,
          label: 'Electronics',
          active: true,
          icon: 'faMobileAlt',
          link: 'electronics',
          name: 'Electronics',
          children: [],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          type: 'ELECTRONICS',
        },
      ]),
    );
}

class MockProfileService {
  profileUpdated$ = new Subject<any>();
  getProfileByUserId = jasmine
    .createSpy('getProfileByUserId')
    .and.returnValue(
      of({
        profileId: 1,
        firstName: 'John',
        lastName: 'Doe',
        userId: 1,
        active: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      }),
    );
}

class MockSortService {
  sortCategoriesAlphabetically(cats: any[]) {
    return cats;
  }
}

class MockRouter {
  url = '/dashboard';
  navigate = jasmine.createSpy('navigate');
  events = of({});
}

class MockActivatedRoute {
  data = of({ category: null, source: null });
  snapshot = { data: { category: null, source: null } };
}

class MockApiConfigService {
  getBaseUrl() {
    return 'http://localhost:8080';
  }
  logConfiguration() {}
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: TEST SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: MockAuthGoogleService;
  let categoryService: MockCategoryService;
  let profileService: MockProfileService;
  let router: MockRouter;
  let ngZone: NgZone;

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: TEST SETUP
  // ─────────────────────────────────────────────────────────────────────────

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        FontAwesomeModule,
        MatSnackBarModule,
        DashboardComponent,
      ],
      providers: [
        provideHttpClientTesting(),
        { provide: SidebarService, useClass: MockSidebarService },
        { provide: RouteManagerService, useClass: MockRouteManagerService },
        { provide: AuthGoogleService, useClass: MockAuthGoogleService },
        { provide: CategoryService, useClass: MockCategoryService },
        { provide: ProfileService, useClass: MockProfileService },
        { provide: SortService, useClass: MockSortService },
        { provide: Router, useClass: MockRouter },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
        { provide: ApiConfigService, useClass: MockApiConfigService },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: MatSnackBar, useClass: MockMatSnackBar },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .overrideComponent(DashboardComponent, {
        set: {
          imports: [
            CommonModule,
            RouterOutlet,
            StubLayoutComponent,
            StubNavbarComponent,
            StubSidebarComponent,
            StubSpinnerComponent,
            StubBreadcrumbComponent,
            StubFooterComponent,
            StubCartComponent,
          ],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    ngZone = TestBed.inject(NgZone);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    authService = TestBed.inject(AuthGoogleService) as any;
    categoryService = TestBed.inject(CategoryService) as any;
    profileService = TestBed.inject(ProfileService) as any;
    router = TestBed.inject(Router) as any;

    ngZone.run(() => {
      (authService.userInfo$ as BehaviorSubject<UserInfo | null>).next({
        userId: '1',
        email: 'test@test.com',
        roles: ['USER'],
        scopes: [],
      });
    });

    ngZone.run(() => fixture.detectChanges());
  });

  afterEach(() => {
    if (fixture) fixture.destroy();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: BASIC TESTS
  // ─────────────────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: CART VISIBILITY TESTS
  // ─────────────────────────────────────────────────────────────────────────

  it('should have cartVisible false when hasProfile and profileCheckComplete are false', () => {
    component.hasProfile = false;
    component.profileCheckComplete = false;
    component['updateCartVisibility']();
    expect(component.cartVisible).toBeFalse();
  });

  it('should set cartVisible true when hasProfile and profileCheckComplete', () => {
    component.hasProfile = true;
    component.profileCheckComplete = true;
    component['updateCartVisibility']();
    expect(component.cartVisible).toBeTrue();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: CATEGORIES TESTS
  // ─────────────────────────────────────────────────────────────────────────

  it('should call getAllActiveCategories when savedProfile is set', fakeAsync(() => {
    ngZone.run(() => {
      component.savedProfile = { profileId: 1 };
      component.getActiveCategories();
      tick(200);
    });
    expect(categoryService.getAllActiveCategories).toHaveBeenCalled();
  }));

  it('should NOT call getAllActiveCategories when savedProfile is null', () => {
    categoryService.getAllActiveCategories.calls.reset();
    component.savedProfile = null;
    component.getActiveCategories();
    expect(categoryService.getAllActiveCategories).not.toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: PROFILE CHECK TESTS
  // ─────────────────────────────────────────────────────────────────────────

  it('should navigate to /settings/profile when profile is null on /dashboard', fakeAsync(() => {
    profileService.getProfileByUserId.and.returnValue(of(null));
    (router as any).url = '/dashboard';
    router.navigate.calls.reset();
    ngZone.run(() => {
      component['checkUserProfile']();
      tick();
    });
    expect(router.navigate).toHaveBeenCalledWith(['/settings/profile']);
  }));

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: USER INFO TESTS
  // ─────────────────────────────────────────────────────────────────────────

  it('should set userRoles from authService on userInfoSubscribe', () => {
    ngZone.run(() => component.userInfoSubscribe());
    expect(component.userRoles).toEqual(['USER']);
  });

  it('should set only logout menuItems when savedProfile is null', () => {
    component.savedProfile = null;
    ngZone.run(() => component.userInfoSubscribe());
    const allLogout = component.menuItems.every(
      (item) =>
        item.name?.toLowerCase() === 'logout' ||
        item.label?.toLowerCase().includes('logout'),
    );
    expect(allLogout).toBeTrue();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: BREADCRUMB TESTS
  // ─────────────────────────────────────────────────────────────────────────

  it('should update breadcrumbListNavbar on onNavbarBreadcrumbChange', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', path: 'home', hasChild: false },
    ];
    component.onNavbarBreadcrumbChange(items);
    expect(component.breadcrumbListNavbar).toEqual(items);
  });

  it('should update breadcrumbListSidebar on onSidebarBreadcrumbChange', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Cat', path: 'cat', hasChild: false },
    ];
    component.onSidebarBreadcrumbChange(items);
    expect(component.breadcrumbListSidebar).toEqual(items);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: NAVIGATION TESTS
  // ─────────────────────────────────────────────────────────────────────────

  it('should navigate on onNavigateLink', () => {
    component.onNavigateLink('/home');
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should NOT navigate on onNavigateDasboard when already on /dashboard', () => {
    router.navigate.calls.reset();
    (router as any).url = '/dashboard';
    component.onNavigateDasboard('/dashboard');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should navigate away on onNavigateDasboard when not on /dashboard', () => {
    (router as any).url = '/other';
    component.onNavigateDasboard('/dashboard');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: LOGOUT TESTS
  // ─────────────────────────────────────────────────────────────────────────

  it('should call logoutUser on onLogout with "out"', () => {
    spyOn(authService, 'logoutUser').and.returnValue(of(void 0));
    component.onLogout('out');
    expect(authService.logoutUser).toHaveBeenCalledWith(true);
  });

  it('should NOT call logoutUser on onLogout with other value', () => {
    spyOn(authService, 'logoutUser').and.returnValue(of(void 0));
    component.onLogout('qualcosa-altro');
    expect(authService.logoutUser).not.toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: CLEANUP TESTS
  // ─────────────────────────────────────────────────────────────────────────

  it('should complete destroy$ on ngOnDestroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});