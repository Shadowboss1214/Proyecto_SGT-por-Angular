import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-driver-layout',
  imports: [RouterModule],
  templateUrl: './driver-layout.html',
  styleUrl: './driver-layout.css',
})
export class DriverLayout {
    private router = inject(Router);

  goToDashboard(){
     this.router.navigate(
    ['/app/driver/dashboard'],
    {
      skipLocationChange: true
    }
  );
  }

  goToTrips(){
     this.router.navigate(
    ['/app/driver/trips'],
    {
      skipLocationChange: true
    }
  );
  }
}
