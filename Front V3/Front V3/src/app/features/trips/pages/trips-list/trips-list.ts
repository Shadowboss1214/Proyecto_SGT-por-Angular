import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
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

@Component({
  selector: 'app-Trips-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableComponent, QrModalComponent],
  templateUrl: './trips-list.html',
  styleUrl: './trips-list.css'
})
/**
 * List component for the trips catalogue.
 *
 * Renders trips differently based on role: admins see all trips; drivers see only
 * their own. Joins transport and employee records to display human-readable names
 * instead of raw foreign keys. Supports in-memory search, pagination, QR modals,
 * and PDF/Excel export.
 */
export class TripsListComponent implements OnInit {

  private service          = inject(TripService);
  private transportService = inject(TransportService);
  private employeeService  = inject(EmployeeService);
  private router           = inject(NavigationService);
  private route            = inject(ActivatedRoute);
  private authService      = inject(AuthService);
  private reportService    = inject(ReportService);
  private cdr              = inject(ChangeDetectorRef);

  role = this.route.pathFromRoot
    .map(r => r.snapshot.data['role'])
    .find(role => !!role) as 'admin' | 'driver';

  loading = true;
  employes: Employee[]   = [];
  transport: Transport[] = [];

  tripRoute: Route[] = [
    { id_route: 1, origin: 'Ciudad de México', destine: 'Guadalajara', distance: 541 },
    { id_route: 2, origin: 'Guadalajara',      destine: 'Monterrey',   distance: 742 },
    { id_route: 3, origin: 'Ciudad de México', destine: 'Monterrey',   distance: 921 },
    { id_route: 4, origin: 'Monterrey',        destine: 'Tijuana',     distance: 1891 },
    { id_route: 5, origin: 'Ciudad de México', destine: 'Puebla',      distance: 132 },
  ];

  search = '';
  Trips: Trip[]    = [];
  tripsView: any[] = [];
  currentPage = 1;
  totalPages  = 1;

  columns = [
    { label: 'Transporte', field: 'transportName' },
    { label: 'Empleado',   field: 'employeeName' },
    { label: 'Ruta',       field: 'routeName' },
    { label: 'Ingreso',    field: 'income' },
    { label: 'Costo',      field: 'fuelcost' },
    { label: 'Fecha',      field: 'date' }
  ];

  /**
   * Bootstraps the list from caches when all three services are warm; otherwise
   * uses `forkJoin` to fetch trips, transports, and employees in a single round-trip.
   * Role-based filtering is applied inside `renderData()`.
   */
  ngOnInit() {
    const allCached = this.service.snapshot.length > 0
      && this.transportService.snapshot.length > 0
      && this.employeeService.snapshot.length > 0;

    if (allCached) {
      this.renderData(
        this.service.snapshot,
        this.transportService.snapshot,
        this.employeeService.snapshot
      );
      this.currentPage = this.service.page;
      this.totalPages  = this.service.total;
      this.loading = false;
    } else {
      forkJoin([
        this.service.getLatestTrips(1),
        this.transportService.getLatestTransports(),
        this.employeeService.getLatestEmployees()
      ]).subscribe({
        next: ([trips, transports, employees]) => {
          this.renderData(trips, transports, employees);
          this.currentPage = this.service.page;
          this.totalPages  = this.service.total;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  /**
   * Stores transport and employee arrays for lookup, then applies role-based filtering:
   * drivers see only trips where `id_employee` matches their own ID; admins see all.
   * @param trips - Raw trip records from the API or service cache.
   * @param transports - All transport records used for name resolution.
   * @param employees - All employee records used for name resolution.
   */
  private renderData(trips: Trip[], transports: Transport[], employees: Employee[]) {
    this.transport = transports;
    this.employes  = employees;

    const filtered = this.role === 'driver'
      ? trips.filter(t => t.id_employee === Number(this.authService.getEmployeeId()))
      : trips;

    this.Trips     = filtered;
    this.tripsView = this.buildView(filtered);
  }

  /**
   * Denormalizes trip records by appending computed display fields so the generic
   * `<app-table>` component can render them without knowing about the FK lookup tables.
   * @param trips - Filtered trip records to transform.
   * @returns Trip objects enriched with `transportName`, `employeeName`, and `routeName`.
   */
  private buildView(trips: Trip[]): any[] {
    return trips.map(t => ({
      ...t,
      transportName: this.getTransportName(t.id_transport),
      employeeName:  this.getEmployeeName(t.id_employee),
      routeName:     this.getRouteName(t.id_route)
    }));
  }

  /** Navigates to the read-only detail view for the selected trip. */
  onView(item: any)   { this.router.navigate(['/trips', item.id_trip]); }
  /** Navigates to the edit form for the selected trip. */
  onEdit(item: any)   { this.router.navigate(['/trips', item.id_trip, 'edit']); }
  /** Deletes the selected trip and reloads the current page. */
  onDelete(item: any) {
    this.service.delete(item.id_trip).subscribe({
      next: () => this.loadPage(this.currentPage)
    });
  }

  /** @param id - `id_transport` FK. @returns Transport name or `'N/A'`. */
  getTransportName(id: number) { return this.transport.find(t => t.id_transport === id)?.name ?? 'N/A'; }
  /** @param id - `id_employee` FK. @returns Employee name or `'N/A'`. */
  getEmployeeName(id: number)  { return this.employes.find(e => e.id_employee === id)?.name ?? 'N/A'; }
  /** @param id - `id_route` FK. @returns `"Origin - Destination"` or `'N/A'`. */
  getRouteName(id: number) {
    const r = this.tripRoute.find(r => r.id_route === id);
    return r ? `${r.origin} - ${r.destine}` : 'N/A';
  }

  /**
   * Client-side filter over `tripsView` matching the search term against
   * both `transportName` and `employeeName` simultaneously.
   */
  get filtered() {
    const s = this.search.toLowerCase();
    return this.tripsView.filter(t =>
      t.transportName.toLowerCase().includes(s) ||
      t.employeeName.toLowerCase().includes(s)
    );
  }

  onSearchChange(v: string) { this.search = v; }

  exportPdf()   { this.reportService.exportToPdf(this.filtered, this.columns, 'Reporte de Viajes'); }
  exportExcel() { this.reportService.exportToExcel(this.filtered, this.columns, 'reporte_viajes.xlsx'); }

  showQrModal  = false;
  selectedTrip: any = null;

  onQr(item: any) { this.selectedTrip = item; this.showQrModal = true; }
  onQrClose()     { this.showQrModal = false; this.selectedTrip = null; }

  /** Advances to the requested page and triggers a full network fetch. */
  changePage(page: number) {
    this.currentPage = page;
    this.loadPage(page);
  }

  /**
   * Fetches the given page of trips together with the latest transport and employee
   * data in a single `forkJoin`, then re-renders the list with `renderData()`.
   * @param page - 1-based page number to load.
   */
  loadPage(page: number) {
    this.loading = true;
    forkJoin([
      this.service.getLatestTrips(page),
      this.transportService.getLatestTransports(),
      this.employeeService.getLatestEmployees()
    ]).subscribe({
      next: ([trips, transports, employees]) => {
        this.renderData(trips, transports, employees);
        this.currentPage = this.service.page;
        this.totalPages  = this.service.total;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
