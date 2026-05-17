import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Functional HTTP interceptor registered globally in app.config.ts.
 *
 * Clones every outgoing HttpRequest and injects the `Authorization: Bearer` header
 * when a token exists in localStorage. Requests without a token (e.g., the login
 * call itself) pass through unmodified so the OAuth2 endpoint never receives a
 * stale or empty Bearer header.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
