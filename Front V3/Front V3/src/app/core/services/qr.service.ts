import { Injectable } from '@angular/core';

/**
 * Service responsible for generating QR codes that link to trip REST resources.
 *
 * Uses dynamic import of `qrcode` so the library is excluded from the initial bundle
 * and loaded on demand only when the user requests a QR code for the first time.
 */
@Injectable({ providedIn: 'root' })
export class QrService {
  private readonly API_BASE = 'http://localhost:8080';

  /**
   * Generates a QR code PNG as a Data URL for the given trip.
   *
   * The QR encodes the REST endpoint URL `{API_BASE}/trips/{tripId}`, so scanning
   * it provides direct API access to the trip resource without additional context.
   * @param tripId - The `id_trip` of the trip to encode.
   * @returns Promise resolving to a base64 PNG Data URL ready for use as an `<img>` src.
   * @throws Error if the `qrcode` library fails to generate the image.
   */
  async generateTripQr(tripId: number): Promise<string> {
    const QRCode = await import('qrcode');
    const url = `${this.API_BASE}/trips/${tripId}`;
    return QRCode.toDataURL(url, { width: 256, margin: 2 });
  }
}
