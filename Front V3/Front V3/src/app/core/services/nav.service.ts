import { Injectable, inject } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';


/**
 * Role-aware navigation service.
 * Automatically prepends the correct base route based on the authenticated
 * user's role, so components do not need to know the role-based route structure.
 */

@Injectable({ providedIn: 'root' })
export class NavigationService {

      /** Angular Router instance used to perform navigation */
    private router = inject(Router);

     /**
     * Returns the base route corresponding to the authenticated user's role.
     * Reads the role from `localStorage` and returns the appropriate route prefix.
     *
     * @returns Base route based on the user's role:
     * - `ADMIN`   → `/app/admin`
     * - `CHOUFER` → `/app/driver`
     * - Others    → `/app`
     */
    get roleBase(): string {
        if (localStorage.getItem('role') == 'ADMIN') {
            const role = localStorage.getItem('role')?.toLowerCase();
            return `/app/${role}`;
        } else if(localStorage.getItem('role') == 'CHOUFER'){
            return `/app/driver`;
        }

        return `/app`;
    }

     /**
     * Navigates to a route built from the provided segments,
     * automatically prepending the role's base route if not already included.
     *
     * @param segments - Route segments to navigate to (e.g. `['/employee', 1, 'edit']`)
     * @param extras   - Optional Angular navigation extras (`NavigationExtras`)
     *
     * @example
     * // ADMIN user navigating to employee detail
     * this.navigationService.navigate(['/employee', id]);
     * // Result: /app/admin/employee/1
     */
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