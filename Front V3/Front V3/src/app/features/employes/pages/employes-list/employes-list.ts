import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employes';
import { Employee } from '../../models/employee';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../../../core/services/nav.service';
import { TableComponent } from '../../../../shared/components/table/table';
import { ReportService } from '../../../../core/services/report.service';

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
  imports: [CommonModule, RouterModule, TableComponent],
  templateUrl: './employes-list.html',
  styleUrl: './employes-list.css'
})
export class EmployeeListComponent implements OnInit {

  private service = inject(EmployeeService);
  private router = inject(NavigationService);
  private reportService = inject(ReportService);
  private cdr = inject(ChangeDetectorRef);
  currentPage = 1;
  totalPages  = this.service.total;

  search = '';
  statusFilter = '';
  Employes: Employee[] = [];

  columns = [
    { label: 'Nombre', field: 'name' },
    { label: 'Salario', field: 'salary' }
  ];

  ngOnInit() {
    this.service.getAll().subscribe(data => this.Employes = data);
    this.loadPage(1);
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
    if (item.id_employee) {
      this.service.delete(item.id_employee).subscribe();
    }
  }

  /**
   * Client-side filter applied over the current `Employes` snapshot.
   * No server round-trip; reflects the latest `search` value immediately.
   */
  get filtered(): Employee[] {
    const search = this.search.toLowerCase();
    return this.Employes.filter(e => e.name.toLowerCase().includes(search));
  }

  /** Syncs the search term from the template's input binding. */
  onSearchChange(value: string) { this.search = value; }

  /** Syncs the status filter; kept for interface parity with other list views. */
  onStatusChange(value: string) { this.statusFilter = value; }

  /** Exports the current filtered list as a PDF report via ReportService. */
  exportPdf(): void {
    this.reportService.exportToPdf(this.filtered, this.columns, 'Reporte de Empleados');
  }

  /** Exports the current filtered list as an Excel workbook via ReportService. */
  exportExcel(): void {
    this.reportService.exportToExcel(this.filtered, this.columns, 'reporte_empleados.xlsx');
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadPage(page);
  }

  loadPage(page: number) {
    this.service.getLatestEmployees(page).subscribe(() => {
      this.currentPage = this.service.page;
      this.totalPages  = this.service.total;
      this.cdr.detectChanges();
    });
  }
}
