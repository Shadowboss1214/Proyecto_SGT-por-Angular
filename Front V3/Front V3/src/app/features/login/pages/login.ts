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
        this.findEmployee(response.access_token, 1);
      },
      error: () => {
        this.loading = false;
        this.error = 'Usuario o contraseña incorrectos';
      }
    });
  }

  private findEmployee(token: string, page: number) {
    this.authService.getEmployeeByUsername(this.username, token, page).subscribe({
      next: (data: any) => {
        const employees = data._embedded?.employees ?? [];
        const current = employees.find((e: any) => e.username === this.username);

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
        } else if (page < (data.page_count ?? 1)) {
          // No encontrado en esta página, buscar en la siguiente
          this.findEmployee(token, page + 1);
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
  }
}