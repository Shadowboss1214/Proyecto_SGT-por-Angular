import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
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
