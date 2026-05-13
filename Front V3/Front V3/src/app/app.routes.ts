import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/pages/login';
import { TransportListComponent } from './features/transport';
import { TripsListComponent } from './features/trips/pages/trips-list/trips-list';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/login/login-routes').then(m => m.LOGIN_ROUTES)
  }
];