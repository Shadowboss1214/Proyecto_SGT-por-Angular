import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TripService } from '../../services/trips';
import { Trip } from '../../models/trips';
import { CommonModule } from '@angular/common';
import { TripsForm } from '../../components/trips-form/trips-form';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, TripsForm, RouterModule],
  templateUrl: './trips-detail.html',
  styleUrl: './trips-detail.css',
})
export class TripsDetailComponent implements OnInit {

  trip?: Trip;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: TripService
  ) { }

  isEdit = false;

ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');
  const url = this.route.snapshot.url.map(s => s.path);

  const isNew = url.includes('new');
  this.isEdit = url.includes('edit') || isNew;

  if (id && !isNew) {
    this.trip = this.service.getById(+id);
  }
}

delete(id: string){
  this.service.delete(+id);
  this.router.navigate(['/trip']);
}
}