import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { TripService } from '../../services/trips';
import { TransportService } from '../../../transport/services/transport';
import { EmployeeService } from '../../../employes/services/employes';
import { Trip, Route } from '../../models/trips';
import { Transport } from '../../../transport/models/transport';
import { Employee } from '../../../employes/models/employee';
import { CommonModule } from '@angular/common';
import { TripsForm } from '../../components/trips-form/trips-form';
import { QrService } from '../../../../core/services/qr.service';
import { NavigationService } from '../../../../core/services/nav.service';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, TripsForm, RouterModule],
  templateUrl: './trips-detail.html',
  styleUrl: './trips-detail.css',
})
/**
 * Detail component for a single trip record.
 *
 * Handles three operating modes determined by the current URL:
 * - Read-only view (`/:id`)
 * - Edit mode (`/:id/edit`)
 * - Create mode (`/new`)
 *
 * Joins transport, employee, and route data so the template can display human-readable
 * names instead of raw foreign keys. All three lookups are resolved cache-first via
 * `forkJoin` to avoid redundant HTTP calls.
 */
export class TripsDetailComponent implements OnInit {

  private route            = inject(ActivatedRoute);
  private service          = inject(TripService);
  private transportService = inject(TransportService);
  private employeeService  = inject(EmployeeService);
  private qrService        = inject(QrService);
  private cdr              = inject(ChangeDetectorRef);
  private nav              = inject(NavigationService);

  trip?: Trip;
  transports: Transport[] = [];
  employees:  Employee[]  = [];

  tripRoutes: Route[] = [
    { id_route: 1, origin: 'Ciudad de México', destine: 'Guadalajara', distance: 541 },
    { id_route: 2, origin: 'Guadalajara',      destine: 'Monterrey',   distance: 742 },
    { id_route: 3, origin: 'Ciudad de México', destine: 'Monterrey',   distance: 921 },
    { id_route: 4, origin: 'Monterrey',        destine: 'Tijuana',     distance: 1891 },
    { id_route: 5, origin: 'Ciudad de México', destine: 'Puebla',      distance: 132 },
  ];

  qrDataUrl: string | null = null;
  isEdit  = false;
  loading = false;

  /**
   * Resolves the operating mode from the URL segments, then loads the trip together
   * with its related transport and employee records.
   *
   * Uses the service caches when all three are warm; falls back to `forkJoin` when
   * any cache is cold. Only shows the loading spinner in the network-fetch path.
   */
  ngOnInit() {
    const id  = this.route.snapshot.paramMap.get('id');
    const url = this.route.snapshot.url.map(s => s.path);

    const isNew = url.includes('new');
    this.isEdit = url.includes('edit') || isNew;

    if (id && !isNew) {
      const cachedTrip       = this.service.snapshot.find(t => t.id_trip === +id);
      const cachedTransports = this.transportService.snapshot;
      const cachedEmployees  = this.employeeService.snapshot;

      if (cachedTrip && cachedTransports.length > 0 && cachedEmployees.length > 0) {
        // Todo en caché: sin spinner, Angular lo renderiza en el primer ciclo
        this.trip       = cachedTrip;
        this.transports = cachedTransports;
        this.employees  = cachedEmployees;
        this.loadQr(cachedTrip.id_trip);
      } else {
        // Algún dato falta: ir a la red y mostrar spinner
        this.loading = true;
        forkJoin([
          cachedTrip
            ? of(cachedTrip)
            : this.service.getById(+id),
          cachedTransports.length > 0
            ? of(cachedTransports)
            : this.transportService.getLatestTransports(),
          cachedEmployees.length > 0
            ? of(cachedEmployees)
            : this.employeeService.getLatestEmployees()
        ]).subscribe({
          next: ([trip, transports, employees]) => {
            this.trip       = trip as Trip;
            this.transports = transports as Transport[];
            this.employees  = employees as Employee[];
            this.loading    = false;
            this.cdr.detectChanges();
            this.loadQr((trip as Trip).id_trip);
          },
          error: () => {
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  /**
   * Generates the QR code asynchronously; silently ignores errors so a QR failure
   * does not block the rest of the detail view from rendering.
   * @param id - Primary key of the trip.
   */
  private async loadQr(id: number) {
    try { this.qrDataUrl = await this.qrService.generateQr('trips', id); } catch { }
    this.cdr.detectChanges();
  }

  /**
   * Resolves the transport name from the loaded list; falls back to `"ID {id}"` when
   * the transport record is not yet in memory.
   * @param id - Foreign key `id_transport` from the trip record.
   * @returns Human-readable transport name or a fallback string.
   */
  getTransportName(id: number): string {
    return this.transports.find(t => t.id_transport === id)?.name ?? `ID ${id}`;
  }

  /**
   * Resolves the driver's full name from the loaded employee list; concatenates
   * `name` and `lastName`, trimming trailing whitespace when `lastName` is absent.
   * Falls back to `"ID {id}"` when the employee record is not in memory.
   * @param id - Foreign key `id_employee` from the trip record.
   * @returns Full name string or a fallback string.
   */
  getEmployeeName(id: number): string {
    const e = this.employees.find(emp => emp.id_employee === id);
    return e ? `${e.name} ${e.lastName ?? ''}`.trim() : `ID ${id}`;
  }

  /**
   * Resolves the route description from the static `tripRoutes` list.
   * Returns a formatted string `"Origin → Destination (distance km)"` or
   * `"ID {id}"` when the route ID is not in the static table.
   * @param id - Foreign key `id_route` from the trip record.
   * @returns Formatted route description or a fallback string.
   */
  getRouteName(id: number): string {
    const r = this.tripRoutes.find(r => r.id_route === id);
    return r ? `${r.origin} → ${r.destine} (${r.distance} km)` : `ID ${id}`;
  }

  downloadQr() {
    if (!this.qrDataUrl || !this.trip) return;
    const a = document.createElement('a');
    a.href  = this.qrDataUrl;
    a.download = `trips-${this.trip.id_trip}-qr.png`;
    a.click();
  }

  /**
   * Deletes the trip with the given ID and navigates back to the list.
   * @param id - String representation of the trip's primary key.
   */
  delete(id: string) {
    this.service.delete(+id).subscribe(() => this.nav.navigate(['/trips']));
  }

  goBack() { this.nav.navigate(['/trips']); }
}
