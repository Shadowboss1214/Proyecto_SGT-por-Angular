import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class QrService {
  private readonly API_BASE = 'http://localhost:8080';

  async generateTripQr(tripId: number): Promise<string> {
    const QRCode = await import('qrcode');
    const url = `${this.API_BASE}/trips/${tripId}`;
    return QRCode.toDataURL(url, { width: 256, margin: 2 });
  }
}
