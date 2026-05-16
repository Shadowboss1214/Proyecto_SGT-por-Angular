import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../core/services/nav.service';
import { TopMenu } from '../../shared/components/top-menu/top-menu';

@Component({
  selector: 'app-driver-layout',
  imports: [RouterModule, TopMenu],
  templateUrl: './driver-layout.html',
  styleUrl: './driver-layout.css',
})
export class DriverLayout {
    private router = inject(NavigationService);

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
