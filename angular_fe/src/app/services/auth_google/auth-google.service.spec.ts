import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthGoogleService } from './auth-google.service';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { ApiConfigService } from '../api-config/api-config.service';
import { RegisterLoginRequest } from 'src/app/interfaces/jwt/register_login_request.interface';
import { UserDTO } from 'src/app/interfaces/dtos/user_dto.interface';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

class MockRouter {
  navigate = jasmine
    .createSpy('navigate')
    .and.returnValue(Promise.resolve(true));
  url = '/dashboard';
}

class MockApiConfigService {
  apiUrlClassic = 'http://localhost:8080/api/auth';
  apiUrlGoogle = 'http://localhost:8080/oauth2';
}

describe('AuthGoogleService', () => {
  let service: AuthGoogleService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      providers: [
        AuthGoogleService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: new MockRouter() },
        { provide: ApiConfigService, useValue: new MockApiConfigService() },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    service = TestBed.inject(AuthGoogleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  // ============================================
  // CREATION TEST
  // ============================================

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ============================================
  // TOKEN STORAGE TESTS
  // ============================================

  it('should store and retrieve access token', () => {
    const token = 'test-access-token';
    sessionStorage.setItem('access_token', token);
    expect(service.getAccessToken()).toBe(token);
  });

  it('should return null when no access token exists', () => {
    sessionStorage.removeItem('access_token');
    expect(service.getAccessToken()).toBeNull();
  });

  // ============================================
  // USER ROLES TESTS
  // ============================================

  it('should get user roles from session storage', () => {
    const roles = ['USER', 'ADMIN'];
    sessionStorage.setItem('user_roles', JSON.stringify(roles));
    expect(service.getUserRoles()).toEqual(roles);
  });

  it('should return empty array when no roles exist', () => {
    sessionStorage.removeItem('user_roles');
    expect(service.getUserRoles()).toEqual([]);
  });

  it('should check if user has a specific role', () => {
    sessionStorage.setItem('user_roles', JSON.stringify(['USER', 'ADMIN']));
    expect(service.hasRole('USER')).toBeTrue();
    expect(service.hasRole('GUEST')).toBeFalse();
  });

  it('should check if user has any of the specified roles', () => {
    sessionStorage.setItem('user_roles', JSON.stringify(['USER']));
    expect(service.hasAnyRole(['USER', 'ADMIN'])).toBeTrue();
    expect(service.hasAnyRole(['GUEST', 'ADMIN'])).toBeFalse();
  });

  it('should check if user has all specified roles', () => {
    sessionStorage.setItem('user_roles', JSON.stringify(['USER', 'ADMIN']));
    expect(service.hasAllRoles(['USER', 'ADMIN'])).toBeTrue();
    expect(service.hasAllRoles(['USER', 'GUEST'])).toBeFalse();
  });

  // ============================================
  // USER SCOPES TESTS
  // ============================================

  it('should get user scopes from session storage', () => {
    const scopes = ['read', 'write'];
    sessionStorage.setItem('user_scopes', JSON.stringify(scopes));
    expect(service.getUserScopes()).toEqual(scopes);
  });

  it('should return empty array when no scopes exist', () => {
    sessionStorage.removeItem('user_scopes');
    expect(service.getUserScopes()).toEqual([]);
  });

  // ============================================
  // USER INFO TESTS
  // ============================================

  it('should get current user info from session storage', () => {
    const userInfo = {
      userId: '123',
      email: 'test@example.com',
      roles: ['USER'],
      scopes: [],
    };
    sessionStorage.setItem('user_info', JSON.stringify(userInfo));
    expect(service.getCurrentUserInfo()).toEqual(userInfo);
  });

  it('should return null when no user info exists', () => {
    sessionStorage.removeItem('user_info');
    expect(service.getCurrentUserInfo()).toBeNull();
  });

  // ============================================
  // TOKEN EXPIRY TESTS
  // ============================================

  it('should detect token as expired when no expiry exists', () => {
    sessionStorage.removeItem('token_expiry');
    expect(service.isTokenExpired()).toBeTrue();
  });

  it('should detect token as expired when expiry date is in the past', () => {
    const pastExpiry = new Date().getTime() - 10000;
    sessionStorage.setItem('token_expiry', pastExpiry.toString());
    expect(service.isTokenExpired()).toBeTrue();
  });

  it('should detect token as not expired when expiry date is in the future', () => {
    const futureExpiry = new Date().getTime() + 600000;
    sessionStorage.setItem('token_expiry', futureExpiry.toString());
    expect(service.isTokenExpired()).toBeFalse();
  });

  it('should detect token expiring soon', () => {
    const soonExpiry = new Date().getTime() + 2 * 60 * 1000;
    sessionStorage.setItem('token_expiry', soonExpiry.toString());
    expect(service.isTokenExpiringSoon(5)).toBeTrue();
  });

  // ============================================
  // REFRESH TOKEN TESTS
  // ============================================

  it('should get refresh token from session storage', () => {
    const refreshToken = { refreshToken: 'test-refresh-token' };
    sessionStorage.setItem('refresh_token', JSON.stringify(refreshToken));
    expect(service.getRefreshToken()).toEqual(refreshToken);
  });

  it('should return null when no refresh token exists', () => {
    sessionStorage.removeItem('refresh_token');
    expect(service.getRefreshToken()).toBeNull();
  });

  it('should check if valid refresh token exists', () => {
    const refreshToken = { refreshToken: 'test-refresh-token' };
    sessionStorage.setItem('refresh_token', JSON.stringify(refreshToken));
    expect(service.hasValidRefreshToken()).toBeTrue();
  });

  // ============================================
  // AUTHENTICATION STATUS TESTS
  // ============================================

  it('should return false for authentication when no token exists', () => {
    sessionStorage.removeItem('access_token');
    expect(service.checkAuthenticationStatus()).toBeFalse();
  });

  it('should return true for authentication when valid token exists', () => {
    const futureExpiry = new Date().getTime() + 600000;
    sessionStorage.setItem('access_token', 'valid-token');
    sessionStorage.setItem('token_expiry', futureExpiry.toString());
    expect(service.checkAuthenticationStatus()).toBeTrue();
  });

  // ============================================
  // CLEAR AUTH DATA TESTS
  // ============================================

  it('should clear all authentication data from session storage', () => {
    sessionStorage.setItem('access_token', 'test-token');
    sessionStorage.setItem('refresh_token', 'test-refresh');
    sessionStorage.setItem('user_roles', JSON.stringify(['USER']));
    sessionStorage.setItem('user_info', JSON.stringify({ userId: '123' }));

    service.clearAuthData();

    expect(sessionStorage.getItem('access_token')).toBeNull();
    expect(sessionStorage.getItem('refresh_token')).toBeNull();
    expect(sessionStorage.getItem('user_roles')).toBeNull();
    expect(sessionStorage.getItem('user_info')).toBeNull();
  });

  // ============================================
  // LOGIN TESTS
  // ============================================

  it('should call login endpoint with user data', () => {
    const loginData = { email: 'test@example.com', password: 'password123' };

    service.login(loginData).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginData);
    req.flush({}, { status: 200, statusText: 'OK' });
  });

  it('should handle login error', () => {
    const loginData = { email: 'test@example.com', password: 'wrong' };

    service.login(loginData).subscribe({
      error: (error) => {
        expect(error.status).toBe(401);
      },
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    req.flush(
      { message: 'Invalid credentials' },
      { status: 401, statusText: 'Unauthorized' },
    );
  });

  // ============================================
  // REGISTER TESTS
  // ============================================

  it('should call register endpoint with user data', () => {
    const registerData: RegisterLoginRequest = {
      email: 'newuser@example.com',
      password: 'password123',
    };

    const mockUser: UserDTO = {
      userId: 1,
      email: 'newuser@example.com',
      roles: 'USER',
      registrationDate: new Date(),
      lastLogin: new Date(),
      active: true,
    };

    service.register(registerData).subscribe((user) => {
      expect(user.email).toBe('newuser@example.com');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(registerData);
    req.flush(mockUser);
  });

  it('should handle register error', () => {
    const registerData: RegisterLoginRequest = {
      email: 'existing@example.com',
      password: 'password123',
    };

    service.register(registerData).subscribe({
      error: (error) => {
        expect(error.status).toBe(409);
      },
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
    req.flush(
      { message: 'User already exists' },
      { status: 409, statusText: 'Conflict' },
    );
  });

  // ============================================
  // LOGOUT TESTS
  // ============================================

  it('should logout manually with API call when manual is true', () => {
    sessionStorage.setItem('access_token', 'test-token');

    service.logoutUser(true).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should logout without API call when manual is false', (done) => {
    service.logoutUser(false).subscribe({
      next: () => {
        expect(true).toBeTrue();
        done();
      },
    });
    httpMock.expectNone('http://localhost:8080/api/auth/logout');
  });

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================

  it('should detect authentication error by status 401', () => {
    const error = { status: 401 };
    expect(service.isAuthenticationError(error)).toBeTrue();
  });

  it('should detect authentication error by status 403', () => {
    const error = { status: 403 };
    expect(service.isAuthenticationError(error)).toBeTrue();
  });

  it('should not detect non-authentication error', () => {
    const error = { status: 500 };
    expect(service.isAuthenticationError(error)).toBeFalse();
  });

  // ============================================
  // UTILITY METHODS TESTS
  // ============================================

  it('should reset refresh state', () => {
    expect(() => service.resetRefreshState()).not.toThrow();
  });

  it('should force reload user info', () => {
    expect(() => service.forceReloadUserInfo()).not.toThrow();
  });

  it('should debug token status without errors', () => {
    expect(() => service.debugTokenStatus()).not.toThrow();
  });

  it('should force token refresh', () => {
    expect(() => service.forceTokenRefresh()).not.toThrow();
  });
});
