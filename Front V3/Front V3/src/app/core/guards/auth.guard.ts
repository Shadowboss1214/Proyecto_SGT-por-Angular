import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { NavigationService } from '../../core/services/nav.service';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const nav  = inject(NavigationService);

  const token = auth.getToken();
  if (!token) {
    // Guardar la URL destino para redirigir después del login (p.ej. link de QR)
    sessionStorage.setItem('redirect_after_login', state.url);
    nav.navigate(['/app/login']);
    return false;
  }

  if (auth.isTokenExpired()) {
    const refreshToken = auth.getRefreshToken();
    if (!refreshToken) {
      auth.logout();
      sessionStorage.setItem('redirect_after_login', state.url);
      nav.navigate(['/app/login']);
      return false;
    }

    return auth.refreshToken().pipe(
      map(() => checkRole(route, auth, nav)),
      catchError(() => {
        auth.logout();
        sessionStorage.setItem('redirect_after_login', state.url);
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
