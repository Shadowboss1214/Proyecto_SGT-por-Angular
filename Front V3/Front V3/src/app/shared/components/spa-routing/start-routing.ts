import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Templateless entry-point component that acts as the SPA's initial router.
 *
 * Rendered at path '' — the first URL the browser ever loads. On init it reads
 * localStorage to decide where to send the user: unauthenticated visitors go to
 * the login screen; authenticated users land in the layout that matches their role.
 *
 * replaceUrl: true is used on every redirect so this component does not pollute
 * the browser history, preventing the back button from cycling through '' indefinitely.
 */
@Component({
  selector: 'app-start-page',
  standalone: true,
  template: ''
})
export class StartPageComponent implements OnInit {

  private router = inject(Router);

  /**
   * Redirects immediately on init based on the token and role stored in localStorage.
   *
   * Decision tree:
   *   - No token           → /app/login
   *   - role === 'ADMIN'   → /app/admin/dashboard
   *   - role === 'DRIVER'  → /app/driver/dashboard
   *   - Any other value    → /app/login  (fallback for corrupt or missing role state)
   */
  ngOnInit(): void {
    const token = localStorage.getItem('access_token');

    if (!token) {
      this.router.navigate(['/app/login'], { replaceUrl: true });
      return;
    }

    const role = localStorage.getItem('role');

    if (role === 'ADMIN') {
      this.router.navigate(['/app/admin/dashboard'], { replaceUrl: true });
    } else if (role === 'DRIVER') {
      this.router.navigate(['/app/driver/dashboard'], { replaceUrl: true });
    } else {
      this.router.navigate(['/app/login'], { replaceUrl: true });
    }
  }

}
