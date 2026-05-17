import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NavigationService } from '../services/nav.service';

/**
 * Functional HTTP interceptor registered globally in app.config.ts.
 *
 * Clones every outgoing HttpRequest and injects the `Authorization: Bearer` header
 * when a token exists in localStorage. Requests without a token (e.g., the login
 * call itself) pass through unmodified so the OAuth2 endpoint never receives a
 * stale or empty Bearer header.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const nav = inject(NavigationService);
  const token = auth.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Evitar loop infinito: no reintentar si el request que falló es el de refresh
      const isOAuthRequest = req.url.includes('/oauth');

      if (error.status === 401 && !isOAuthRequest && auth.getRefreshToken()) {
        return auth.refreshToken().pipe(
          switchMap(response => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${response.access_token}` }
            });
            return next(retryReq);
          }),
          catchError(() => {
            auth.logout();
            nav.navigate(['/app/login']);
            return throwError(() => error);
          })
        );
      }

      if (error.status === 401) {
        auth.logout();
        nav.navigate(['/app/login']);
      }

      return throwError(() => error);
    })
  );
};
