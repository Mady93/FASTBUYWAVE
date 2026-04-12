import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router'; // Questi sono necessari per la guard
import { catchError, map, Observable, of, switchMap, timeout } from 'rxjs'; // Import per l'uso di Observable
import { AuthGoogleService } from '../auth_google/auth-google.service';
import { isPlatformBrowser } from '@angular/common';

/**
 * @category Authentication
 *
 * @implements {CanActivate}
 *
 * @description
 * Angular route guard that controls access to routes based on user authentication
 * and roles. Works both client-side and server-side, providing temporary access
 * during server-side rendering (SSR). On the client, it waits for user data hydration,
 * checks authentication status, and verifies required roles before granting access.
 *
 * Redirects to `/register` if the user is unauthenticated or lacks the required roles.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  /**
   * @description Creates an instance of AuthGuard.
   *
   * @param {AuthGoogleService} authService - Service handling authentication and user info.
   * @param {Router} router - Angular Router for navigation.
   * @param {Object} platformId - Injected platform ID to distinguish browser vs server.
   */
  constructor(
    private authService: AuthGoogleService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  /**
   * Determines whether a route can be activated.
   *
   * @param {ActivatedRouteSnapshot} route - The route snapshot containing route data.
   * @param {RouterStateSnapshot} state - The current router state snapshot.
   * @returns {boolean | Observable<boolean> | Promise<boolean>}
   *   Returns `true` if access is allowed, `false` if denied, or an Observable/Promise resolving to a boolean.
   *
   * @description
   * This method:
   * 1. Checks if any roles are required for the route.
   * 2. Allows access on server-side (SSR) for temporary hydration.
   * 3. Waits for user data to load on the client-side.
   * 4. Verifies authentication status.
   * 5. Checks if the user has any of the required roles.
   * 6. Redirects to `/register` with query parameters if access is denied.
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | Observable<boolean> | Promise<boolean> {
    const requiredRoles: string[] = route.data['roles'] || [];

    // Se non ci sono ruoli richiesti, permetti l'accesso
    if (requiredRoles.length === 0) {
      return true;
    }

    // Sul server, permetto sempre l'accesso se non è una piattaforma browser
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[AuthGuard] Server-side: allowing temporary access');
      return true;
    }

    // Client-side: aspetta l'hydration e verifica i ruoli
    return this.authService.ensureUserDataLoaded().pipe(
      timeout(10000), // Timeout dopo 10 secondi
      switchMap((dataLoaded) => {
        if (!dataLoaded) {
          console.log('[AuthGuard] Unable to load user data');
          this.navigateToRegister(state.url, requiredRoles);
          return of(false);
        }

        // Verifica autenticazione
        const isAuthenticated = this.authService.checkAuthenticationStatus();
        if (!isAuthenticated) {
          console.log('[AuthGuard] User not authenticated, redirect to login');
          this.navigateToRegister(state.url, requiredRoles);
          return of(false);
        }

        // Verifica ruoli
        return this.authService.getUserRolesWithRetry().pipe(
          map((userRoles) => {
            const hasRole = requiredRoles.some((role) =>
              userRoles.includes(role),
            );

            if (!hasRole) {
              console.log('[AuthGuard] User does not have the required roles');
              console.log('[AuthGuard] Ruoli utente:', userRoles);
              this.navigateToRegister(state.url, requiredRoles);
              return false;
            }

            console.log('[AuthGuard] Access granted for user roles');
            return true;
          }),
        );
      }),
      catchError((error) => {
        console.error('[AuthGuard] Error in verification');

        // Se è un errore di autenticazione, forza il logout
        if (this.authService.isAuthenticationError(error)) {
          console.log(
            '[AuthGuard] Authentication error detected, forcing logout',
          );
          this.authService.forceLogout('Authentication error in guard');
        } else {
          this.navigateToRegister(state.url, requiredRoles);
        }

        return of(false);
      }),
    );
  }

  /**
   * @description Navigates the user to the `/register` route with query parameters indicating
   * the original return URL and required roles.
   *
   * @private
   * @param {string} returnUrl - The URL the user attempted to access.
   * @param {string[]} requiredRoles - Roles required for the route.
   */
  private navigateToRegister(returnUrl: string, requiredRoles: string[]): void {
    this.router.navigate(['/register'], {
      queryParams: {
        returnUrl: returnUrl,
        requiredRoles: requiredRoles.join(','),
      },
    });
  }
}
