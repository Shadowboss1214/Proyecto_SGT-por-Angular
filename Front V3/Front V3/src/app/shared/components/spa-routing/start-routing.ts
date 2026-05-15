import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-start-page',
  standalone: true,
  template: ''
})
export class StartPageComponent implements OnInit {

  private router = inject(Router);

  ngOnInit(): void {
    const token = localStorage.getItem('access_token');

    if (!token) {
      this.router.navigate(['/app/login'], { replaceUrl: true });
      return;
    }

    
    const role = localStorage.getItem('role');

    if (role === 'ADMIN') {
      this.router.navigate(['/app/admin/dashboard'], { replaceUrl: true });
    } else if (role === 'DRIVER') {
      this.router.navigate(['/app/driver/dashboard'], { replaceUrl: true });
    } else {
      this.router.navigate(['/app/login'], { replaceUrl: true });
    }
  }

}
