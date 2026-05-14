import { Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/login/login-routes').then(c => c.LOGIN_ROUTES)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];