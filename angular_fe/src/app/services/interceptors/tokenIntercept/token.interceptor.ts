import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpEvent,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { inject, NgZone } from '@angular/core';
import { AuthGoogleService } from '../../auth_google/auth-google.service';
import { Router } from '@angular/router';
import { SENSITIVE_URLS } from 'src/app/environments/auth-urls';

/**
 *
 * @description Tracks whether a token refresh request is currently in progress.
 * Ensures that multiple requests don't trigger concurrent refresh calls.
 */
let isRefreshing = false;

/**
 * @description BehaviorSubject used to queue HTTP requests while a token refresh is in progress.
 * Emits the new access token once refresh completes, allowing queued requests to continue.
 */
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * @category Authentication
 *
 * @function tokenInterceptor
 *
 * @description
 * HTTP interceptor that automatically attaches the access token to outgoing requests,
 * handles token expiration, and refreshes the token when necessary.
 * Ensures authentication flow consistency with automatic logout and redirection
 * to the registration/login page in case of critical authentication errors (401 or 403).
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param req The outgoing HTTP request
 * @param next The next handler in the chain, which continues the request
 * @returns Observable emitting the HTTP event stream with token attached or error handling applied
 *
 * @example
 * // Provide as HTTP interceptor in Angular
 * {
 *   provide: HTTP_INTERCEPTORS,
 *   useClass: tokenInterceptor,
 *   multi: true
 * }
 *
 * @notes
 * - Skips authentication for specific URLs (login, refresh, logout, public APIs)
 * - Performs proactive token refresh if the token is expired before request
 * - Handles concurrent refresh attempts using a BehaviorSubject to queue requests
 * - Clears authentication data and redirects to '/register' if refresh fails or is invalid
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authGoogleService = inject(AuthGoogleService);
  const zone = inject(NgZone);
  const router = inject(Router);

  /**
   * @description Adds the Authorization header with Bearer token to the request.
   *
   * @param {HttpRequest<any>} request
   * @returns {HttpRequest<any>}
   */
  const addAuthHeader = (request: HttpRequest<any>): HttpRequest<any> => {
    const token = authGoogleService.getAccessToken();
    if (token && !isAuthRequest(request)) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    return request;
  };

  /**
   * @description Determines whether the request URL should skip authentication headers.
   *
   * @param {HttpRequest<any>} request
   * @returns {boolean}
   */
  const isAuthRequest = (request: HttpRequest<any>): boolean => {
    return (
      request.url.includes('/login') ||
      request.url.includes('/refresh') ||
      request.url.includes('/logout') ||
      request.url.includes(SENSITIVE_URLS.REGISTER) ||
      request.url.startsWith('https://restcountries.com/') ||
      request.url.startsWith('https://nominatim.openstreetmap.org/') ||
      request.url.startsWith('https://countriesnow.space/')
    );
  };

  /**
   * @description Handles 401/403 HTTP errors by attempting to refresh the token.
   * Queues concurrent requests while refresh is in progress.
   *
   * @param {HttpRequest<any>} request
   * @returns {Observable<HttpEvent<any>>}
   */
  const handle401Error = (
    request: HttpRequest<any>,
  ): Observable<HttpEvent<any>> => {
    return zone.runOutsideAngular(() => {
      if (!authGoogleService.hasValidRefreshToken()) {
        console.log(
          '[tokenInterceptor] No valid refresh token, clearing auth data',
        );
        zone.run(() => {
          authGoogleService.clearAuthData();
          router.navigate(['/register']);
        });
        return throwError(() => new Error('No valid refresh token'));
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authGoogleService.refreshToken().pipe(
          switchMap((tokens) => {
            isRefreshing = false;
            refreshTokenSubject.next(tokens.accessToken);
            return next(addAuthHeader(request));
          }),
          catchError((error) => {
            isRefreshing = false;
            refreshTokenSubject.next(null);

            console.error('[tokenInterceptor] Error during refresh:', error);

            if (error.status === 401 || error.status === 403) {
              zone.run(() => {
                console.log(
                  '[tokenInterceptor] Authentication error, clearing auth data and redirecting',
                );
                authGoogleService.clearAuthData();
                router.navigate(['/register']);
              });
            }

            return throwError(() => error);
          }),
        );
      } else {
        return refreshTokenSubject.pipe(
          filter((token) => token !== null),
          take(1),
          switchMap(() => next(addAuthHeader(request))),
        );
      }
    });
  };

  const token = authGoogleService.getAccessToken();
  if (token && !isAuthRequest(req) && authGoogleService.isTokenExpired()) {
    console.log(
      '[tokenInterceptor] Token expired, attempting proactive refresh',
    );
    return handle401Error(req);
  }

  return next(addAuthHeader(req)).pipe(
    catchError((error: HttpErrorResponse) => {
      const backendMessage =
        error.error?.message ?? JSON.stringify(error.error) ?? '';
      console.error(
        `[tokenInterceptor] Error HTTP: ${error.status} - ${backendMessage}`,
      );

      if (
        (error.status === 401 || error.status === 403) &&
        !isAuthRequest(req)
      ) {
        console.log(
          '[tokenInterceptor] Authentication error detected, attempting handling',
        );
        return handle401Error(req);
      }

      return throwError(() => error);
    }),
  );
};
