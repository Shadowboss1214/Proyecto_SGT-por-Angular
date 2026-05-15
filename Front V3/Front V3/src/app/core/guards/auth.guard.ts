import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();
  if (!token) {
    router.navigate(['/app/login']);
    return false;
  }

  const payload = auth.getTokenPayload();
  if (payload?.exp && Date.now() / 1000 > payload.exp) {
    auth.logout();
    router.navigate(['/app/login']);
    return false;
  }

  return true;
};
