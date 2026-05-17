import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
import { AuthService } from '../../../../core/services/auth.service';
import { ReportService } from '../../../../core/services/report.service';
import { QrModalComponent } from '../../../../shared/components/qr-modal/qr-modal';
import { NavigationService } from '../../../../core/services/nav.service';

/**
 * View component for the trip list screen (/app/admin/trips and /app/driver/trips).
 *
 * Combines three reactive streams (trips, transports, employees) via combineLatest
 * to build a denormalized view model for the generic table. For the driver role,
 * filters trips to only those assigned to the authenticated employee. Also
 * orchestrates the QR modal lifecycle via showQrModal and selectedTrip state.
 */
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
  private cdr = inject(ChangeDetectorRef);

  /** Current user role, read from route data to determine visibility and filtering rules. */
  role = this.route.pathFromRoot
    .map(r => r.snapshot.data['role'])
    .find(role => !!role) as 'admin' | 'driver';

  /** Local cache of employees, populated from EmployeeService stream on init. */
  employes: Employee[] = [];

  /** Local cache of transports, populated from TransportService stream on init. */
  transport: Transport[] = [];

  /** Static route catalog; used to resolve route labels from FK values in trip records. */
  tripRoute: Route[] = [
    { id_route: 1, origin: 'Ciudad de México', destine: 'Guadalajara', distance: 541 },
    { id_route: 2, origin: 'Guadalajara', destine: 'Monterrey', distance: 742 },
    { id_route: 3, origin: 'Ciudad de México', destine: 'Monterrey', distance: 921 },
    { id_route: 4, origin: 'Monterrey', destine: 'Tijuana', distance: 1891 },
    { id_route: 5, origin: 'Ciudad de México', destine: 'Puebla', distance: 132 },
  ];

  search = '';
  statusFilter = '';

  /** Raw trip array; scoped to the authenticated driver when role === 'driver'. */
  Trips: Trip[] = [];
  currentPage = 1;
  totalPages = 1;

  columns = [
    { label: 'Transporte', field: 'transportName' },
    { label: 'Empleado', field: 'employeeName' },
    { label: 'Ruta', field: 'routeName' },
    { label: 'Ingreso', field: 'income' },
    { label: 'Costo', field: 'fuelcost' },
    { label: 'Fecha', field: 'date' }
  ];

  /** Denormalized view model: trips with resolved names injected for display in the table. */
  tripsView: any[] = [];

  /**
   * Subscribes to all three service streams simultaneously so the table rebuilds
   * whenever any of trips, transports, or employees changes.
   * Driver role filtering uses the employee ID embedded in the JWT payload.
   */
  ngOnInit() {
    this.service.getLatestTrips().subscribe();
    this.transportService.getLatestTransports().subscribe();
    this.employeeService.getLatestEmployees().subscribe();


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
        this.loadPage(1);
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

  /** Navigates to the trip detail view. @param item - The trip row clicked. */
  onView(item: Trip) {
    this.router.navigate(['/trips', item.id_trip]);
  }

  /** Navigates to the trip edit form. @param item - The trip row clicked. */
  onEdit(item: Trip) {
    this.router.navigate(['/trips', item.id_trip, 'edit']);
  }

  /** Delegates deletion to TripService. @param item - The trip row to delete. */
  onDelete(item: Trip) {
    this.service.delete(item.id_trip).subscribe();
  }

  /**
   * Resolves a transport name from the local cache by FK.
   * Returns 'N/A' when not found — defensive because the list may load before
   * the transport service emits its first value.
   * @param id - The `id_transport` FK value.
   */
  getTransportName(id: number) {
    return this.transport.find(t => t.id_transport === id)?.name ?? 'N/A';
  }

  /**
   * Resolves an employee name from the local cache by FK.
   * @param id - The `id_employee` FK value.
   */
  getEmployeeName(id: number) {
    return this.employes.find(e => e.id_employee === id)?.name ?? 'N/A';
  }

  /**
   * Resolves a route label ("origin - destine") from the static route list by FK.
   * @param id - The `id_route` FK value.
   */
  getRouteName(id: number) {
    const route = this.tripRoute.find(r => r.id_route === id);
    if (!route) return 'N/A';
    return `${route.origin} - ${route.destine}`;
  }

  /**
   * Client-side filter over the denormalized tripsView; matches transport or employee name.
   * No server round-trip; reflects the latest search value immediately.
   */
  get filtered() {
    const search = this.search.toLowerCase();
    return this.tripsView.filter(t =>
      t.transportName.toLowerCase().includes(search) ||
      t.employeeName.toLowerCase().includes(search)
    );
  }

  /** Syncs the search term from the template's input binding. */
  onSearchChange(value: string) {
    this.search = value;
  }

  /** Syncs the status filter; kept for interface parity with other list views. */
  onStatusChange(value: string) {
    this.statusFilter = value;
  }

  /** Exports the current filtered list as a PDF report via ReportService. */
  exportPdf(): void {
    this.reportService.exportToPdf(this.filtered, this.columns, 'Reporte de Viajes');
  }

  /** Exports the current filtered list as an Excel workbook via ReportService. */
  exportExcel(): void {
    this.reportService.exportToExcel(this.filtered, this.columns, 'reporte_viajes.xlsx');
  }

  /** Controls QR modal visibility; true while the modal is open. */
  showQrModal = false;

  /** The trip row currently selected for QR display; passed to QrModalComponent via @Input. */
  selectedTrip: any = null;

  /**
   * Opens the QR modal for the selected trip row.
   * @param item - The trip row whose QR code the user wants to see.
   */
  onQr(item: any) {
    this.selectedTrip = item;
    this.showQrModal = true;
  }

  /** Resets QR modal state after the user dismisses it. */
  onQrClose() {
    this.showQrModal = false;
    this.selectedTrip = null;
  }

  changePage(page: number) {
    this.currentPage = page;

    this.loadPage(page);
  }

  loadPage(page: number) {
    this.service.getLatestTrips(page).subscribe(() => {
      this.currentPage = this.service.page;
      this.totalPages = this.service.total;
      this.cdr.detectChanges();
    });
  }
}
