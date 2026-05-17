import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
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
export class TripsDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(TripService);
  private transportService = inject(TransportService);
  private employeeService = inject(EmployeeService);
  private qrService = inject(QrService);
  private cdr = inject(ChangeDetectorRef);
  private nav = inject(NavigationService);

  trip?: Trip;
  transports: Transport[] = [];
  employees: Employee[] = [];
  tripRoutes: Route[] = [
    { id_route: 1, origin: 'Ciudad de México', destine: 'Guadalajara', distance: 541 },
    { id_route: 2, origin: 'Guadalajara', destine: 'Monterrey', distance: 742 },
    { id_route: 3, origin: 'Ciudad de México', destine: 'Monterrey', distance: 921 },
    { id_route: 4, origin: 'Monterrey', destine: 'Tijuana', distance: 1891 },
    { id_route: 5, origin: 'Ciudad de México', destine: 'Puebla', distance: 132 },
  ];

  qrDataUrl: string | null = null;
  isEdit = false;
  loading = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const url = this.route.snapshot.url.map(s => s.path);

    const isNew = url.includes('new');
    this.isEdit = url.includes('edit') || isNew;

    if (id && !isNew) {
      this.loading = true;
      forkJoin([
        this.service.getById(+id),
        this.transportService.getLatestTransports(),
        this.employeeService.getLatestEmployees()
      ]).subscribe({
        next: ([trip, transports, employees]) => {
          this.trip = trip;
          this.transports = transports;
          this.employees = employees;
          this.loading = false;
          this.cdr.detectChanges();
          this.loadQr(trip.id_trip);
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  private async loadQr(id: number) {
    try {
      this.qrDataUrl = await this.qrService.generateQr('trips', id);
    } catch { }
    this.cdr.detectChanges();
  }

  getTransportName(id: number): string {
    return this.transports.find(t => t.id_transport === id)?.name ?? `ID ${id}`;
  }

  getEmployeeName(id: number): string {
    const e = this.employees.find(emp => emp.id_employee === id);
    return e ? `${e.name} ${e.lastName ?? ''}`.trim() : `ID ${id}`;
  }

  getRouteName(id: number): string {
    const r = this.tripRoutes.find(r => r.id_route === id);
    return r ? `${r.origin} → ${r.destine} (${r.distance} km)` : `ID ${id}`;
  }

  downloadQr() {
    if (!this.qrDataUrl || !this.trip) return;
    const a = document.createElement('a');
    a.href = this.qrDataUrl;
    a.download = `trips-${this.trip.id_trip}-qr.png`;
    a.click();
  }

  delete(id: string) {
    this.service.delete(+id).subscribe(() => {
      this.nav.navigate(['/trips']);
    });
  }

  goBack() {
    this.nav.navigate(['/trips']);
  }
}
