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

  @Input() entityType: string = '';
  @Input() entityId: number = 0;
  @Input() label: string = '';

  @Output() close = new EventEmitter<void>();

  qrDataUrl: string | null = null;
  loading = false;
  error = false;

  async ngOnInit() {
    if (this.entityType && this.entityId) {
      this.loading = true;
      this.error = false;
      try {
        this.qrDataUrl = await this.qrService.generateQr(this.entityType, this.entityId);
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
    a.download = `${this.entityType}-${this.entityId}-qr.png`;
    a.click();
  }

  onClose() { this.close.emit(); }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('qr-overlay')) {
      this.onClose();
    }
  }
}
