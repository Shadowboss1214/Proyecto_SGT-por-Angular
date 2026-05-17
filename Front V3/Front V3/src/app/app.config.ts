import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // <-- IMPORTANTE
import { authInterceptor } from './core/interceptors/auth.interceptor'; // <-- IMPORTANTE

/**
 * Root application configuration.
 *
 * Registers the router and the HTTP client with the auth interceptor so that
 * every outgoing request carries the Bearer token automatically, without any
 * component needing to set the Authorization header explicitly.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Aquí le decimos a Angular que use nuestro interceptor
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};