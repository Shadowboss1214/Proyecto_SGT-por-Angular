import { Routes } from '@angular/router';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/employes-list/employes-list')
        .then(m => m.EmployeeListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/employee-detail/employee-detail')
        .then(m => m.EmployeeDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/employee-detail/employee-detail')
        .then(m => m.EmployeeDetailComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/employee-detail/employee-detail')
        .then(m => m.EmployeeDetailComponent)
  }
];