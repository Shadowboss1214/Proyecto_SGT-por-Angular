import { Routes } from '@angular/router';

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
