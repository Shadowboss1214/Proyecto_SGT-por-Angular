import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { TransportService } from '../../../transport/services/transport';
import { TripService } from '../../../trips/services/trips';
import { EmployeeService } from '../../../employes/services/employes';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  private route           = inject(ActivatedRoute);
  private authService     = inject(AuthService);
  private transportService = inject(TransportService);
  private tripService     = inject(TripService);
  private employeeService = inject(EmployeeService);

  role = this.route.pathFromRoot
    .map(r => r.snapshot.data['role'])
    .find(role => !!role) as 'admin' | 'driver';

  stats: { title: string; value: string | number }[] = [];

  ngOnInit() {
    if (this.role === 'admin') {
      this.loadAdminStats();
    } else {
      this.loadDriverStats();
    }
  }

  private loadAdminStats() {
    combineLatest([
      this.transportService.getLatestTransports(),
      this.tripService.getLatestTrips(),
      this.employeeService.getLatestEmployees()
    ]).subscribe(([transports, trips, employees]) => {
      const today = new Date().toISOString().split('T')[0];
      const tripsToday = trips.filter(t => t.date?.startsWith(today)).length;
      const activeTransports = transports.filter(t => t.status === 'activo' || t.status === 'ACTIVO').length;

      this.stats = [
        { title: 'Total de vehículos',  value: transports.length },
        { title: 'Vehículos activos',   value: activeTransports },
        { title: 'Viajes hoy',          value: tripsToday },
        { title: 'Total de empleados',  value: employees.length },
        { title: 'Total de viajes',     value: trips.length }
      ];
    });
  }

  private loadDriverStats() {
    const employeeId = Number(this.authService.getEmployeeId());

    this.tripService.getLatestTrips().subscribe(trips => {
      const myTrips = trips.filter(t => t.id_employee === employeeId);
      const lastTrip = myTrips[myTrips.length - 1];

      this.stats = [
        { title: 'Mis viajes totales', value: myTrips.length },
        { title: 'Último viaje',       value: lastTrip ? `Ruta ${lastTrip.id_route}` : 'Sin viajes' },
        { title: 'Fecha último viaje', value: lastTrip?.date ?? '—' }
      ];
    });
  }
}
