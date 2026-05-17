import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrService } from '../../../core/services/qr.service';

/**
 * Presentational modal component for displaying and downloading a trip's QR code.
 *
 * Manages three UI states internally — loading, error, and QR ready — so the parent
 * never needs to track generation status. Self-contained: calls QrService on init
 * and emits a close event when dismissed, keeping the parent decoupled from QR logic.
 */
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

  /** Base64 PNG Data URL produced by QrService; null while loading or on error. */
  qrDataUrl: string | null = null;

  /** True while the async QR generation is in progress. */
  loading = false;

  /** True when QR generation threw an error, allowing the template to show a fallback. */
  error = false;

  /**
   * Generates the QR code as soon as the modal renders.
   *
   * ChangeDetectorRef.detectChanges() is required because the async call resolves
   * outside Angular's zone and the template would not update without an explicit check.
   */
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

  /**
   * Triggers a browser download of the QR image as a PNG file.
   *
   * The filename encodes the trip ID so the file is identifiable without opening it.
   * No-op if the QR has not been generated yet.
   */
  download() {
    if (!this.qrDataUrl) return;
    const a = document.createElement('a');
    a.href = this.qrDataUrl;
    a.download = `${this.entityType}-${this.entityId}-qr.png`;
    a.click();
  }

  onClose() { this.close.emit(); }

  /**
   * Closes the modal when the user clicks the backdrop overlay.
   *
   * Guards against child-element clicks by checking that the event target
   * is the overlay itself, preventing accidental dismissal when interacting
   * with the modal card's interior.
   * @param event - The mouse event from the overlay element's click handler.
   */
  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('qr-overlay')) {
      this.onClose();
    }
  }
}
