import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start-page',
  standalone: true,
  template: ''
})
export class StartPageComponent implements OnInit {

  private router = inject(Router);

  ngOnInit(): void {

    /*const role = localStorage.getItem('role');

    // Si no hay sesión
    if (!role) {

      this.router.navigate(
        ['/app/login'],
        {
          replaceUrl: true,
          skipLocationChange: true
        }
      );

      return;
    } 
    if (role === 'admin') {
        this.router.navigate(
      ['/app/admin/dashboard'],
      {
        replaceUrl: true,
        skipLocationChange: true
      }
    );

      return;
    }

    this.router.navigate(
        ['/app/driver/dashboard'],
        {
          replaceUrl: true,
          skipLocationChange: true
        }
      );
      */
     this.router.navigate(
        ['/app/admin/dashboard'],
        {
          replaceUrl: true,
          skipLocationChange: true
        }
      );

  }

}