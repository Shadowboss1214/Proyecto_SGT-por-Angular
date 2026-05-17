import { Routes } from '@angular/router';

/**
 * Lazy-loaded route table for the employee feature module.
 *
 * Maps four URL patterns to the same two components, making the URL segment the
 * sole discriminator of operating mode — EmployeeDetailComponent reads 'new',
 * ':id/edit', or ':id' on init to activate create, edit, or read-only mode.
 *
 * Route structure:
 *   ''         → EmployeeListComponent     (catalogue)
 *   'new'      → EmployeeDetailComponent   (create mode)
 *   ':id/edit' → EmployeeDetailComponent   (edit mode)
 *   ':id'      → EmployeeDetailComponent   (read-only mode)
 */
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
