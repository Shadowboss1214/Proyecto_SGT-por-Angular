import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransportService } from '../../services/transport';
import { Transport } from '../../models/transport';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../../../core/services/nav.service';
import { TableComponent } from '../../../../shared/components/table/table';
import { ReportService } from '../../../../core/services/report.service';
import { QrModalComponent } from '../../../../shared/components/qr-modal/qr-modal';

@Component({
  selector: 'app-transport-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableComponent, QrModalComponent],
  templateUrl: './transport-list.html',
  styleUrl: './transport-list.css'
})
export class TransportListComponent implements OnInit {

  private service = inject(TransportService);
  private router = inject(NavigationService);
  private cdr = inject(ChangeDetectorRef);
  private reportService = inject(ReportService);

  loading = true;
  search = '';
  statusFilter = '';
  transports: Transport[] = [];
  currentPage = 1;
  totalPages = 1;

  columns = [
    { label: 'Nombre',               field: 'name' },
    { label: 'Tipo',                 field: 'type' },
    { label: 'Placa',                field: 'plate' },
    { label: 'Estado',               field: 'status' },
    { label: 'Costo por Km',         field: 'costperkm' },
    { label: 'Costo mantenimiento',  field: 'maintenancecost' },
    { label: 'Consumo combustible',  field: 'fuelconsumption' }
  ];

  ngOnInit() {
    if (this.service.snapshot.length > 0) {
      this.transports = this.service.snapshot;
      this.loading = false;
      this.currentPage = this.service.page;
      this.totalPages  = this.service.total;
    } else {
      this.loadTransports(1);
    }
  }

  onView(item: Transport)   { this.router.navigate(['/transport', item.id_transport]); }
  onEdit(item: Transport)   { this.router.navigate(['/transport', item.id_transport, 'edit']); }
  onDelete(item: Transport) {
    this.service.delete(item.id_transport).subscribe({
      next: () => this.loadTransports(this.currentPage),
      error: err => console.error('Error al eliminar transporte:', err)
    });
  }

  get filtered(): Transport[] {
    const s = this.search.toLowerCase();
    return this.transports.filter(t =>
      (t.name?.toLowerCase().includes(s) || t.plate?.toLowerCase().includes(s)) &&
      (!this.statusFilter || t.status === this.statusFilter)
    );
  }

  onSearchChange(v: string) { this.search = v; }
  onStatusChange(v: string) { this.statusFilter = v; }

  exportPdf()   { this.reportService.exportToPdf(this.filtered, this.columns, 'Reporte de Transportes'); }
  exportExcel() { this.reportService.exportToExcel(this.filtered, this.columns, 'reporte_transportes'); }

  showQrModal = false;
  selectedTransport: any = null;

  onQr(item: any) { this.selectedTransport = item; this.showQrModal = true; }
  onQrClose()     { this.showQrModal = false; this.selectedTransport = null; }

  changePage(page: number) {
    this.currentPage = page;
    this.loadTransports(page);
  }

  loadTransports(page: number) {
    this.loading = true;
    this.service.getLatestTransports(page).subscribe({
      next: data => {
        this.transports = data;
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
