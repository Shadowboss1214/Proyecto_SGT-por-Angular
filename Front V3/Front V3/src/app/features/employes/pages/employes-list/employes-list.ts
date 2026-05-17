import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employes';
import { Employee } from '../../models/employee';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../../../core/services/nav.service';
import { TableComponent } from '../../../../shared/components/table/table';
import { ReportService } from '../../../../core/services/report.service';
import { QrModalComponent } from '../../../../shared/components/qr-modal/qr-modal';

/**
 * View component for the employee list screen (/app/admin/employee).
 *
 * Subscribes to EmployeeService.data$ on init and delegates rendering to the
 * generic <app-table> component. Mutations (delete) are forwarded to the service;
 * navigation actions (view, edit) are handled by the Router so the View never
 * writes state directly.
 */
@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableComponent, QrModalComponent],
  templateUrl: './employes-list.html',
  styleUrl: './employes-list.css'
})
export class EmployeeListComponent implements OnInit {

  private service = inject(EmployeeService);
  private router = inject(NavigationService);
  private reportService = inject(ReportService);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  currentPage = 1;
  totalPages = 1;
  search = '';
  Employes: Employee[] = [];

  columns = [
    { label: 'Nombre', field: 'name' },
    { label: 'Salario', field: 'salary' }
  ];

  /**
   * Subscribes to the employee stream and loads the first page if the cache is cold.
   *
   * Two separate subscriptions run in parallel: `getAll()` keeps the template in sync
   * with any mutation pushed by the service, while `loadPage(1)` seeds the cache when
   * no snapshot exists yet. When the cache is warm, pagination state is restored directly
   * from the service so no network call is made.
   */
  ngOnInit() {
    this.service.getAll().subscribe(data => {
      this.Employes = data;
      this.cdr.detectChanges();
    });

    if (this.service.snapshot.length > 0) {
      this.loading = false;
      this.currentPage = this.service.page;
      this.totalPages  = this.service.total;
    } else {
      this.loadPage(1);
    }
  }

  /**
   * Navigates to the employee detail view for the selected row.
   * @param item - The employee the user clicked.
   */
  onView(item: Employee) {
    if (item.id_employee) this.router.navigate(['/employee', item.id_employee]);
  }

  /**
   * Navigates to the employee edit form for the selected row.
   * @param item - The employee the user clicked.
   */
  onEdit(item: Employee) {
    if (item.id_employee) this.router.navigate(['/employee', item.id_employee, 'edit']);
  }

  /**
   * Delegates deletion to EmployeeService; the reactive stream propagates the
   * updated list back to the template without requiring a manual re-fetch.
   * @param item - The employee row to delete.
   */
  onDelete(item: Employee) {
    if (item.id_employee) this.service.delete(item.id_employee).subscribe();
  }

  /**
   * Client-side filter applied over the current `Employes` snapshot.
   * No server round-trip; reflects the latest `search` value immediately.
   */
  get filtered(): Employee[] {
    const search = this.search.toLowerCase();
    return this.Employes.filter(e => e.name?.toLowerCase().includes(search));
  }

  /** Syncs the search term from the template's input binding. */
  onSearchChange(value: string) { this.search = value; }

  exportPdf() { this.reportService.exportToPdf(this.filtered, this.columns, 'Reporte de Empleados'); }
  exportExcel() { this.reportService.exportToExcel(this.filtered, this.columns, 'reporte_empleados.xlsx'); }

  showQrModal = false;
  selectedEmployee: any = null;

  onQr(item: any) { this.selectedEmployee = item; this.showQrModal = true; }
  onQrClose() { this.showQrModal = false; this.selectedEmployee = null; }

  /** Advances to the requested page and triggers a network fetch. */
  changePage(page: number) {
    this.currentPage = page;
    this.loadPage(page);
  }

  /**
   * Fetches the given page from the API and syncs pagination state.
   * Updates `currentPage` and `totalPages` from the service after the response.
   * @param page - 1-based page number to load.
   */
  loadPage(page: number) {
    this.loading = true;
    this.service.getLatestEmployees(page).subscribe({
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
