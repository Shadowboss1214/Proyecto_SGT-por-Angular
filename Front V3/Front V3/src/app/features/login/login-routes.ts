import { Routes } from '@angular/router';
import { AdminLayout } from '../../layouts/admin-layout/admin-layout';
import { DriverLayout } from '../../layouts/driver-layout/driver-layout';
import { LoginComponent } from './pages/login';

export const LOGIN_ROUTES: Routes = [
    {
        path: '', component: LoginComponent
    },
    {
        path: 'admin', component: AdminLayout,
        data: {role: 'admin'},
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadChildren: () =>
                    import('../dashboard/dashboard-routes')
                        .then(m => m.DASHBOARD_ROUTES)
            },
            {
                path: 'transport',
                loadChildren: () =>
                    import('../transport/transport-routes')
                        .then(m => m.TRANSPORT_ROUTES)
            },
            {
                path: 'employee',
                loadChildren: () =>
                    import('../employes/employee-routes')
                        .then(m => m.EMPLOYEE_ROUTES)
            },
            {
                path: 'trips',
                loadChildren: () =>
                    import('../trips/trips-routes')
                        .then(m => m.TRIPS_ROUTES)
            },
            {
                path: 'logistics',
                loadChildren: () =>
                    import('../logistics/logistic-routes')
                        .then(m => m.LOGISTICS_ROUTES)
            }
        ]
    },

    {
        path: 'driver', component: DriverLayout,
        data: {role: 'driver'},
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadChildren: () =>
                    import('../dashboard/dashboard-routes')
                        .then(m => m.DASHBOARD_ROUTES)
            },
            {
                path: 'trips',
                loadChildren: () =>
                    import('../trips/trips-routes')
                        .then(m => m.TRIPS_ROUTES)
            }
        ]
    }

];
