import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { NavigationService } from '../../core/services/nav.service';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(NavigationService);

  const token = auth.getToken();
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const payload = auth.getTokenPayload();
  if (payload?.exp && Date.now() / 1000 > payload.exp) {
    auth.logout();
    router.navigate(['/login']);
    return false;
  }

  return true;
};
