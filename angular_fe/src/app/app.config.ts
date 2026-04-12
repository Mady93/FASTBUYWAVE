import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withHttpTransferCacheOptions, withNoHttpTransferCache } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {withEventReplay} from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { tokenInterceptor } from './services/interceptors/tokenIntercept/token.interceptor';
import { provideNativeDateAdapter } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [

    provideZoneChangeDetection({ 
      eventCoalescing: true,
      runCoalescing: true

     }),
   provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      })
    ),
    provideClientHydration(
      withEventReplay(),
      withNoHttpTransferCache(),
      withHttpTransferCacheOptions({
        includePostRequests: true
      })
    ),
    provideAnimationsAsync('noop'),
    provideHttpClient(
      withFetch(),
      withInterceptors([tokenInterceptor]),
      withInterceptorsFromDi()
    ),
    provideNativeDateAdapter()

  ]
};

