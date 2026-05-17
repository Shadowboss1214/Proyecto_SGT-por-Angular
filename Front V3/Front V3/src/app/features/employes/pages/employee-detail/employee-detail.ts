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
/**
 * Detail component for a single employee record.
 *
 * Handles three operating modes determined by the current URL:
 * - Read-only view (`/:id`)
 * - Edit mode (`/:id/edit`)
 * - Create mode (`/new`)
 *
 * Data is resolved cache-first from EmployeeService to avoid redundant HTTP calls
 * when navigating back from the list.
 */
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

  /**
   * Resolves the operating mode from the URL segments and loads employee data.
   *
   * Checks the service cache before going to the network; only shows the loading
   * spinner when a network request is actually needed. Queues QR code generation
   * after the employee record is available.
   */
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

  /**
   * Generates the QR code asynchronously; silently ignores errors because QR
   * failure should not block the rest of the detail view from rendering.
   * @param entity - Resource type string used by QrService (e.g. `'employee'`).
   * @param id - Primary key of the employee.
   */
  private async loadQr(entity: string, id: number) {
    try { this.qrDataUrl = await this.qrService.generateQr(entity, id); } catch { }
    this.cdr.detectChanges();
  }

  /**
   * Triggers a browser download of the employee's QR image as a PNG file.
   * No-op if the QR has not yet been generated.
   */
  downloadQr() {
    if (!this.qrDataUrl || !this.employee) return;
    const a = document.createElement('a');
    a.href  = this.qrDataUrl;
    a.download = `employee-${this.employee.id_employee}-qr.png`;
    a.click();
  }

  /**
   * Deletes the employee with the given ID and navigates back to the list.
   * @param id - String representation of the employee's primary key.
   */
  delete(id: string) {
    this.service.delete(Number(id)).subscribe(() => this.router.navigate(['/employee']));
  }

  goBack() { this.router.navigate(['/employee']); }
}
