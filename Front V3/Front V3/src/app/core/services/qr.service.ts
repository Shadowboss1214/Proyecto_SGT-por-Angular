import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class QrService {
  private readonly API_BASE = environment.apiUrl;
  private readonly FRONTEND_BASE = `${environment.frontendUrl}/app/admin`;
  private auth = inject(AuthService);

  async generateQr(entity: string, id: number): Promise<string> {
    try {
      const token = this.auth.getToken();
      const res = await fetch(`${this.API_BASE}/qr/${entity}/${id}`, {
        headers: { 'Authorization': `Bearer ${token ?? ''}` }
      });
      if (!res.ok) throw new Error('backend-fail');
      const data = await res.json();
      if (data.data_url) return data.data_url;
      throw new Error('no-data-url');
    } catch {
      const QRCode = await import('qrcode');
      return QRCode.toDataURL(`${this.FRONTEND_BASE}/${entity}/${id}`, { width: 256, margin: 2 });
    }
  }

  generateTripQr(tripId: number): Promise<string> {
    return this.generateQr('trips', tripId);
  }
}