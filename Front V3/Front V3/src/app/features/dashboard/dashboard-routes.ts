import { Routes } from '@angular/router';

/**
 * Lazy-loaded route table for the dashboard feature module.
 *
 * Maps a single URL pattern to the DashboardComponent, which adapts
 * its content based on the authenticated user's role — rendering admin
 * statistics or driver-specific metrics depending on the role resolved
 * from the route tree.
 *
 * Route structure:
 *   '' → DashboardComponent  (role-aware statistics view)
 */

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/dashboard')
        .then(m => m.DashboardComponent)
  }
];