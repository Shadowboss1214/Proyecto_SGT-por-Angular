import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // <-- IMPORTANTE
import { authInterceptor } from './core/interceptors/auth.interceptor'; // <-- IMPORTANTE

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Aquí le decimos a Angular que use nuestro interceptor
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};