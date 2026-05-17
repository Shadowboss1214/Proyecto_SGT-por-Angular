import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { NavigationService } from '../../core/services/nav.service';
import { AuthService } from '../services/auth.service';

/**
 * Functional route guard (CanActivateFn) protecting /app/admin and /app/driver.
 *
 * Allows navigation only when a valid, non-expired JWT exists in localStorage.
 * Expiration is checked client-side by comparing `payload.exp` with the current
 * time; the backend independently validates the token on every API call, so this
 * guard is a UX safeguard that prevents entering a broken UI state, not the
 * security boundary.
 *
 * On failure: calls AuthService.logout() to clear stale tokens, then redirects to
 * /app/login.
 * @returns true if the token exists and has not expired; false otherwise.
 */
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const nav = inject(NavigationService);

  const token = auth.getToken();
  if (!token) {
    nav.navigate(['/app/login']);
    return false;
  }

  if (auth.isTokenExpired()) {
    const refreshToken = auth.getRefreshToken();
    if (!refreshToken) {
      auth.logout();
      nav.navigate(['/app/login']);
      return false;
    }

    return auth.refreshToken().pipe(
      map(() => checkRole(route, auth, nav)),
      catchError(() => {
        auth.logout();
        nav.navigate(['/app/login']);
        return of(false);
      })
    );
  }

  return checkRole(route, auth, nav);
};

function checkRole(route: ActivatedRouteSnapshot, auth: AuthService, nav: NavigationService): boolean {
  const requiredRole: string | undefined = route.data['role'];
  if (requiredRole) {
    const userRole = auth.getRole();
    if (userRole !== requiredRole) {
      if (userRole === 'admin') {
        nav.navigate(['/app/admin/dashboard']);
        return false;
      } else if (userRole === 'choufer') {
        nav.navigate(['/app/driver/dashboard']);
        return false;
      }
    }
  }
  return true;
}
