import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TripService } from '../../services/trips';
import { Trip } from '../../models/trips';
import { CommonModule } from '@angular/common';
import { TripsForm } from '../../components/trips-form/trips-form';
import { QrService } from '../../../../core/services/qr.service';
import { NavigationService } from '../../../../core/services/nav.service';

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
  private nav = inject(NavigationService);

  trip?: Trip;
  qrDataUrl: string | null = null;
  isEdit = false;

  constructor(
    private route: ActivatedRoute,
    private service: TripService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const url = this.route.snapshot.url.map(s => s.path);

    const isNew = url.includes('new');
    this.isEdit = url.includes('edit') || isNew;

    if (id && !isNew) {
      this.service.getById(+id).subscribe(trip => {
        this.trip = trip;
        this.qrService.generateTripQr(trip.id_trip)
          .then(url => { this.qrDataUrl = url; this.cdr.detectChanges(); })
          .catch(() => {});
      });
    }
  }

  delete(id: string) {
    this.service.delete(+id).subscribe(() => {
      this.nav.navigate(['/trips']);
    });
  }
}
