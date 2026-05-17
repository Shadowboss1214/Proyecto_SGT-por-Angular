import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employes';
import { Employee } from '../../models/employee';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../../../core/services/nav.service';
import { TableComponent } from '../../../../shared/components/table/table';
import { ReportService } from '../../../../core/services/report.service';

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

  onView(item: Employee) {
    if (item.id_employee) this.router.navigate(['/employee', item.id_employee]);
  }

  onEdit(item: Employee) {
    if (item.id_employee) this.router.navigate(['/employee', item.id_employee, 'edit']);
  }

  onDelete(item: Employee) {
    if (item.id_employee) {
      this.service.delete(item.id_employee).subscribe();
    }
  }

  get filtered(): Employee[] {
    const search = this.search.toLowerCase();
    return this.Employes.filter(e => e.name.toLowerCase().includes(search));
  }

  onSearchChange(value: string) { this.search = value; }
  onStatusChange(value: string) { this.statusFilter = value; }

  exportPdf(): void {
    this.reportService.exportToPdf(this.filtered, this.columns, 'Reporte de Empleados');
  }

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
