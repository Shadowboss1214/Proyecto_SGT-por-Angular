import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TransportService } from '../../services/transport';
import { Transport } from '../../models/transport';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../../core/services/nav.service';
import { TransportFormComponent } from '../../components/transport-form/transport-form';
import { QrService } from '../../../../core/services/qr.service';

@Component({
  selector: 'app-transport-detail',
  standalone: true,
  imports: [CommonModule, TransportFormComponent, RouterModule],
  templateUrl: './transport-detail.html',
  styleUrl: './transport-detail.css',
})
export class TransportDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(NavigationService);
  private service = inject(TransportService);
  private qrService = inject(QrService);
  private cdr = inject(ChangeDetectorRef);

  transport?: Transport;
  isEdit = false;
  loading = false;
  qrDataUrl: string | null = null;

  ngOnInit() {
    const id  = this.route.snapshot.paramMap.get('id');
    const url = this.route.snapshot.url.map(s => s.path);

    const isNew = url.includes('new');
    this.isEdit = url.includes('edit') || isNew;

    if (id && !isNew) {
      this.loading = true;
      this.service.getById(Number(id)).subscribe({
        next: t => {
          this.transport = t;
          this.loading = false;
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

  private async loadQr(entity: string, id: number) {
    try {
      this.qrDataUrl = await this.qrService.generateQr(entity, id);
    } catch { }
    this.cdr.detectChanges();
  }

  downloadQr() {
    if (!this.qrDataUrl || !this.transport) return;
    const a = document.createElement('a');
    a.href = this.qrDataUrl;
    a.download = `transport-${this.transport.id_transport}-qr.png`;
    a.click();
  }

  delete(id: string) {
    this.service.delete(Number(id)).subscribe(() => {
      this.router.navigate(['/transport']);
    });
  }

  goBack() {
    this.router.navigate(['/transport']);
  }
}
