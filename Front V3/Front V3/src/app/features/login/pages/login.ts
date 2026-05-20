import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NavigationService } from '../../../core/services/nav.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  username = '';
  password = '';
  loading  = false;
  error    = '';

  constructor(
    private authService: AuthService,
    private router: NavigationService
  ) {}

  login() {
    if (!this.username || !this.password) {
      this.error = 'Por favor, llena todos los campos';
      return;
    }

    this.loading = true;
    this.error   = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (response: any) => {
        this.authService.saveToken(response.access_token);
        if (response.refresh_token) this.authService.saveRefreshToken(response.refresh_token);

        this.authService.getEmployeeByUsername(this.username, response.access_token).subscribe({
          next: (data: any) => {
            console.log('Respuesta employees:', JSON.stringify(data));
            console.log('Username buscado:', this.username);
            const employees = data._embedded?.employees ?? [];
            console.log('Empleados encontrados:', employees.length);
            console.log('Empleados:', JSON.stringify(employees));
            const current = employees.find((e: any) => e.username === this.username);
            console.log('Empleado actual:', JSON.stringify(current));

            if (current) {
              this.authService.saveRole(current.role);
              this.authService.saveEmployeeId(current.id_employee);

              const redirect = sessionStorage.getItem('redirect_after_login');
              if (redirect && redirect !== '/Bus.inc.com' && redirect !== '/') {
                sessionStorage.removeItem('redirect_after_login');
                this.router.navigate([redirect]);
              } else if (current.role === 'ADMIN') {
                this.router.navigate(['/app/admin/dashboard']);
              } else {
                this.router.navigate(['/app/driver/dashboard']);
              }
            } else {
              this.loading = false;
              this.error = 'Usuario no encontrado en la base de datos de empleados';
            }
          },
          error: () => {
            this.loading = false;
            this.error = 'Error al verificar el rol del usuario';
          }
        });
      },
      error: () => {
        this.loading = false;
        this.error = 'Usuario o contraseña incorrectos';
      }
    });
  }
}
