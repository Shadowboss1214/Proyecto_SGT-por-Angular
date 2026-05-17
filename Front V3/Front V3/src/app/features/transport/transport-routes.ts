import { Routes } from '@angular/router';

/**
 * Lazy-loaded route table for the transport feature module.
 *
 * Maps four URL patterns to the same two components, making the URL segment the
 * sole discriminator of operating mode — TransportDetailComponent reads 'new',
 * ':id/edit', or ':id' on init to activate create, edit, or read-only mode.
 *
 * Route structure:
 *   ''         → TransportListComponent     (catalogue)
 *   'new'      → TransportDetailComponent   (create mode)
 *   ':id/edit' → TransportDetailComponent   (edit mode)
 *   ':id'      → TransportDetailComponent   (read-only mode)
 */
export const TRANSPORT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/transport-list/transport-list')
        .then(m => m.TransportListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/transport-detail/transport-detail')
        .then(m => m.TransportDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/transport-detail/transport-detail')
        .then(m => m.TransportDetailComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/transport-detail/transport-detail')
        .then(m => m.TransportDetailComponent)
  }
];
