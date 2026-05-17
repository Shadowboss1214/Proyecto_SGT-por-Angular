import { Injectable, inject } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationService {

    private router = inject(Router);

    get roleBase(): string {
        const role = (localStorage.getItem('role') ?? '').toLowerCase();
        if (role === 'admin') return '/app/admin';
        if (role === 'driver' || role === 'choufer' || role === 'chofer') return '/app/driver';
        return '/app';
    }

    navigate(segments: any[], extras?: NavigationExtras) {
        console.log(this.roleBase);
        var ruta = '';
        segments.forEach(element => {
            console.log(element);
        });
        if (segments.join('').includes(this.roleBase)){
           ruta =  segments.join('/');
        }else{
            ruta =  this.roleBase + segments.join('/');
        }
        console.log(ruta)
        if (this.roleBase) {
            this.router.navigate( [`${ruta}`] , extras);
        } else {
            this.router.navigate([this.roleBase, segments.join('')], extras);
        }
    }
}