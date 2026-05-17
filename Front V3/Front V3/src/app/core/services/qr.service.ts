import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Service responsible for generating QR codes that link to trip REST resources.
 *
 * Uses dynamic import of `qrcode` so the library is excluded from the initial bundle
 * and loaded on demand only when the user requests a QR code for the first time.
 */
@Injectable({ providedIn: 'root' })
export class QrService {
  private readonly API_BASE = 'http://localhost:8080';
  private readonly FRONTEND_BASE = 'http://localhost:4200/app/admin';
  private auth = inject(AuthService);

  /**
   * Generates a QR code for a given REST entity and ID.
   *
   * Tries the backend first (`/qr/{entity}/{id}`); on any failure falls back to
   * client-side generation with the `qrcode` library, pointing to the frontend URL.
   * The library is loaded dynamically so it is excluded from the initial bundle.
   * @param entity - Resource name as it appears in the API path (e.g. `'trips'`, `'transport'`).
   * @param id - Primary key of the resource.
   * @returns Promise resolving to a Base64 PNG Data URL.
   */
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
      // Fallback: genera el QR en el cliente apuntando al frontend
      const QRCode = await import('qrcode');
      return QRCode.toDataURL(`${this.FRONTEND_BASE}/${entity}/${id}`, { width: 256, margin: 2 });
    }
  }

  /**
   * Convenience wrapper that generates a QR code for a trip resource.
   * @param tripId - Primary key of the trip.
   * @returns Promise resolving to a Base64 PNG Data URL.
   */
  generateTripQr(tripId: number): Promise<string> {
    return this.generateQr('trips', tripId);
  }
}
