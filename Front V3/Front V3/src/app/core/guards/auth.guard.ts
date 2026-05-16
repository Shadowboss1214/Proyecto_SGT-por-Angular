import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { NavigationService } from '../../core/services/nav.service';
import { AuthService } from '../services/auth.service';

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
      nav.navigate([`/app/${userRole}/dashboard`]);
      return false;
    }
  }
  return true;
}
