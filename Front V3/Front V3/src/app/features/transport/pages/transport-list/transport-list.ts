import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransportService } from '../../services/transport';
import { Transport } from '../../models/transport';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../../../core/services/nav.service';
import { TableComponent } from '../../../../shared/components/table/table';
import { ReportService } from '../../../../core/services/report.service';
import { QrModalComponent } from '../../../../shared/components/qr-modal/qr-modal';



/**
 * Component that displays the paginated list of transport units.
 * Supports in-memory search by name and plate, status filtering,
 * pagination controls, and export to PDF and Excel.
 */

@Component({
  selector: 'app-transport-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableComponent, QrModalComponent],
  templateUrl: './transport-list.html',
  styleUrl: './transport-list.css'
})
export class TransportListComponent implements OnInit {

  /** Service for transport CRUD operations and pagination state */
  private service = inject(TransportService);

  /** Role-aware navigation service for redirecting to detail and edit views */
  private router = inject(NavigationService);

  /** Angular change detector used to force view update after async data load */
  private cdr = inject(ChangeDetectorRef);

  /** Service used to export report data to PDF and Excel formats */
  private reportService = inject(ReportService);

  loading = true;
  search = '';

  /** Current status filter value (e.g. `'ACTIVO'` | `'INACTIVO'`) */
  statusFilter = '';

  /** Transport records loaded from the current page */
  transports: Transport[] = [];

  /** Current active page number */
  currentPage = 1;

  /** Total number of pages available from the API */
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

   /**
   * Navigates to the read-only detail view of the selected transport.
   *
   * @param item - Transport unit selected by the user
   */
  onView(item: Transport)   { this.router.navigate(['/transport', item.id_transport]); }
   /**
   * Navigates to the edit form for the selected transport.
   *
   * @param item - Transport unit to be edited
   */
  onEdit(item: Transport)   { this.router.navigate(['/transport', item.id_transport, 'edit']); }
  /**
   * Deletes the selected transport unit and reloads the first page.
   *
   * @param item - Transport unit to be deleted
   */
  onDelete(item: Transport) {
    this.service.delete(item.id_transport).subscribe({
      next: () => this.loadTransports(this.currentPage),
      error: err => console.error('Error al eliminar transporte:', err)
    });
  }

   /**
   * Returns the subset of transports matching the current search and status filter.
   * Filters in memory against the currently loaded page.
   *
   * @returns Filtered array of transport units
   */
  get filtered(): Transport[] {
    const s = this.search.toLowerCase();
    return this.transports.filter(t =>
      (t.name?.toLowerCase().includes(s) || t.plate?.toLowerCase().includes(s)) &&
      (!this.statusFilter || t.status === this.statusFilter)
    );
  }

    /**
   * Updates the search string used to filter the transport list.
   * @param value - New search term entered by the user
   */
  onSearchChange(v: string) { this.search = v; }
  onStatusChange(v: string) { this.statusFilter = v; }

  /**
   * Exports the currently filtered transport list to a PDF file.
   */
  exportPdf()   { this.reportService.exportToPdf(this.filtered, this.columns, 'Reporte de Transportes'); }

    /**
   * Exports the currently filtered transport list to an Excel (.xlsx) file.
   */
  exportExcel() { this.reportService.exportToExcel(this.filtered, this.columns, 'reporte_transportes'); }

  showQrModal = false;
  selectedTransport: any = null;

  onQr(item: any) { this.selectedTransport = item; this.showQrModal = true; }
  onQrClose()     { this.showQrModal = false; this.selectedTransport = null; }

  changePage(page: number) {
    this.currentPage = page;
    this.loadTransports(page);
  }

  /**
   * Fetches a specific page of transports from the API and updates the component state.
   * Updates `currentPage`, `totalPages`, and `transports` after a successful response.
   *
   * @param page - Page number to load (1-based index)
   */
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
