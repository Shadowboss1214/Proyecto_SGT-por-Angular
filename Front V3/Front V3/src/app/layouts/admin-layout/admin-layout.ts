import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TopMenu } from '../../shared/components/top-menu/top-menu';

/**
 * Shell layout component for the admin role (/app/admin/**).
 *
 * Hosts the router-outlet for all admin child routes and provides the full
 * navigation surface: Dashboard, Trips, Employees, Logistics, and Transport.
 * skipLocationChange keeps the address bar URL stable during in-layout navigation
 * so deep-linking into child routes does not require a full page cycle.
 */
@Component({
  selector: 'app-main-layout',
  imports: [RouterModule, TopMenu],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  private router = inject(Router);

  /** Navigates to the admin dashboard. */
  goToDashboard() {
    this.router.navigate(
      ['/app/admin/dashboard'],
      { skipLocationChange: true }
    );
  }

  /** Navigates to the trip management catalogue. */
  goToTrips() {
    this.router.navigate(
      ['/app/admin/trips'],
      { skipLocationChange: true }
    );
  }

  /** Navigates to the employee management catalogue. */
  goToEmployees() {
    this.router.navigate(
      ['/app/admin/employee'],
      { skipLocationChange: true }
    );
  }

  /** Navigates to the logistics section. */
  goToLogistic() {
    this.router.navigate(
      ['/app/admin/logistics'],
      { skipLocationChange: true }
    );
  }

  /** Navigates to the transport management catalogue. */
  goToTransport() {
    this.router.navigate(
      ['/app/admin/transport'],
      { skipLocationChange: true }
    );
  }

}
