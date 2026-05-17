import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransportService } from '../../services/transport';
import { Transport } from '../../models/transport';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../../../core/services/nav.service';
import { TableComponent } from '../../../../shared/components/table/table';
import { ReportService } from '../../../../core/services/report.service';

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
  private reportService = inject(ReportService);
  
  transport: Transport[] = [];
  search = '';
  statusFilter = '';
  transports: Transport[] = [];
  currentPage = 1;
  totalPages = this.transportService.total;


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
    this.service.delete(item.id_transport).subscribe({
      next: () => this.loadTransports(1),
      error: (err: any) => console.error('Error al eliminar transporte:', err)
    });
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
    this.loadTransports(1);
  }

  exportPdf(): void {
    this.reportService.exportToPdf(this.filtered, this.columns, 'Reporte de Transportes');
  }

  exportExcel(): void {
    this.reportService.exportToExcel(this.filtered, this.columns, 'reporte_transportes');
  }

  loadTransports(page: number) {
    this.transportService.getLatestTransports(page).subscribe({
      next: (data) => {
        this.currentPage = this.transportService.page;
        this.totalPages = this.transportService.total;
        this.transports = data;
        console.log('Transportes cargados en el Front:', this.transports);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al mapear la API de transportes:', err);
      }
    });
  }

  changePage(page: number) {
    this.currentPage = page;

    this.loadTransports(page);
  }

}