import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employes';
import { Employee } from '../../models/employee';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../../../core/services/nav.service';
import {TableComponent} from '../../../../shared/components/table/table';
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

  search = '';
  statusFilter = '';
  Employes: Employee[] = [];
  

  columns = [
    { label: 'Nombre', field: 'name' },
    { label: 'Salario', field: 'salary' }
  ];

  onView(item: Employee) {
    if (item.id_employee) {
      this.router.navigate(['/employee', item.id_employee]);
    }
  }

  onEdit(item: Employee) {
    if (item.id_employee) {
      this.router.navigate(['/employee', item.id_employee, 'edit']);
    }
  }

  onDelete(item: Employee) {
    if (item.id_employee) {
      this.service.delete(item.id_employee);
    }
  }

  get filtered(): Employee[] {
    const search = this.search.toLowerCase();

    return this.Employes.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search);
      return matchSearch;
    });
  }
  onSearchChange(value: string) {
    this.search = value;
  }

  onStatusChange(value: string) {
    this.statusFilter = value;
  }

  ngOnInit() {
    this.service.getAll().subscribe(data => {
      this.Employes = data;
    });
  }

  exportPdf(): void {
    this.reportService.exportToPdf(
      this.filtered,
      this.columns,
      'Reporte de Empleados'
    );
  }

  exportExcel(): void {
    this.reportService.exportToExcel(
      this.filtered,
      this.columns,
      'reporte_empleados.xlsx'
    );
  }
}