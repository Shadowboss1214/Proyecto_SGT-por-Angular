import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrService } from '../../../core/services/qr.service';

@Component({
  selector: 'app-qr-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-modal.html',
  styleUrl: './qr-modal.css'
})
export class QrModalComponent implements OnInit {
  private qrService = inject(QrService);
  private cdr = inject(ChangeDetectorRef);

  @Input() trip: any = null;
  @Output() close = new EventEmitter<void>();

  qrDataUrl: string | null = null;
  loading = false;
  error = false;

  async ngOnInit() {
    if (this.trip?.id_trip) {
      this.loading = true;
      this.error = false;
      try {
        this.qrDataUrl = await this.qrService.generateTripQr(this.trip.id_trip);
      } catch {
        this.error = true;
      } finally {
        this.loading = false;
        this.cdr.detectChanges();
      }
    }
  }

  download() {
    if (!this.qrDataUrl) return;
    const a = document.createElement('a');
    a.href = this.qrDataUrl;
    a.download = `viaje-${this.trip.id_trip}-qr.png`;
    a.click();
  }

  onClose() {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('qr-overlay')) {
      this.onClose();
    }
  }
}
