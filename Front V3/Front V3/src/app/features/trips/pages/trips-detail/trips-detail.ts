import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TripService } from '../../services/trips';
import { Trip } from '../../models/trips';
import { CommonModule } from '@angular/common';
import { TripsForm } from '../../components/trips-form/trips-form';
import { QrService } from '../../../../core/services/qr.service';

/**
 * View component for the trip detail and edit screen (/app/.../trips/:id).
 *
 * Renders the trip form in read-only or edit mode depending on the URL path segments.
 * Also generates the trip's QR code inline (without the modal overlay) so the admin
 * can inspect it directly within the detail view. QR errors are suppressed so a
 * missing QR never prevents the detail view from loading.
 */
@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, TripsForm, RouterModule],
  templateUrl: './trips-detail.html',
  styleUrl: './trips-detail.css',
})
export class TripsDetailComponent implements OnInit {
  private qrService = inject(QrService);
  private cdr = inject(ChangeDetectorRef);

  /** The loaded trip record; undefined while loading or when the ID is not found. */
  trip?: Trip;

  /** Base64 PNG Data URL of the trip's QR code; null until generation completes. */
  qrDataUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: TripService
  ) { }

  /** True when the view is in create-or-edit mode; false for read-only detail. */
  isEdit = false;

  /**
   * Resolves the trip by route param `id`, determines view mode from URL segments,
   * and triggers QR generation for existing trips.
   *
   * QR errors are silently caught so a failed image generation never breaks the
   * detail view. ChangeDetectorRef.detectChanges() is called after the async QR
   * promise resolves because the result lands outside Angular's zone.
   */
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const url = this.route.snapshot.url.map(s => s.path);

    const isNew = url.includes('new');
    this.isEdit = url.includes('edit') || isNew;

    if (id && !isNew) {
      this.trip = this.service.getById(+id);
      if (this.trip) {
        this.qrService.generateTripQr(this.trip.id_trip)
          .then(url => { this.qrDataUrl = url; this.cdr.detectChanges(); })
          .catch(() => {});
      }
    }
  }

  /**
   * Deletes the trip and navigates back to the trip list.
   * @param id - String form of the trip primary key taken from the route snapshot.
   */
  delete(id: string){
    this.service.delete(+id);
    this.router.navigate(['/trip']);
  }
}
