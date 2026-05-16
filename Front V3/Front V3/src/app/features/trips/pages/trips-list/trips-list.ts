import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest } from 'rxjs';
import { TripService } from '../../services/trips';
import { Trip, Route } from '../../models/trips';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TableComponent } from '../../../../shared/components/table/table';
import { Employee } from '../../../employes/models/employee';
import { Transport } from '../../../transport/models/transport';
import { TransportService } from '../../../transport/services/transport';
import { EmployeeService } from '../../../employes/services/employes';
import { AuthService } from '../../../login';
import { ReportService } from '../../../../core/services/report.service';
import { QrModalComponent } from '../../../../shared/components/qr-modal/qr-modal';
import { NavigationService } from '../../../../core/services/nav.service';
@Component({
  selector: 'app-Trips-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableComponent, QrModalComponent],
  templateUrl: './trips-list.html',
  styleUrl: './trips-list.css'
})
export class TripsListComponent implements OnInit {

  private service = inject(TripService);
  private transportService = inject(TransportService);
  private employeeService = inject(EmployeeService);
  private router = inject(NavigationService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private reportService = inject(ReportService);

  role = this.route.pathFromRoot
    .map(r => r.snapshot.data['role'])
    .find(role => !!role) as 'admin' | 'driver';

  employes: Employee[] = [];
  transport: Transport[] = [];
  tripRoute: Route[] = [
    { id_route: 1, origin: 'Ciudad de México', destine: 'Guadalajara', distance: 541 },
    { id_route: 2, origin: 'Guadalajara', destine: 'Monterrey', distance: 742 },
    { id_route: 3, origin: 'Ciudad de México', destine: 'Monterrey', distance: 921 },
    { id_route: 4, origin: 'Monterrey', destine: 'Tijuana', distance: 1891 },
    { id_route: 5, origin: 'Ciudad de México', destine: 'Puebla', distance: 132 },
  ];

  search = '';
  statusFilter = '';
  Trips: Trip[] = [];

  columns = [
    { label: 'Transporte', field: 'transportName' },
    { label: 'Empleado', field: 'employeeName' },
    { label: 'Ruta', field: 'routeName' },
    { label: 'Ingreso', field: 'income' },
    { label: 'Costo', field: 'fuelcost' },
    { label: 'Fecha', field: 'date' }
  ];

  tripsView: any[] = [];

  ngOnInit() {
    combineLatest([
      this.service.getAll(),
      this.transportService.getAll(),
      this.employeeService.getAll()
    ]).subscribe(([trips, transports, employees]) => {
      this.transport = transports;
      this.employes = employees;

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

  exportPdf(): void {
    this.reportService.exportToPdf(this.filtered, this.columns, 'Reporte de Viajes');
  }

  exportExcel(): void {
    this.reportService.exportToExcel(this.filtered, this.columns, 'reporte_viajes.xlsx');
  }

  showQrModal = false;
  selectedTrip: any = null;

  onQr(item: any) {
    this.selectedTrip = item;
    this.showQrModal = true;
  }

  onQrClose() {
    this.showQrModal = false;
    this.selectedTrip = null;
  }
}
