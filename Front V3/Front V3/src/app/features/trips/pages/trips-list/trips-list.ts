import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripService } from '../../services/trips';
import { Trip, Route } from '../../models/trips'; // Cambié TripRoute por Route según tu modelo
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TableComponent } from '../../../../shared/components/table/table';
import { Employee } from '../../../employes/models/employee';
import { Transport } from '../../../transport/models/transport';
import { AuthService } from '../../../login';


@Component({
  selector: 'app-Trips-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableComponent],
  templateUrl: './trips-list.html',
  styleUrl: './trips-list.css'
})
export class TripsListComponent implements OnInit {

  private service = inject(TripService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  role = this.route.pathFromRoot
    .map(r => r.snapshot.data['role'])
    .find(role => !!role) as 'admin' | 'driver';

  employes: Employee[] = [];
  transport: Transport[] = [];
  tripRoute: Route[] = []; // Ajustado al nombre del objeto de tu DB

  search = '';
  statusFilter = '';
  Trips: Trip[] = [];

  columns = [
    { label: 'Transporte', field: 'transportName' },
    { label: 'Empleado', field: 'employeeName' },
    { label: 'Ruta', field: 'routeName' },
    { label: 'Ingreso', field: 'income' },
    { label: 'Costo', field: 'fuelcost' }, // Ajustado a minúscula como en el modelo
    { label: 'Fecha', field: 'date' }
  ];

  tripsView: any[] = [];

  ngOnInit() {
    this.service.getAll().subscribe(trips => {
      if (this.role === 'driver') {
        const employeeId = Number(this.authService.getEmployeeId());
        this.Trips = trips.filter(trip => trip.id_employee === employeeId);
      } else {
        this.Trips = trips;
      }
      
      this.tripsView = this.Trips.map(t => ({
        ...t,
        transportName: this.getTransportName(t.id_transport),
        employeeName: this.getEmployeeName(t.id_employee),
        routeName: this.getRouteName(t.id_route)
      }));
    });
  }

  onView(item: Trip) {
    this.router.navigate(['/trips', item.id_trip]);
  }

  onEdit(item: Trip) {
    this.router.navigate(['/trips', item.id_trip, 'edit']);
  }

  onDelete(item: Trip) {
    this.service.delete(item.id_trip);
  }

  // Cambiados los parámetros a number para coincidir con la DB
  getTransportName(id: number) {
    return this.transport.find(t => t.id_transport === id)?.name ?? 'N/A';
  }

  getEmployeeName(id: number) {
    return this.employes.find(e => e.id_employee === id)?.name ?? 'N/A';
  }

  getRouteName(id: number) {
    const route = this.tripRoute.find(r => r.id_route === id);
    if (!route) return 'N/A';
    return `${route.origin} - ${route.destine}`;
  }

  get filtered() {
    const search = this.search.toLowerCase();
    return this.tripsView.filter(t =>
      t.transportName.toLowerCase().includes(search) ||
      t.employeeName.toLowerCase().includes(search)
    );
  }

  onSearchChange(value: string) {
    this.search = value;
  }

  onStatusChange(value: string) {
    this.statusFilter = value;
  }
}