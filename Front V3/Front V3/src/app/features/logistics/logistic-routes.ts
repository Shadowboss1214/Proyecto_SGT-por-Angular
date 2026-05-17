import { Routes } from '@angular/router';
import { LogisticsDashboardComponent } from './pages/logistics-dashboard/logistics-dashboard';

/**
 * Route table for the logistics feature module.
 *
 * Maps a single URL pattern to the LogisticsDashboardComponent, which displays
 * financial and operational metrics including income, costs, profit, efficiency,
 * and trip volume charts.
 *
 * Route structure:
 *   '' → LogisticsDashboardComponent  (logistics metrics dashboard)
 */
export const LOGISTICS_ROUTES: Routes = [
  {
    path: '',
    component: LogisticsDashboardComponent
  }
];

