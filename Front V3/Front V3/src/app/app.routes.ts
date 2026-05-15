import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/pages/login';
import { TransportListComponent } from './features/transport';
import { TripsListComponent } from './features/trips/pages/trips-list/trips-list';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { DriverLayout } from './layouts/driver-layout/driver-layout';
import { StartPageComponent } from './shared/components/spa-routing/start-routing';
import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [

  {
    path: 'Bus.inc.com',
    loadComponent: () => import('./shared/components/spa-routing/start-routing').then(c => c.StartPageComponent)
  },
  {
    path: 'app',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/login/pages/login').then(c => c.LoginComponent)
      },
      {
        path: 'admin', component: AdminLayout,
        canActivate: [authGuard],
        data: { role: 'admin' },
        children: [
          {
            path: 'dashboard',
            loadChildren: () =>
              import('./features/dashboard/dashboard-routes')
                .then(m => m.DASHBOARD_ROUTES)
          },
          {
            path: 'transport',
            loadChildren: () =>
              import('./features/transport/transport-routes')
                .then(m => m.TRANSPORT_ROUTES)
          },
          {
            path: 'employee',
            loadChildren: () =>
              import('./features/employes/employee-routes')
                .then(m => m.EMPLOYEE_ROUTES)
          },
          {
            path: 'trips',
            loadChildren: () =>
              import('./features/trips/trips-routes')
                .then(m => m.TRIPS_ROUTES)
          },
          {
            path: 'logistics',
            loadChildren: () =>
              import('./features/logistics/logistic-routes')
                .then(m => m.LOGISTICS_ROUTES)
          }
        ]
      },
      {
        path: 'driver', component: DriverLayout,
        canActivate: [authGuard],
        data: { role: 'driver' },
        children: [
          {
            path: 'dashboard',
            loadChildren: () =>
              import('./features/dashboard/dashboard-routes')
                .then(m => m.DASHBOARD_ROUTES)
          },
          {
            path: 'trips',
            loadChildren: () =>
              import('./features/trips/trips-routes')
                .then(m => m.TRIPS_ROUTES)
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];