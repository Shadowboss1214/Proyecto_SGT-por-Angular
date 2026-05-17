import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TransportService } from '../../services/transport';
import { Transport } from '../../models/transport';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../../core/services/nav.service';
import { TransportFormComponent } from '../../components/transport-form/transport-form';
import { QrService } from '../../../../core/services/qr.service';


/**
 * Detail component for a single transport unit.
 * Handles three operating modes determined by the current URL:
 * - Read-only view (`/:id`)
 * - Edit mode (`/:id/edit`)
 * - Create mode (`/new`)
 */

@Component({
  selector: 'app-transport-detail',
  standalone: true,
  imports: [CommonModule, TransportFormComponent, RouterModule],
  templateUrl: './transport-detail.html',
  styleUrl: './transport-detail.css',
})
export class TransportDetailComponent implements OnInit {



  private route     = inject(ActivatedRoute);
  private router    = inject(NavigationService);
  private service   = inject(TransportService);
  private qrService = inject(QrService);
  private cdr       = inject(ChangeDetectorRef);

    transport?: Transport;
  /** Whether the component is in edit or create mode */
  
  isEdit   = false;
  loading  = false;
  qrDataUrl: string | null = null;

  /**
   * Lifecycle hook that resolves the operating mode and loads transport data.
   *
   * Reads the URL segments to determine whether the component is in
   * create (`new`), edit (`:id/edit`), or read-only (`:id`) mode.
   * Fetches the transport record from the service cache when an ID is present.
   */
  ngOnInit() {
    const id  = this.route.snapshot.paramMap.get('id');
    const url = this.route.snapshot.url.map(s => s.path);

    const isNew = url.includes('new');
    this.isEdit = url.includes('edit') || isNew;

    if (id && !isNew) {
      const cached = this.service.snapshot.find(t => t.id_transport === Number(id));

      if (cached) {
        this.transport = cached;
        this.loadQr('transport', cached.id_transport);
      } else {
        this.loading = true;
        this.service.getById(Number(id)).subscribe({
          next: t => {
            this.transport = t;
            this.loading   = false;
            this.cdr.detectChanges();
            this.loadQr('transport', t.id_transport);
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
    if (!this.qrDataUrl || !this.transport) return;
    const a = document.createElement('a');
    a.href  = this.qrDataUrl;
    a.download = `transport-${this.transport.id_transport}-qr.png`;
    a.click();
  }


   /**
   * Deletes the transport unit with the given ID and navigates back to the list.
   *
   * @param id - String representation of the transport's unique identifier
   */
  delete(id: string) {
    this.service.delete(Number(id)).subscribe(() => this.router.navigate(['/transport']));
  }

  goBack() { this.router.navigate(['/transport']); }
}
