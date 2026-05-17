import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EmployeeService } from '../../services/employes';
import { Employee } from '../../models/employee';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../../core/services/nav.service';
import { EmployeeFormComponent } from '../../components/employee-form/employee-form';
import { QrService } from '../../../../core/services/qr.service';

@Component({
  selector: 'app-Employee-detail',
  standalone: true,
  imports: [CommonModule, EmployeeFormComponent, RouterModule],
  templateUrl: './employee-detail.html',
  styleUrl: './employee-detail.css',
})
export class EmployeeDetailComponent implements OnInit {

  private route     = inject(ActivatedRoute);
  private router    = inject(NavigationService);
  private service   = inject(EmployeeService);
  private qrService = inject(QrService);
  private cdr       = inject(ChangeDetectorRef);

  employee?: Employee;
  isEdit   = false;
  loading  = false;
  qrDataUrl: string | null = null;

  ngOnInit() {
    const id  = this.route.snapshot.paramMap.get('id');
    const url = this.route.snapshot.url.map(s => s.path);

    const isNew = url.includes('new');
    this.isEdit = url.includes('edit') || isNew;

    if (id && !isNew) {
      const cached = this.service.snapshot.find(e => e.id_employee === Number(id));

      if (cached) {
        // Caché disponible: asignar directamente, sin spinner, Angular lo renderiza en el primer ciclo
        this.employee = cached;
        this.loadQr('employee', cached.id_employee);
      } else {
        // Sin caché: ir a la red y mostrar spinner
        this.loading = true;
        this.service.getById(Number(id)).subscribe({
          next: emp => {
            this.employee = emp;
            this.loading  = false;
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
  }

  private async loadQr(entity: string, id: number) {
    try { this.qrDataUrl = await this.qrService.generateQr(entity, id); } catch { }
    this.cdr.detectChanges();
  }

  downloadQr() {
    if (!this.qrDataUrl || !this.employee) return;
    const a = document.createElement('a');
    a.href  = this.qrDataUrl;
    a.download = `employee-${this.employee.id_employee}-qr.png`;
    a.click();
  }

  delete(id: string) {
    this.service.delete(Number(id)).subscribe(() => this.router.navigate(['/employee']));
  }

  goBack() { this.router.navigate(['/employee']); }
}
