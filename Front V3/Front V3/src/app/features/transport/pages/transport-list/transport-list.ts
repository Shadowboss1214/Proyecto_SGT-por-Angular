import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransportService } from '../../services/transport';
import { Transport } from '../../models/transport';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../../../core/services/nav.service';
import { TableComponent } from '../../../../shared/components/table/table';

@Component({
  selector: 'app-transport-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableComponent],
  templateUrl: './transport-list.html',
  styleUrl: './transport-list.css'
})
export class TransportListComponent implements OnInit {

  private service = inject(TransportService);
  private router = inject(NavigationService);
  private transportService = inject(TransportService);
  private cdr = inject(ChangeDetectorRef);
  
  transport: Transport[] = [];
  search = '';
  statusFilter = '';
  transports: Transport[] = [];


  columns = [
    { label: 'Nombre', field: 'name' },
    { label: 'Tipo', field: 'type' },
    { label: 'Placa', field: 'plate' },
    { label: 'Estado', field: 'status' },
    { label: 'Costo por Km', field: 'costperkm' },
    { label: 'Costo de mantenimiento', field: 'maintenancecost' },
    { label: 'Consumo de conbustible', field: 'fuelconsumption' }
  ];

  onView(item: Transport) {
    this.router.navigate(['/transport', item.id_transport]);
  }

  onEdit(item: Transport) {
    this.router.navigate(['/transport', item.id_transport, 'edit']);
  }

  onDelete(item: Transport) {
    this.service.delete(item.id_transport);
  }

  get filtered(): Transport[] {
    const search = this.search.toLowerCase();

    return this.transports.filter(t => {
      const matchSearch =
        t.name.toLowerCase().includes(search) ||
        t.plate.toLowerCase().includes(search);

      const matchStatus =
        !this.statusFilter || t.status === this.statusFilter;

      return matchSearch && matchStatus;
    });
  }
  onSearchChange(value: string) {
    this.search = value;
  }

  onStatusChange(value: string) {
    this.statusFilter = value;
  }

  ngOnInit() {
    this.loadTransports();
  }

  loadTransports() {
    this.transportService.getLatestTransports().subscribe({
      next: (data) => {
        this.transports = data;
        console.log('Transportes cargados en el Front:', this.transports);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al mapear la API de transportes:', err);
      }
    });
  }

}