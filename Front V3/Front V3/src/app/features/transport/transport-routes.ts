import { Routes } from '@angular/router';

export const TRANSPORT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/transport-list/transport-list')
        .then(m => m.TransportListComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/transport-detail/transport-detail')
        .then(m => m.TransportDetailComponent)
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
  }
];