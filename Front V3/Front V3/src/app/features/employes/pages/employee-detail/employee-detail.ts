import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EmployeeService } from '../../services/employes';
import { Employee } from '../../models/employee';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../../core/services/nav.service';
import { EmployeeFormComponent } from '../../components/employee-form/employee-form';
import { QrService } from '../../../../core/services/qr.service';

/**
 * Shared view/edit/create component for the employee detail screen.
 *
 * Determines its operating mode by inspecting URL segments on init: 'new' activates
 * create mode (isEdit=true, no record loaded), ':id/edit' activates edit mode, and
 * ':id' alone renders a read-only view. Delegates form rendering to EmployeeFormComponent,
 * passing the loaded record and the primary key as @Input bindings.
 */
@Component({
  selector: 'app-Employee-detail',
  standalone: true,
  imports: [CommonModule, EmployeeFormComponent, RouterModule],
  templateUrl: './employee-detail.html',
  styleUrl: './employee-detail.css',
})
export class EmployeeDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(NavigationService);
  private service = inject(EmployeeService);
  private qrService = inject(QrService);
  private cdr = inject(ChangeDetectorRef);

  employee?: Employee;
  isEdit = false;
  loading = false;
  qrDataUrl: string | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const url = this.route.snapshot.url.map(s => s.path);

    const isNew = url.includes('new');
    this.isEdit = url.includes('edit') || isNew;

    if (id && !isNew) {
      this.loading = true;
      this.service.getById(Number(id)).subscribe({
        next: emp => {
          this.employee = emp;
          this.loading = false;
          this.cdr.detectChanges();
          this.loadQr('employee', emp.id_employee);
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  private async loadQr(entity: string, id: number) {
    try {
      this.qrDataUrl = await this.qrService.generateQr(entity, id);
    } catch { }
    this.cdr.detectChanges();
  }

  downloadQr() {
    if (!this.qrDataUrl || !this.employee) return;
    const a = document.createElement('a');
    a.href = this.qrDataUrl;
    a.download = `employee-${this.employee.id_employee}-qr.png`;
    a.click();
  }

  delete(id: string) {
    this.service.delete(Number(id)).subscribe(() => {
      this.router.navigate(['/employee']);
    });
  }

  goBack() {
    this.router.navigate(['/employee']);
  }
}
