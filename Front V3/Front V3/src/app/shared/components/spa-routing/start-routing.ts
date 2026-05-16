import { Component, inject, OnInit } from '@angular/core';
import { NavigationService } from '../../../core/services/nav.service';

@Component({
  selector: 'app-start-page',
  standalone: true,
  template: ''
})
export class StartPageComponent implements OnInit {

  private router = inject(NavigationService);

  ngOnInit(): void {
    const token = localStorage.getItem('access_token');

    if (!token) {
      localStorage.removeItem('role');
      console.log('sesion')
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    
    const role = localStorage.getItem('role');

    if (role === 'ADMIN') {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    } else if (role === 'DRIVER') {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    } else {
      localStorage.removeItem('role');
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

}
