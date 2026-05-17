import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransportService } from '../../services/transport';
import { Transport } from '../../models/transport';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../../../core/services/nav.service';
import { TableComponent } from '../../../../shared/components/table/table';
import { ReportService } from '../../../../core/services/report.service';

/**
 * Component that displays the paginated list of transport units.
 * Supports in-memory search by name and plate, status filtering,
 * pagination controls, and export to PDF and Excel.
 */

@Component({
  selector: 'app-transport-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableComponent],
  templateUrl: './transport-list.html',
  styleUrl: './transport-list.css'
})
export class TransportListComponent implements OnInit {

  /** Service for transport CRUD operations and pagination state */
  private service = inject(TransportService);

  /** Role-aware navigation service for redirecting to detail and edit views */
  private router = inject(NavigationService);

  /** Alias for TransportService used in paginated data loading */
  private transportService = inject(TransportService);

  /** Angular change detector used to force view update after async data load */
  private cdr = inject(ChangeDetectorRef);

  /** Service used to export report data to PDF and Excel formats */
  private reportService = inject(ReportService);

  /** Legacy transport array, kept for potential direct assignments */
  transport: Transport[] = [];

  /** Current search string used to filter transports by name or plate */
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
    { label: 'Nombre', field: 'name' },
    { label: 'Tipo', field: 'type' },
    { label: 'Placa', field: 'plate' },
    { label: 'Estado', field: 'status' },
    { label: 'Costo por Km', field: 'costperkm' },
    { label: 'Costo de mantenimiento', field: 'maintenancecost' },
    { label: 'Consumo de conbustible', field: 'fuelconsumption' }
  ];

   /**
   * Navigates to the read-only detail view of the selected transport.
   *
   * @param item - Transport unit selected by the user
   */
  onView(item: Transport) {
    this.router.navigate(['/transport', item.id_transport]);
  }

   /**
   * Navigates to the edit form for the selected transport.
   *
   * @param item - Transport unit to be edited
   */
  onEdit(item: Transport) {
    this.router.navigate(['/transport', item.id_transport, 'edit']);
  }

  /**
   * Deletes the selected transport unit and reloads the first page.
   *
   * @param item - Transport unit to be deleted
   */
  onDelete(item: Transport) {
    this.service.delete(item.id_transport).subscribe({
      next: () => this.loadTransports(1),
      error: (err: any) => console.error('Error al eliminar transporte:', err)
    });
  }

   /**
   * Returns the subset of transports matching the current search and status filter.
   * Filters in memory against the currently loaded page.
   *
   * @returns Filtered array of transport units
   */
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

   /**
   * Updates the search string used to filter the transport list.
   * @param value - New search term entered by the user
   */
  onSearchChange(value: string) {
    this.search = value;
  }

  /**
   * Updates the status filter used to filter the transport list.
   *
   * @param value - Status value selected by the user (e.g. `'ACTIVO'`)
   */
  onStatusChange(value: string) {
    this.statusFilter = value;
  }

   /**
   * Lifecycle hook that loads the first page of transports on component initialization.
   */
  ngOnInit() {
    this.loadTransports(1);
  }

  /**
   * Exports the currently filtered transport list to a PDF file.
   */
  exportPdf(): void {
    this.reportService.exportToPdf(this.filtered, this.columns, 'Reporte de Transportes');
  }

    /**
   * Exports the currently filtered transport list to an Excel (.xlsx) file.
   */

  exportExcel(): void {
    this.reportService.exportToExcel(this.filtered, this.columns, 'reporte_transportes');
  }

  /**
   * Fetches a specific page of transports from the API and updates the component state.
   * Updates `currentPage`, `totalPages`, and `transports` after a successful response.
   *
   * @param page - Page number to load (1-based index)
   */
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

   /**
   * Handles page change events emitted by the table pagination controls.
   * Updates the current page and fetches the corresponding transport data.
   *
   * @param page - New page number selected by the user
   */
  changePage(page: number) {
    this.currentPage = page;
    this.loadTransports(page);
  }

}