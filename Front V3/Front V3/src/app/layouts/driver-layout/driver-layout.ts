import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NavigationService } from '../../core/services/nav.service';
import { TopMenu } from '../../shared/components/top-menu/top-menu';

/**
 * Shell layout component for the driver role (/app/driver/**).
 *
 * Hosts the router-outlet for driver child routes and exposes only Dashboard and
 * Trips, intentionally omitting the administrative sections (Employees, Transport,
 * Logistics) to enforce the role boundary at the UI level — even if a driver were
 * to guess an admin URL, authGuard and the separate route tree would block access.
 * skipLocationChange keeps the address bar URL stable during in-layout navigation.
 */
@Component({
  selector: 'app-driver-layout',
  imports: [RouterModule, TopMenu],
  templateUrl: './driver-layout.html',
  styleUrl: './driver-layout.css',
})
export class DriverLayout {
  private router   = inject(NavigationService);
  private ngRouter = inject(Router);

  isActive(segment: string): boolean {
    return this.ngRouter.url.includes(`/driver/${segment}`);
  }

  /** Navigates to the driver dashboard. */
  goToDashboard() {
    this.router.navigate(
      ['/app/driver/dashboard'],
      { skipLocationChange: true }
    );
  }

  /**
   * Navigates to the driver's trip list.
   * TripsListComponent will further filter the results to only the trips
   * assigned to the authenticated employee.
   */
  goToTrips() {
    this.router.navigate(
      ['/app/driver/trips'],
      { skipLocationChange: true }
    );
  }
}
