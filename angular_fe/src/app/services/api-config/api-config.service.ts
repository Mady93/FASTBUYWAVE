import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from 'src/app/environments/environment';

/**
 * @category Configuration
 *
 * @description Service to provide API endpoints configuration dynamically.
 * Handles detection of the backend URL based on environment settings,
 * browser hostname, and SSR (server-side rendering) fallback.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  private baseUrl: string;

  /**
   * @description Initializes the service and determines the backend URL.
   * @param platformId Angular platform ID to detect browser/server
   */
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.baseUrl = this.detectBackendUrl();
  }

  /**
   * @description Detects the backend URL dynamically based on environment and platform.
   * @returns The full backend base URL (including port)
   */
  private detectBackendUrl(): string {
    if (environment.forceBackendHost) {
      return `http://${environment.forceBackendHost}:${environment.backendPort}`;
    }

    if (isPlatformBrowser(this.platformId)) {
      const frontendHost = window.location.hostname;
      const backendHost = environment.hostMapping[frontendHost] || frontendHost;
      return `http://${backendHost}:${environment.backendPort}`;
    } else {
      const fallbackHost = environment.ssrBackendHost || 'localhost';
      return `http://${fallbackHost}:${environment.backendPort}`;
    }
  }

  // -------------------- API ENDPOINTS --------------------

  /** @description Classic authentication API endpoint */
  get apiUrlClassic(): string {
    return `${this.baseUrl}/api/auth`;
  }

  /** @description Google OAuth2 API endpoint */
  get apiUrlGoogle(): string {
    return `${this.baseUrl}/oauth2`;
  }

  /** @description Likes API endpoint */
  get apiLikes(): string {
    return `${this.baseUrl}/api/likes`;
  }

  /** @description Category API endpoint */
  get apiCategory(): string {
    return `${this.baseUrl}/api/category`;
  }

  /** @description User API endpoint */
  get apiUser(): string {
    return `${this.baseUrl}/api/user`;
  }

  /** @description Address API endpoint */
  get apiAddress(): string {
    return `${this.baseUrl}/api/address`;
  }

  /** @description Advertisements API endpoint */
  get apiAdvertisements(): string {
    return `${this.baseUrl}/api/advertisements`;
  }

  /** @description Profiles API endpoint */
  get apiProfile(): string {
    return `${this.baseUrl}/api/profiles`;
  }

  /** @description Products API endpoint */
  get apiProducts(): string {
    return `${this.baseUrl}/api/products`;
  }

  /** @description Appointments API endpoint */
  get apiAppointments(): string {
    return `${this.baseUrl}/api/appointments`;
  }

  /** @description Chat API endpoint */
  get apiChat(): string {
    return `${this.baseUrl}/api/chat`;
  }

  /** @description Contact requests API endpoint */
  get apiContact(): string {
    return `${this.baseUrl}/api/contact/requests`;
  }

  /** @description Comments API endpoint */
  get apiComments(): string {
    return `${this.baseUrl}/api/comments`;
  }

  /** @description Shopping cart API endpoint */
  get apiCart(): string {
    return `${this.baseUrl}/api/v1/cart`;
  }

  /** @description Orders API endpoint */
  get apiOrder(): string {
    return `${this.baseUrl}/api/v1/orders`;
  }

  /** @description Payments API endpoint */
  get apiPayment(): string {
    return `${this.baseUrl}/api/v1/payments`;
  }

  /** @description Dashboard API endpoint */
  get apiDashboard(): string {
    return `${this.baseUrl}/api/dashboard`;
  }

  /** @description Appointment proposals API endpoint */
  get apiAppointmentProposal(): string {
    return `${this.baseUrl}/api/appointment/proposals`;
  }

  // -------------------- UTILITY METHODS --------------------

  /**
   * @description Returns the base backend URL without path.
   * @returns The backend base URL (http://host:port)
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * @description Logs the current API configuration to the console (browser only).
   * Useful for debugging frontend/backend host mapping.
   */
  logConfiguration(): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log('╔══════════════════════════════════════╗');
      console.log('║       API CONFIGURATION              ║');
      console.log('╚══════════════════════════════════════╝');
      console.log(`🌐 Frontend: ${window.location.hostname}`);
      console.log(`🎯 Backend:  ${this.baseUrl}`);
      console.log('═══════════════════════════════════════');
    }
  }
}
