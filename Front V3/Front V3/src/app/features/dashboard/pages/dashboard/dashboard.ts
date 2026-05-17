import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { TransportService } from '../../../transport/services/transport';
import { TripService } from '../../../trips/services/trips';
import { EmployeeService } from '../../../employes/services/employes';

/**
 * Dashboard component that displays key statistics based on the authenticated user's role.
 * Renders different stat cards for admin users and drivers.
 */

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
 /** Provides access to the current route snapshot and its data */
  private route = inject(ActivatedRoute);

  /** Service for authentication-related operations */
  private authService = inject(AuthService);

  /** Service for transport data retrieval */
  private transportService = inject(TransportService);

  /** Service for trip data retrieval */
  private tripService  = inject(TripService);

  /** Service for employee data retrieval */
  private employeeService  = inject(EmployeeService);
  private cdr              = inject(ChangeDetectorRef);

    /**
   * Role of the authenticated user, resolved from the route tree.
   * Traverses parent routes to find the first defined role.
   * Possible values: `'admin'` | `'driver'`
   */

  role = this.route.pathFromRoot
    .map(r => r.snapshot.data['role'])
    .find(role => !!role) as 'admin' | 'driver';

  loading = true;
    /**
   * List of statistic cards to display on the dashboard.
   * Each entry contains a title and a computed value.
   */
  stats: { title: string; value: string | number }[] = [];

    /**
   * Lifecycle hook that initializes the dashboard.
   * Loads the appropriate stats based on the user's role.
   */
  ngOnInit() {
    if (this.role === 'admin') {
      this.loadAdminStats();
    } else {
      this.loadDriverStats();
    }
  }

  /**
   * Loads statistics for admin users.
   * Fetches transports, trips, and employees in parallel using `combineLatest`,
   * then computes summary metrics such as active vehicles and trips made today.
   */
  private loadAdminStats() {
    const cachedTransports = this.transportService.snapshot;
    const cachedTrips      = this.tripService.snapshot;
    const cachedEmployees  = this.employeeService.snapshot;

    const allCached = cachedTransports.length > 0
      && cachedTrips.length > 0
      && cachedEmployees.length > 0;

    if (allCached) {
      this.buildAdminStats(cachedTransports, cachedTrips, cachedEmployees);
      this.loading = false;
      return;
    }

    forkJoin([
      cachedTransports.length > 0 ? of(cachedTransports) : this.transportService.getLatestTransports(),
      cachedTrips.length > 0      ? of(cachedTrips)      : this.tripService.getLatestTrips(),
      cachedEmployees.length > 0  ? of(cachedEmployees)  : this.employeeService.getLatestEmployees()
    ]).subscribe({
      next: ([transports, trips, employees]) => {
        this.buildAdminStats(transports, trips, employees);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildAdminStats(transports: any[], trips: any[], employees: any[]) {
    const today = new Date().toISOString().split('T')[0];
    this.stats = [
      { title: 'Total de vehículos', value: transports.length },
      { title: 'Vehículos activos',  value: transports.filter(t => t.status?.toLowerCase() === 'activo').length },
      { title: 'Viajes hoy',         value: trips.filter(t => t.date?.startsWith(today)).length },
      { title: 'Total de empleados', value: employees.length },
      { title: 'Total de viajes',    value: trips.length }
    ];
  }

  /**
   * Loads statistics for driver users.
   * Filters trips by the authenticated employee's ID and computes
   * personal metrics such as total trips and the most recent trip.
   */
  private loadDriverStats() {
    const employeeId  = Number(this.authService.getEmployeeId());
    const cachedTrips = this.tripService.snapshot;

    if (cachedTrips.length > 0) {
      this.buildDriverStats(cachedTrips, employeeId);
      this.loading = false;
      return;
    }

    this.tripService.getLatestTrips().subscribe({
      next: trips => {
        this.buildDriverStats(trips, employeeId);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildDriverStats(trips: any[], employeeId: number) {
    const myTrips  = trips.filter(t => t.id_employee === employeeId);
    const lastTrip = myTrips[myTrips.length - 1];
    this.stats = [
      { title: 'Mis viajes totales', value: myTrips.length },
      { title: 'Último viaje',       value: lastTrip ? `Ruta ${lastTrip.id_route}` : 'Sin viajes' },
      { title: 'Fecha último viaje', value: lastTrip?.date ?? '—' }
    ];
  }
}
