import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {
  catchError,
  delay,
  filter,
  finalize,
  map,
  retryWhen,
  switchMap,
  take,
  tap,
  timeout,
} from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenResponse } from 'src/app/interfaces/jwt/token_response.interface';
import { isPlatformBrowser } from '@angular/common';
import { UserInfo } from 'src/app/interfaces/jwt/user_info_dto.interface';
import { RefreshRequest } from 'src/app/interfaces/jwt/refresh_request.interface';
import { RegisterLoginRequest } from 'src/app/interfaces/jwt/register_login_request.interface';
import { UserDTO } from 'src/app/interfaces/dtos/user_dto.interface';
import { ApiConfigService } from '../api-config/api-config.service';

/**
 * @category Authentication
 *
 * @description Service to manage authentication via Google OAuth2 and traditional login.
 * Handles access token storage, refresh logic, JWT decoding, session management,
 * user roles/scopes extraction, and automatic token renewal.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGoogleService {
  // -------------------- STORAGE KEYS --------------------

  /**
   * @description Key for storing the access token in sessionStorage.
   */
  private readonly TOKEN_KEY = 'access_token';

  /**
   * @description Key for storing the refresh token in sessionStorage.
   */
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  /**
   * @description Key for storing token expiry timestamp in sessionStorage.
   */
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';

  /**
   * @description Key for storing user roles in sessionStorage.
   */
  private readonly ROLES_KEY = 'user_roles';

  /**
   * @description Key for storing general user info in sessionStorage.
   */
  private readonly USER_INFO_KEY = 'user_info';

  /**
   * @description Key for storing JWT token cookie (used for cross-tab synchronization).
   */
  private readonly COOKIE_TOKEN_KEY = 'tokens';

  // -------------------- OBSERVABLES --------------------

  /**
   * @description Subject emitting authentication status (true = authenticated, false = not authenticated).
   * Used internally to update `isAuthenticated$` observable.
   */
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  /**
   * @description Public observable that emits authentication state changes.
   */
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  /**
   * @description Subject holding the current user info (or null if not authenticated).
   */
  private userInfoSubject = new BehaviorSubject<UserInfo | null>(null);

  /**
   * @description Public observable emitting the latest user information.
   */
  public userInfo$ = this.userInfoSubject.asObservable();

  /**
   * @description Flag indicating whether a token refresh operation is currently in progress.
   */
  refreshTokenInProgress = false;

  /**
   * @description Subject to notify multiple subscribers when a refresh token call completes.
   */
  refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  /**
   * @description Indicates whether client-side hydration (Angular browser bootstrap) is complete.
   */
  private hydrationComplete = false;

  /**
   * @description Timeout reference for auto-refreshing the token.
   */
  private tokenTimer: number | null = null;

  /**
   * @description Creates the service instance and sets up initial state.
   * Listens for storage changes to sync authentication across tabs.
   * @param http HttpClient for API calls
   * @param router Router for navigation
   * @param zone Angular NgZone for running outside Angular
   * @param apiConfig Service providing API endpoints
   * @param platformId Angular platform ID (browser/server)
   */
  constructor(
    private http: HttpClient,
    private router: Router,
    private zone: NgZone,
    private apiConfig: ApiConfigService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        setTimeout(() => {
          this.hydrationComplete = true;
          this.checkInitialAuthStatus();
        }, 100);
      });

      window.addEventListener('storage', (event) =>
        this.zone.runOutsideAngular(() => this.handleStorageEvent(event)),
      );
    }
  }
  // -------------------- HYDRATION METHODS --------------------

  /**
   * @description Waits until client-side hydration is complete before executing auth logic.
   * @returns Observable resolving to true when hydration is complete
   */
  public waitForHydration(): Observable<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(false);
    }

    if (this.hydrationComplete) {
      return of(true);
    }

    return new Observable((observer) => {
      const checkHydration = () => {
        if (this.hydrationComplete) {
          observer.next(true);
          observer.complete();
        } else {
          setTimeout(checkHydration, 50);
        }
      };
      checkHydration();
    });
  }

  /**
   * @description Handles storage events to synchronize authentication across browser tabs.
   * @param event StorageEvent triggered on storage change
   */
  private handleStorageEvent(event: StorageEvent): void {
    if (event.key === this.TOKEN_KEY || event.key === this.REFRESH_TOKEN_KEY) {
      this.checkInitialAuthStatus();
    }
  }

  // -------------------- COOKIE HANDLING --------------------

  /**
   * @description Safely parses cookies into a key-value object.
   * @returns Parsed cookies as an object
   */
  private parseCookiesSafely(): Record<string, string> {
    if (!isPlatformBrowser(this.platformId)) {
      return {};
    }

    const parsed = Object.fromEntries(
      document.cookie
        .split(';')
        .map((cookie) => {
          const [key, ...valueParts] = cookie.trim().split('=');
          const value = valueParts.join('=');

          if (key === this.COOKIE_TOKEN_KEY) {
            try {
              const decodedValue = decodeURIComponent(value);

              let safeValue = decodedValue
                .replace(/-/g, '+')
                .replace(/_/g, '/')
                .replace(/\s+/g, '');

              const paddingLength = safeValue.length % 4;
              if (paddingLength) {
                safeValue += '='.repeat(4 - paddingLength);
              }

              return [key, safeValue];
            } catch (error) {
              return [key, ''];
            }
          }

          return [key, decodeURIComponent(value)];
        })
        .filter(([key, value]) => key && value),
    );

    return parsed;
  }

  /**
   * @description Processes the special "tokens" cookie and stores JWT data in session storage.
   * @returns True if processing succeeded, false otherwise
   */
  private processCookieTokens(): boolean {
    const cookies = this.parseCookiesSafely();

    if (!cookies[this.COOKIE_TOKEN_KEY]) {
      return false;
    }

    try {
      const decodedTokens = atob(cookies[this.COOKIE_TOKEN_KEY]);
      const tokenData: TokenResponse = JSON.parse(decodedTokens);

      if (tokenData.accessToken?.split('.').length !== 3) {
        throw new Error('Formato JWT non valido');
      }

      this.storeTokens(tokenData);
      this.clearTokenCookie();
      this.isAuthenticatedSubject.next(true);
      this.loadUserInfo();

      return true;
    } catch (error) {
      this.clearTokenCookie();
      return false;
    }
  }

  /**
   * @description Clears the "tokens" cookie from the browser.
   */
  private clearTokenCookie(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.cookie = `tokens=; Max-Age=-99999999; path=/; domain=${window.location.hostname};`;
  }

  /**
   * @description Initializes authentication state after hydration.
   */
  public pub_init() {
    this.checkInitialAuthStatus();
  }

  /**
   * @description Checks initial authentication state and refreshes tokens if needed.
   */
  private checkInitialAuthStatus(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.processCookieTokens()) {
      return;
    }

    const token = this.getAccessToken();

    if (token) {
      if (!this.isTokenExpired()) {
        this.isAuthenticatedSubject.next(true);
        this.loadUserInfo();

        const expiry = sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);
        if (expiry) {
          const expiresIn = Math.floor(
            (Number(expiry) - new Date().getTime()) / 1000,
          );
          this.startTokenTimer(expiresIn);
        }
      } else {
        if (this.shouldAttemptRefresh()) {
          this.refreshToken().subscribe({
            next: () => {},
            error: (error) => {
              this.handleRefreshError(error);
            },
          });
        } else {
          this.clearAuthData();
        }
      }
    } else {
      this.clearAuthData();
    }
  }

  /**
   * @description Resets the refresh token state to allow future refreshes.
   */
  public resetRefreshState(): void {
    this.refreshTokenInProgress = false;
    this.refreshTokenSubject.next(null);
  }

  /**
   * @description Loads user information from the JWT payload into session storage.
   */
  private loadUserInfo(): void {
    const token = this.getAccessToken();

    if (!token) {
      this.userInfoSubject.next(null);
      return;
    }

    try {
      const payload = this.decodeJwtPayload(token);

      const rolesFromToken =
        payload.roles || payload.role || payload.authorities || [];
      const rolesArray = Array.isArray(rolesFromToken)
        ? rolesFromToken
        : [rolesFromToken];

      const scopesFromToken = payload.scope || payload.scopes || '';
      const scopesArray =
        typeof scopesFromToken === 'string'
          ? scopesFromToken.split(' ').filter((s) => s.length > 0)
          : Array.isArray(scopesFromToken)
            ? scopesFromToken
            : [];

      const userInfo: UserInfo = {
        userId: payload.sub || payload.user_id || '',
        email: payload.email || payload.username || '',
        roles: rolesArray,
        scopes: scopesArray,
      };

      this.userInfoSubject.next(userInfo);
      sessionStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
      sessionStorage.setItem(this.ROLES_KEY, JSON.stringify(userInfo.roles));
      sessionStorage.setItem('user_scopes', JSON.stringify(userInfo.scopes));
    } catch (error) {
      this.userInfoSubject.next(null);
    }
  }

  /**
   * @description Forces a reload of user information.
   */
  public forceReloadUserInfo(): void {
    this.loadUserInfo();
  }

  /**
   * @description Decodes the payload of a JWT.
   * @param token JWT string
   * @returns Parsed JWT payload as an object
   * @throws Error if the token is invalid
   */
  private decodeJwtPayload(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Formato JWT non valido');
      }

      let payload = parts[1];
      payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const pad = payload.length % 4;
      if (pad) {
        payload += '='.repeat(4 - pad);
      }

      const decoded = atob(payload);
      const parsed = JSON.parse(decoded);
      return parsed;
    } catch (error) {
      throw new Error('Errore nella decodifica del payload JWT');
    }
  }

  /**
   * @description Retrieves the current user's roles from session storage.
   * @returns Array of user roles
   */
  public getUserRoles(): string[] {
    if (isPlatformBrowser(this.platformId)) {
      const roles = sessionStorage.getItem(this.ROLES_KEY);
      const parsedRoles = roles ? JSON.parse(roles) : [];
      return parsedRoles;
    }

    return [];
  }

  /**
   * @description Retrieves user roles with retry if they are not yet loaded.
   * @param maxRetries Number of retry attempts
   * @returns Observable emitting an array of user roles
   */
  public getUserRolesWithRetry(maxRetries: number = 3): Observable<string[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }

    return this.waitForHydration().pipe(
      switchMap(() => {
        const roles = this.getUserRoles();
        if (roles.length > 0) {
          return of(roles);
        }

        return this.userInfo$.pipe(
          take(1),
          map((userInfo) => userInfo?.roles || []),
          retryWhen((errors) => errors.pipe(take(maxRetries), delay(100))),
        );
      }),
    );
  }

  /**
   * @description Ensures that user data is loaded and available.
   * @returns Observable emitting true if user data is available
   */
  public ensureUserDataLoaded(): Observable<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(false);
    }

    return this.waitForHydration().pipe(
      switchMap(() => {
        const userInfo = this.getCurrentUserInfo();
        if (userInfo && userInfo.roles.length > 0) {
          return of(true);
        }

        this.forceReloadUserInfo();

        return this.userInfo$.pipe(
          filter((info) => info !== null && info.roles.length > 0),
          take(1),
          map(() => true),
          timeout(5000),
          catchError(() => of(false)),
        );
      }),
    );
  }

  /**
   * @description Retrieves user scopes from session storage.
   * @returns Array of user scopes
   */
  public getUserScopes(): string[] {
    if (isPlatformBrowser(this.platformId)) {
      const scopes = sessionStorage.getItem('user_scopes');
      const parsedScopes = scopes ? JSON.parse(scopes) : [];
      return parsedScopes;
    }

    return [];
  }

  /**
   * @description Checks if the current user has a specific role.
   * @param role Role name to check
   * @returns True if user has the role
   */
  public hasRole(role: string): boolean {
    const hasRole = this.getUserRoles().includes(role);
    return hasRole;
  }

  /**
   * @description Checks if the current user has any of the specified roles.
   * @param roles Array of role names
   * @returns True if user has at least one role
   */
  public hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    const hasAny = roles.some((role) => userRoles.includes(role));
    return hasAny;
  }

  /**
   * @description Checks if the current user has all of the specified roles.
   * @param roles Array of role names
   * @returns True if user has all roles
   */
  public hasAllRoles(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    const hasAll = roles.every((role) => userRoles.includes(role));
    return hasAll;
  }

  /**
   * @description Retrieves the current user's information from session storage.
   * @returns UserInfo object or null if not available
   */
  public getCurrentUserInfo(): UserInfo | null {
    if (isPlatformBrowser(this.platformId)) {
      const userInfo = sessionStorage.getItem(this.USER_INFO_KEY);
      const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;
      return parsedUserInfo;
    }

    return null;
  }

  /**
   * @description Initiates Google OAuth login by redirecting to the login endpoint.
   */
  public initiateGoogleLogin(): void {
    if (isPlatformBrowser(this.platformId)) {
      const currentRoute = encodeURIComponent(this.router.url);
      window.location.href = `${this.apiConfig.apiUrlGoogle}/login?state=${currentRoute}`;
    } else {
    }
  }

  /**
   * @description Clears authentication data from session storage and navigates to register page.
   */
  public clearAuthData(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(this.TOKEN_EXPIRY_KEY);
      sessionStorage.removeItem(this.ROLES_KEY);
      sessionStorage.removeItem('user_scopes');
      sessionStorage.removeItem(this.USER_INFO_KEY);
    }

    this.isAuthenticatedSubject.next(false);
    this.userInfoSubject.next(null);
    this.router.navigate(['/register']);
  }

  /**
   * @description Retrieves the stored access token from session storage.
   * @returns Access token string or null
   */
  public getAccessToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const token = sessionStorage.getItem(this.TOKEN_KEY);
      return token;
    }

    return null;
  }

  /**
   * @description Retrieves the stored refresh token from session storage.
   * @returns RefreshRequest object or null
   */
  public getRefreshToken(): RefreshRequest | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const stored = sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
    return stored ? (JSON.parse(stored) as RefreshRequest) : null;
  }

  /**
   * @description Determines if the current access token is expired.
   * @param thresholdSeconds Optional threshold in seconds before expiration
   * @returns True if token is expired
   */
  public isTokenExpired(thresholdSeconds: number = 30): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    const expiry = sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) {
      return true;
    }

    const currentTime = new Date().getTime();
    const expiryTime = Number(expiry) - thresholdSeconds * 1000;
    const isExpired = currentTime >= expiryTime;

    return isExpired;
  }

  /**
   * @description Checks if a valid refresh token exists.
   * @returns True if refresh token is available
   */
  public hasValidRefreshToken(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const refreshToken = this.getRefreshToken();
    const hasToken = refreshToken && refreshToken.refreshToken;

    return !!hasToken;
  }

  /**
   * @description Stores access and refresh tokens, expiration, roles, and scopes in session storage.
   * @param tokens TokenResponse object containing token data
   */
  private storeTokens(tokens: TokenResponse): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    sessionStorage.setItem(this.TOKEN_KEY, tokens.accessToken);

    if (tokens.refreshToken) {
      const refreshReq: RefreshRequest = { refreshToken: tokens.refreshToken };
      sessionStorage.setItem(
        this.REFRESH_TOKEN_KEY,
        JSON.stringify(refreshReq),
      );
    }

    const expiresInMs = tokens.expiresIn * 1000;
    const expiryDate = new Date().getTime() + expiresInMs;
    sessionStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryDate.toString());

    if (tokens.roles && tokens.roles.length > 0) {
      sessionStorage.setItem(this.ROLES_KEY, JSON.stringify(tokens.roles));
    } else {
      try {
        const payload = this.decodeJwtPayload(tokens.accessToken);
        const rolesFromJWT = payload.roles || payload.role || [];
        const rolesArray = Array.isArray(rolesFromJWT)
          ? rolesFromJWT
          : [rolesFromJWT];
        if (rolesArray.length > 0) {
          sessionStorage.setItem(this.ROLES_KEY, JSON.stringify(rolesArray));
        }
      } catch (error) {}
    }

    if (tokens.scopes && tokens.scopes.length > 0) {
      sessionStorage.setItem('user_scopes', JSON.stringify(tokens.scopes));
    } else {
      try {
        const payload = this.decodeJwtPayload(tokens.accessToken);
        const scopesFromJWT = payload.scope || payload.scopes || '';
        const scopesArray =
          typeof scopesFromJWT === 'string'
            ? scopesFromJWT.split(' ').filter((s) => s.length > 0)
            : Array.isArray(scopesFromJWT)
              ? scopesFromJWT
              : [];
        if (scopesArray.length > 0) {
          sessionStorage.setItem('user_scopes', JSON.stringify(scopesArray));
        }
      } catch (error) {}
    }
  }

  /**
   * @description Determines if the token is about to expire within the given threshold.
   * @param thresholdMinutes Minutes before expiration to trigger warning
   * @returns True if token is expiring soon
   */
  public isTokenExpiringSoon(thresholdMinutes = 5): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    const expiry = sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) {
      return true;
    }

    const currentTimestamp = new Date().getTime();
    const expiryTimestamp = Number(expiry);
    const remainingTimeMs = expiryTimestamp - currentTimestamp;
    const thresholdMs = thresholdMinutes * 60 * 1000;
    return remainingTimeMs <= thresholdMs;
  }

  /**
   * @description Refreshes the access token using the stored refresh token.
   * Handles multiple simultaneous refresh attempts safely.
   * @returns Observable emitting the new TokenResponse
   */
  public refreshToken(): Observable<TokenResponse> {
    if (this.refreshTokenInProgress) {
      return this.refreshTokenSubject.pipe(
        filter((result) => result !== null),
        take(1),
        switchMap((result) => {
          if (result) {
            return of(result);
          }
          return throwError(() => new Error('Refresh token failed'));
        }),
      );
    }

    const refreshReq = this.getRefreshToken();
    if (!refreshReq || !this.shouldAttemptRefresh()) {
      this.clearAuthData();
      this.router.navigate(['/register']);
      this.refreshTokenInProgress = false;
      return throwError(
        () => new Error('Nessun token di aggiornamento disponibile'),
      );
    }

    this.refreshTokenInProgress = true;
    this.refreshTokenSubject.next(null);

    return this.http
      .post<TokenResponse>(`${this.apiConfig.apiUrlGoogle}/refresh`, refreshReq)
      .pipe(
        tap((tokens) => {
          this.storeTokens(tokens);
          this.loadUserInfo();

          this.isAuthenticatedSubject.next(true);
          this.refreshTokenInProgress = false;
          this.refreshTokenSubject.next(tokens);

          this.startTokenTimer(tokens.expiresIn);
        }),
        catchError((error: HttpErrorResponse) => {
          this.refreshTokenInProgress = false;
          this.refreshTokenSubject.next(null);

          this.handleRefreshError(error);

          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshTokenInProgress = false;
        }),
      );
  }

  /**
   * @description Determines whether a refresh token attempt should be made.
   * @returns True if conditions allow a refresh
   */
  private shouldAttemptRefresh(): boolean {
    const token = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (
      !refreshToken ||
      this.refreshTokenInProgress ||
      !this.isAuthenticatedSubject.value
    ) {
      return false;
    }

    return true;
  }

  /**
   * @description Debug helper to log the current token status to the console.
   */
  public debugTokenStatus(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const token = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const expiry = sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);

    if (expiry) {
      const expiryDate = new Date(Number(expiry));
      const now = new Date();
      const remainingMs = Number(expiry) - now.getTime();
      const remainingMinutes = Math.floor(remainingMs / 60000);
    }
  }

  /**
   * @description Centralized handler for refresh token errors.
   * @param error Error object from refresh attempt
   */
  private handleRefreshError(error: any): void {
    if (
      error.error?.message === 'SESSION_EXPIRED' ||
      error.message === 'SESSION_EXPIRED' ||
      error.status === 401 ||
      error.status === 403
    ) {
      this.clearAuthData();
      this.router.navigate(['/register']);
    } else {
      if (error.status !== 0 && error.status !== 502 && error.status !== 503) {
        this.clearAuthData();
        this.router.navigate(['/register']);
      }
    }
  }

  /**
   * @description Forces a refresh token request manually.
   */
  public forceTokenRefresh(): void {
    if (this.shouldAttemptRefresh()) {
      this.refreshToken().subscribe({
        next: () => {},
        error: () => {},
      });
    } else {
      this.debugTokenStatus();
    }
  }

  /**
   * @description Checks if the user is currently considered authenticated.
   * @returns True if user is authenticated
   */
  public checkAuthenticationStatus(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const token = this.getAccessToken();
    if (!token) {
      return false;
    }

    if (this.isTokenExpired()) {
      if (this.hasValidRefreshToken()) {
        return true;
      } else {
        return false;
      }
    }

    return true;
  }

  /**
   * @description Starts a timer to automatically refresh the token before it expires.
   * @param expiresIn Token validity duration in seconds
   */
  private startTokenTimer(expiresIn: number): void {
    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
    }
    const timeUntilRefresh = expiresIn * 1000 - 5 * 60 * 1000;
    if (timeUntilRefresh > 0) {
      this.tokenTimer = window.setTimeout(() => {
        this.refreshToken().subscribe({
          next: () => {},
          error: (error) => {},
        });
      }, timeUntilRefresh);
    }
  }

  /**
   * @description Logs out the user from the Google endpoint and clears local session.
   * @returns Observable completing when logout finishes
   */
  public logout(): Observable<void> {
    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
    }

    return this.http
      .post<void>(this.apiConfig.apiUrlGoogle + '/logout', {})
      .pipe(
        tap(() => {
          this.clearAuthData();
          this.router.navigate(['/login']);
        }),
      );
  }

  /**
   * @description Checks if an error indicates an authentication failure.
   * @param error Error object to inspect
   * @returns True if error is authentication-related
   */
  public isAuthenticationError(error: any): boolean {
    return (
      error.status === 401 ||
      error.status === 403 ||
      error.error?.message === 'SESSION_EXPIRED' ||
      error.message === 'SESSION_EXPIRED'
    );
  }

  /**
   * @description Forces user logout, clearing session and navigating to register.
   * @param reason Optional reason for logout
   */
  public forceLogout(reason: string = 'Authentication error'): void {
    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
    }

    this.refreshTokenInProgress = false;
    this.refreshTokenSubject.next(null);

    this.clearAuthData();
    this.router.navigate(['/register']);
  }

  // -------------------- TRADITIONAL LOGIN --------------------

  /**
   * @description Performs traditional login with email and password.
   * @param userData Object containing email and password
   * @returns Observable completing on success
   */
  login(userData: { email: string; password: string }): Observable<void> {
    return this.http
      .post(`${this.apiConfig.apiUrlClassic}/login`, userData, {
        withCredentials: true,
        observe: 'response',
      })
      .pipe(
        tap((response) => {
          if (response.status === 200) {
          }
          return response;
        }),
        map(() => void 0),
        catchError((err) => {
          return throwError(() => err);
        }),
      );
  }

  /**
   * @description Cleans up session storage and resets authentication state after logout.
   */
  private cleanUpAfterLogout(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.clear();
    }
    this.isAuthenticatedSubject.next(false);
    this.userInfoSubject.next(null);
    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
      this.tokenTimer = null;
    }
    this.router.navigate(['/login']).then((success) => {});
  }

  /**
   * @description Registers a new user with email, password, and optional details.
   * @param userData RegisterLoginRequest containing user information
   * @returns Observable emitting the created UserDTO
   */
  public register(userData: RegisterLoginRequest): Observable<UserDTO> {
    return this.http
      .post<UserDTO>(`${this.apiConfig.apiUrlClassic}/register`, userData)
      .pipe(
        tap((user) => {}),
        catchError((error) => {
          return throwError(() => error);
        }),
      );
  }

  /**
   * @description Logs out the user manually or automatically, optionally sending request to backend.
   * @param manual True for manual logout with API call, false for automatic cleanup
   * @returns Observable completing when logout finishes
   */
  public logoutUser(manual: boolean = false): Observable<void> {
    const accessToken = this.getAccessToken();

    if (manual && accessToken) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${accessToken}`,
      });

      return this.http
        .post<void>(`${this.apiConfig.apiUrlClassic}/logout`, {}, { headers })
        .pipe(
          tap(() => {
            this.cleanUpAfterLogout();
          }),
          catchError((err) => {
            this.cleanUpAfterLogout();
            return of(void 0);
          }),
        );
    }

    this.cleanUpAfterLogout();
    return of(void 0);
  }
}
