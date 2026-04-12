import { TestBed } from '@angular/core/testing';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpResponse,
} from '@angular/common/http';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { of, throwError } from 'rxjs';
import { tokenInterceptor } from '../tokenIntercept/token.interceptor';
import { AuthGoogleService } from '../../auth_google/auth-google.service';
import { ApiConfigService } from '../../api-config/api-config.service';

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockApiConfigService {
  apiUrlClassic = 'http://localhost:8080/api/auth';
  apiUrlGoogle = 'http://localhost:8080/oauth2';
}

describe('tokenInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => tokenInterceptor(req, next));

  let mockAuthService: jasmine.SpyObj<AuthGoogleService>;
  let mockRouter: MockRouter;

  beforeEach(() => {
    spyOn(console, 'log');
    spyOn(console, 'error');

    mockRouter = new MockRouter();
    mockAuthService = jasmine.createSpyObj('AuthGoogleService', [
      'getAccessToken',
      'isTokenExpired',
      'hasValidRefreshToken',
      'refreshToken',
      'clearAuthData',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withFetch(), withInterceptors([tokenInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter },
        { provide: AuthGoogleService, useValue: mockAuthService },
        { provide: ApiConfigService, useValue: new MockApiConfigService() },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  // ============================================
  // AUTH HEADER TESTS
  // ============================================

  it('should add Authorization header when token exists and request is not auth', () => {
    mockAuthService.getAccessToken.and.returnValue('test-token');
    mockAuthService.isTokenExpired.and.returnValue(false);

    const req = new HttpRequest('GET', 'http://localhost:8080/api/products');
    const next: HttpHandlerFn = jasmine
      .createSpy('next')
      .and.returnValue(of(new HttpResponse({ status: 200 })));

    TestBed.runInInjectionContext(() => tokenInterceptor(req, next));

    const calledReq = (next as jasmine.Spy).calls.mostRecent()
      .args[0] as HttpRequest<any>;
    expect(calledReq.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('should NOT add Authorization header for login requests', () => {
    mockAuthService.getAccessToken.and.returnValue('test-token');
    mockAuthService.isTokenExpired.and.returnValue(false);

    const req = new HttpRequest(
      'POST',
      'http://localhost:8080/api/auth/login',
      {},
    );
    const next: HttpHandlerFn = jasmine
      .createSpy('next')
      .and.returnValue(of(new HttpResponse({ status: 200 })));

    TestBed.runInInjectionContext(() => tokenInterceptor(req, next));

    const calledReq = (next as jasmine.Spy).calls.mostRecent()
      .args[0] as HttpRequest<any>;
    expect(calledReq.headers.get('Authorization')).toBeNull();
  });

  it('should NOT add Authorization header for refresh requests', () => {
    mockAuthService.getAccessToken.and.returnValue('test-token');
    mockAuthService.isTokenExpired.and.returnValue(false);

    const req = new HttpRequest(
      'POST',
      'http://localhost:8080/oauth2/refresh',
      {},
    );
    const next: HttpHandlerFn = jasmine
      .createSpy('next')
      .and.returnValue(of(new HttpResponse({ status: 200 })));

    TestBed.runInInjectionContext(() => tokenInterceptor(req, next));

    const calledReq = (next as jasmine.Spy).calls.mostRecent()
      .args[0] as HttpRequest<any>;
    expect(calledReq.headers.get('Authorization')).toBeNull();
  });

  it('should NOT add Authorization header for restcountries requests', () => {
    mockAuthService.getAccessToken.and.returnValue('test-token');
    mockAuthService.isTokenExpired.and.returnValue(false);

    const req = new HttpRequest('GET', 'https://restcountries.com/v3.1/all');
    const next: HttpHandlerFn = jasmine
      .createSpy('next')
      .and.returnValue(of(new HttpResponse({ status: 200 })));

    TestBed.runInInjectionContext(() => tokenInterceptor(req, next));

    const calledReq = (next as jasmine.Spy).calls.mostRecent()
      .args[0] as HttpRequest<any>;
    expect(calledReq.headers.get('Authorization')).toBeNull();
  });

  it('should NOT add Authorization header when no token exists', () => {
    mockAuthService.getAccessToken.and.returnValue(null);
    mockAuthService.isTokenExpired.and.returnValue(true);

    const req = new HttpRequest('GET', 'http://localhost:8080/api/products');
    const next: HttpHandlerFn = jasmine
      .createSpy('next')
      .and.returnValue(of(new HttpResponse({ status: 200 })));

    TestBed.runInInjectionContext(() => tokenInterceptor(req, next));

    const calledReq = (next as jasmine.Spy).calls.mostRecent()
      .args[0] as HttpRequest<any>;
    expect(calledReq.headers.get('Authorization')).toBeNull();
  });

  // ============================================
  // PROACTIVE REFRESH TESTS
  // ============================================

  it('should attempt proactive refresh when token is expired', () => {
    mockAuthService.getAccessToken.and.returnValue('expired-token');
    mockAuthService.isTokenExpired.and.returnValue(true);
    mockAuthService.hasValidRefreshToken.and.returnValue(true);
    mockAuthService.refreshToken.and.returnValue(
      of({
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
        expiresIn: 3600,
        roles: [],
        scopes: [],
      }),
    );

    const req = new HttpRequest('GET', 'http://localhost:8080/api/products');
    const next: HttpHandlerFn = jasmine
      .createSpy('next')
      .and.returnValue(of(new HttpResponse({ status: 200 })));

    TestBed.runInInjectionContext(() =>
      tokenInterceptor(req, next),
    ).subscribe();

    expect(mockAuthService.refreshToken).toHaveBeenCalled();
  });

  it('should clear auth data and navigate when no refresh token on proactive refresh', () => {
    mockAuthService.getAccessToken.and.returnValue('expired-token');
    mockAuthService.isTokenExpired.and.returnValue(true);
    mockAuthService.hasValidRefreshToken.and.returnValue(false);

    const req = new HttpRequest('GET', 'http://localhost:8080/api/products');
    const next: HttpHandlerFn = jasmine
      .createSpy('next')
      .and.returnValue(of(new HttpResponse({ status: 200 })));

    TestBed.runInInjectionContext(() => tokenInterceptor(req, next)).subscribe({
      error: () => {},
    });

    expect(mockAuthService.clearAuthData).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/register']);
  });

  // ============================================
  // 401/403 ERROR HANDLING TESTS
  // ============================================

  it('should handle 401 error and attempt token refresh', () => {
    mockAuthService.getAccessToken.and.returnValue('valid-token');
    mockAuthService.isTokenExpired.and.returnValue(false);
    mockAuthService.hasValidRefreshToken.and.returnValue(true);
    mockAuthService.refreshToken.and.returnValue(
      of({
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
        expiresIn: 3600,
        roles: [],
        scopes: [],
      }),
    );

    const req = new HttpRequest('GET', 'http://localhost:8080/api/products');
    const next: HttpHandlerFn = jasmine
      .createSpy('next')
      .and.callFake((r: HttpRequest<any>) => {
        if ((next as jasmine.Spy).calls.count() === 1) {
          return throwError(() => ({
            status: 401,
            error: { message: 'Unauthorized' },
          }));
        }
        return of(new HttpResponse({ status: 200 }));
      });

    TestBed.runInInjectionContext(() => tokenInterceptor(req, next)).subscribe({
      next: (res) => expect(res).toBeTruthy(),
      error: () => {},
    });

    expect(mockAuthService.refreshToken).toHaveBeenCalled();
  });

  it('should clear auth and redirect on 401 when refresh fails', () => {
    mockAuthService.getAccessToken.and.returnValue('valid-token');
    mockAuthService.isTokenExpired.and.returnValue(false);
    mockAuthService.hasValidRefreshToken.and.returnValue(true);
    mockAuthService.refreshToken.and.returnValue(
      throwError(() => ({ status: 401 })),
    );

    const req = new HttpRequest('GET', 'http://localhost:8080/api/products');
    const next: HttpHandlerFn = jasmine
      .createSpy('next')
      .and.returnValue(
        throwError(() => ({ status: 401, error: { message: 'Unauthorized' } })),
      );

    TestBed.runInInjectionContext(() => tokenInterceptor(req, next)).subscribe({
      error: () => {},
    });

    expect(mockAuthService.clearAuthData).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/register']);
  });

  it('should NOT handle 401 for auth requests', () => {
    mockAuthService.getAccessToken.and.returnValue('valid-token');
    mockAuthService.isTokenExpired.and.returnValue(false);

    const req = new HttpRequest(
      'POST',
      'http://localhost:8080/api/auth/login',
      {},
    );
    const next: HttpHandlerFn = jasmine
      .createSpy('next')
      .and.returnValue(throwError(() => ({ status: 401, error: {} })));

    TestBed.runInInjectionContext(() => tokenInterceptor(req, next)).subscribe({
      error: () => {},
    });

    expect(mockAuthService.refreshToken).not.toHaveBeenCalled();
  });

  it('should pass through non-401 errors', () => {
    mockAuthService.getAccessToken.and.returnValue('valid-token');
    mockAuthService.isTokenExpired.and.returnValue(false);

    const req = new HttpRequest('GET', 'http://localhost:8080/api/products');
    const next: HttpHandlerFn = jasmine
      .createSpy('next')
      .and.returnValue(
        throwError(() => ({ status: 500, error: { message: 'Server error' } })),
      );

    let errorStatus: number | undefined;
    TestBed.runInInjectionContext(() => tokenInterceptor(req, next)).subscribe({
      error: (err) => {
        errorStatus = err.status;
      },
    });

    expect(errorStatus).toBe(500);
    expect(mockAuthService.refreshToken).not.toHaveBeenCalled();
  });
});
