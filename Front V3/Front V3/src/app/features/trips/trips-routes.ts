import { Routes } from '@angular/router';

/**
 * Lazy-loaded route table for the trips feature module.
 *
 * Maps four URL patterns to the same two components, making the URL segment the
 * sole discriminator of operating mode — TripsDetailComponent reads 'new',
 * ':id/edit', or ':id' on init to activate create, edit, or read-only mode.
 *
 * Route structure:
 *   ''         → TripsListComponent     (catalogue)
 *   'new'      → TripsDetailComponent   (create mode)
 *   ':id/edit' → TripsDetailComponent   (edit mode)
 *   ':id'      → TripsDetailComponent   (read-only mode)
 */
export const TRIPS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/trips-list/trips-list')
        .then(m => m.TripsListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/trips-detail/trips-detail')
        .then(m => m.TripsDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/trips-detail/trips-detail')
        .then(m => m.TripsDetailComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/trips-detail/trips-detail')
        .then(m => m.TripsDetailComponent)
  }
];
