import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class QrService {
  private readonly FRONTEND_BASE = `${environment.frontendUrl}/app/admin`;
  private auth = inject(AuthService);

  async generateQr(entity: string, id: number): Promise<string> {
    // Genera el QR directamente en el cliente apuntando al frontend
    const QRCode = await import('qrcode');
    const url = `${this.FRONTEND_BASE}/${entity}/${id}`;
    return QRCode.toDataURL(url, { width: 256, margin: 2 });
  }

  generateTripQr(tripId: number): Promise<string> {
    return this.generateQr('trips', tripId);
  }
}