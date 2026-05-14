import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [RouterModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  private router = inject(Router);

  goToDashboard(){
     this.router.navigate(
    ['/app/admin/dashboard'],
    {
      skipLocationChange: true
    }
  );
  }

  goToTrips(){
     this.router.navigate(
    ['/app/admin/trips'],
    {
      skipLocationChange: true
    }
  );
  }

  goToEmployees(){
     this.router.navigate(
    ['/app/admin/employee'],
    {
      skipLocationChange: true
    }
  );
  }

  goToLogistic(){
     this.router.navigate(
    ['/app/admin/logistics'],
    {
      skipLocationChange: true
    }
  );
  }

  goToTransport(){
     this.router.navigate(
    ['/app/admin/transport'],
    {
      skipLocationChange: true
    }
  );
  }
  
}
