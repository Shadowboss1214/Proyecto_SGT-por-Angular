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

@Component({
  selector: 'app-Trips-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableComponent, QrModalComponent],
  templateUrl: './trips-list.html',
  styleUrl: './trips-list.css'
})
export class TripsListComponent implements OnInit {

  private service          = inject(TripService);
  private transportService = inject(TransportService);
  private employeeService  = inject(EmployeeService);
  private router           = inject(NavigationService);
  private route            = inject(ActivatedRoute);
  private authService      = inject(AuthService);
  private reportService    = inject(ReportService);
  private cdr              = inject(ChangeDetectorRef);

  /** Current user role, read from route data to determine visibility and filtering rules. */
  role = this.route.pathFromRoot
    .map(r => r.snapshot.data['role'])
    .find(role => !!role) as 'admin' | 'driver';

  loading = true;
  employes: Employee[]  = [];
  transport: Transport[] = [];

  /** Static route catalog; used to resolve route labels from FK values in trip records. */
  tripRoute: Route[] = [
    { id_route: 1, origin: 'Ciudad de México', destine: 'Guadalajara', distance: 541 },
    { id_route: 2, origin: 'Guadalajara',      destine: 'Monterrey',   distance: 742 },
    { id_route: 3, origin: 'Ciudad de México', destine: 'Monterrey',   distance: 921 },
    { id_route: 4, origin: 'Monterrey',        destine: 'Tijuana',     distance: 1891 },
    { id_route: 5, origin: 'Ciudad de México', destine: 'Puebla',      distance: 132 },
  ];

  search = '';
  Trips: Trip[] = [];
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

  private initialized = false;

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
      this.employes  = employees;

      if (this.role === 'driver') {
        const employeeId = Number(this.authService.getEmployeeId());
        this.Trips = trips.filter(t => t.id_employee === employeeId);
        this.tripsView = this.buildView(this.Trips);
        this.loading = false;
        this.cdr.detectChanges();
      } else {
        this.Trips = trips;
        this.tripsView = this.buildView(this.Trips);
        if (!this.initialized) {
          this.initialized = true;
          this.loadPage(1);
        }
      }
    });
  }

  private buildView(trips: Trip[]): any[] {
    return trips.map(t => ({
      ...t,
      transportName: this.getTransportName(t.id_transport),
      employeeName:  this.getEmployeeName(t.id_employee),
      routeName:     this.getRouteName(t.id_route)
    }));
  }

  onView(item: any)   { this.router.navigate(['/trips', item.id_trip]); }
  onEdit(item: any)   { this.router.navigate(['/trips', item.id_trip, 'edit']); }
  onDelete(item: any) { this.service.delete(item.id_trip).subscribe(); }

  getTransportName(id: number) { return this.transport.find(t => t.id_transport === id)?.name ?? 'N/A'; }
  getEmployeeName(id: number)  { return this.employes.find(e => e.id_employee === id)?.name ?? 'N/A'; }
  getRouteName(id: number) {
    const r = this.tripRoute.find(r => r.id_route === id);
    return r ? `${r.origin} - ${r.destine}` : 'N/A';
  }

  /**
   * Client-side filter over the denormalized tripsView; matches transport or employee name.
   * No server round-trip; reflects the latest search value immediately.
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

  /** Controls QR modal visibility; true while the modal is open. */
  showQrModal = false;

  /** The trip row currently selected for QR display; passed to QrModalComponent via @Input. */
  selectedTrip: any = null;

  onQr(item: any) { this.selectedTrip = item; this.showQrModal = true; }
  onQrClose()     { this.showQrModal = false; this.selectedTrip = null; }

  changePage(page: number) {
    this.currentPage = page;
    this.loadPage(page);
  }

  loadPage(page: number) {
    this.loading = true;
    this.service.getLatestTrips(page).subscribe({
      next: () => {
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
