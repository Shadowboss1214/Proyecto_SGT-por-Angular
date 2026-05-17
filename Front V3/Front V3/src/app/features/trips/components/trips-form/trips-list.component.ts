import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-trips-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trips-list.component.html'
})
export class TripsListComponent implements OnInit {
  private http = inject(HttpClient);
  trips: any[] = [];

  ngOnInit() {
    this.loadTrips();
  }

  loadTrips() {
    // Esta URL debe coincidir con la que creaste en Laminas API Tools
    this.http.get<any>(`${environment.apiUrl}/trips`).subscribe({
      next: (data) => {
        // Laminas suele devolver los datos dentro de una propiedad '_embedded'
        this.trips = data._embedded ? data._embedded.trips : data;
      },
      error: (err) => console.error('Error cargando viajes', err)
    });
  }
}