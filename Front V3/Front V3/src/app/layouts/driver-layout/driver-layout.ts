import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TopMenu } from '../../shared/components/top-menu/top-menu';

@Component({
  selector: 'app-driver-layout',
  imports: [RouterModule, TopMenu],
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
