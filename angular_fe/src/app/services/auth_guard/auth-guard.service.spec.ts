import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthGuard } from './auth-guard.service';
import { AuthGoogleService } from '../auth_google/auth-google.service';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { of, Observable, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ApiConfigService } from '../api-config/api-config.service';
import { provideHttpClient, withFetch } from '@angular/common/http';

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockApiConfigService {
  apiUrlClassic = 'http://localhost:8080/api/auth';
  apiUrlGoogle = 'http://localhost:8080/oauth2';
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockAuthService: AuthGoogleService;
  let mockRouter: MockRouter;

  const createMockRoute = (roles: string[] = []): ActivatedRouteSnapshot => {
    return {
      data: { roles },
      url: [],
      params: {},
      queryParams: {},
      fragment: null,
      outlet: 'primary',
      component: null,
      routeConfig: null,
      root: {} as ActivatedRouteSnapshot,
      parent: null,
      firstChild: null,
      children: [],
      pathFromRoot: [],
      paramMap: {} as any,
      queryParamMap: {} as any,
      title: null,
      toString: () => '',
    } as unknown as ActivatedRouteSnapshot;
  };

  const createMockState = (url: string): RouterStateSnapshot => {
    return {
      url,
      root: {} as any,
      toString: () => url,
    } as RouterStateSnapshot;
  };

  beforeEach(() => {
    spyOn(console, 'log');
    spyOn(console, 'error');

    mockRouter = new MockRouter();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        AuthGuard,
        AuthGoogleService,
        { provide: Router, useValue: mockRouter },
        { provide: ApiConfigService, useValue: new MockApiConfigService() },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    mockAuthService = TestBed.inject(AuthGoogleService);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true if no roles are required', () => {
    const mockRoute = createMockRoute([]);
    const mockState = createMockState('/dashboard');

    const result = guard.canActivate(mockRoute, mockState);

    expect(result).toBeTrue();
  });

  it('should allow access if user is authenticated and has required role', (done) => {
    const mockRoute = createMockRoute(['USER']);
    const mockState = createMockState('/dashboard');

    spyOn(mockAuthService, 'ensureUserDataLoaded').and.returnValue(of(true));
    spyOn(mockAuthService, 'checkAuthenticationStatus').and.returnValue(true);
    spyOn(mockAuthService, 'getUserRolesWithRetry').and.returnValue(
      of(['USER']),
    );

    const result = guard.canActivate(mockRoute, mockState);

    if (result instanceof Observable) {
      result.subscribe((allowed) => {
        expect(allowed).toBeTrue();
        done();
      });
    } else {
      expect(result).toBeTrue();
      done();
    }
  });

  it('should deny access if user is not authenticated', (done) => {
    const mockRoute = createMockRoute(['USER']);
    const mockState = createMockState('/dashboard');

    spyOn(mockAuthService, 'ensureUserDataLoaded').and.returnValue(of(true));
    spyOn(mockAuthService, 'checkAuthenticationStatus').and.returnValue(false);

    const result = guard.canActivate(mockRoute, mockState);

    if (result instanceof Observable) {
      result.subscribe((allowed) => {
        expect(allowed).toBeFalse();
        expect(mockRouter.navigate).toHaveBeenCalled();
        done();
      });
    } else {
      expect(result).toBeFalse();
      done();
    }
  });

  it('should deny access if user does not have required role', (done) => {
    const mockRoute = createMockRoute(['ADMIN']);
    const mockState = createMockState('/admin');

    spyOn(mockAuthService, 'ensureUserDataLoaded').and.returnValue(of(true));
    spyOn(mockAuthService, 'checkAuthenticationStatus').and.returnValue(true);
    spyOn(mockAuthService, 'getUserRolesWithRetry').and.returnValue(
      of(['USER']),
    );

    const result = guard.canActivate(mockRoute, mockState);

    if (result instanceof Observable) {
      result.subscribe((allowed) => {
        expect(allowed).toBeFalse();
        expect(mockRouter.navigate).toHaveBeenCalled();
        done();
      });
    } else {
      expect(result).toBeFalse();
      done();
    }
  });

  it('should deny access if user data fails to load', (done) => {
    const mockRoute = createMockRoute(['USER']);
    const mockState = createMockState('/dashboard');

    spyOn(mockAuthService, 'ensureUserDataLoaded').and.returnValue(of(false));

    const result = guard.canActivate(mockRoute, mockState);

    if (result instanceof Observable) {
      result.subscribe((allowed) => {
        expect(allowed).toBeFalse();
        done();
      });
    } else {
      expect(result).toBeFalse();
      done();
    }
  });

  // Test per il timeout
  it('should handle timeout error', (done) => {
    jasmine.clock().install();

    const mockRoute = createMockRoute(['USER']);
    const mockState = createMockState('/dashboard');

    // Observable che non completa mai
    spyOn(mockAuthService, 'ensureUserDataLoaded').and.returnValue(
      new Observable(() => {}),
    );

    const result = guard.canActivate(mockRoute, mockState);

    if (result instanceof Observable) {
      result.subscribe((allowed) => {
        expect(allowed).toBeFalse();
        done();
      });

      jasmine.clock().tick(11000);
      jasmine.clock().uninstall();
    } else {
      done();
    }
  });

  // Test autentication error
  it('should handle authentication error and force logout', (done) => {
    const mockRoute = createMockRoute(['USER']);
    const mockState = createMockState('/dashboard');
    const error = { status: 401 };

    spyOn(mockAuthService, 'ensureUserDataLoaded').and.returnValue(
      throwError(() => error),
    );
    spyOn(mockAuthService, 'isAuthenticationError').and.returnValue(true);
    spyOn(mockAuthService, 'forceLogout');

    const result = guard.canActivate(mockRoute, mockState);

    if (result instanceof Observable) {
      result.subscribe((allowed) => {
        expect(allowed).toBeFalse();
        expect(mockAuthService.forceLogout).toHaveBeenCalledWith(
          'Authentication error in guard',
        );
        done();
      });
    } else {
      done();
    }
  });

  // Test generic error
  it('should handle generic error and navigate to register', (done) => {
    const mockRoute = createMockRoute(['USER']);
    const mockState = createMockState('/dashboard');
    const error = { status: 500 };

    mockRouter.navigate = jasmine.createSpy('navigate');

    spyOn(mockAuthService, 'ensureUserDataLoaded').and.returnValue(
      throwError(() => error),
    );
    spyOn(mockAuthService, 'isAuthenticationError').and.returnValue(false);
    spyOn(mockAuthService, 'forceLogout'); // ← aggiunto

    const result = guard.canActivate(mockRoute, mockState);

    if (result instanceof Observable) {
      result.subscribe({
        next: (allowed) => {
          expect(allowed).toBeFalse();
          expect(mockRouter.navigate).toHaveBeenCalled();
          expect(mockAuthService.forceLogout).not.toHaveBeenCalled();
          done();
        },
        error: (err) => {
          done.fail('Should not error: ' + err);
        },
      });
    } else {
      done();
    }
  });
});

// ============================================
// DESCRIVE SEPARATO PER SSR
// ============================================
describe('AuthGuard on server-side', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    spyOn(console, 'log');
    spyOn(console, 'error');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        provideHttpClient(withFetch()),
        AuthGuard,
        AuthGoogleService,
        { provide: Router, useValue: new MockRouter() },
        { provide: ApiConfigService, useValue: new MockApiConfigService() },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should return true on server-side even with required roles', () => {
    const mockRoute = {
      data: { roles: ['ADMIN'] },
      url: [],
      params: {},
      queryParams: {},
      fragment: null,
      outlet: 'primary',
      component: null,
      routeConfig: null,
      root: {} as ActivatedRouteSnapshot,
      parent: null,
      firstChild: null,
      children: [],
      pathFromRoot: [],
      paramMap: {} as any,
      queryParamMap: {} as any,
      title: null,
      toString: () => '',
    } as unknown as ActivatedRouteSnapshot;

    const mockState = {
      url: '/admin',
      root: {} as any,
      toString: () => '/admin',
    } as RouterStateSnapshot;

    const result = guard.canActivate(mockRoute, mockState);

    expect(result).toBeTrue();
  });
});
