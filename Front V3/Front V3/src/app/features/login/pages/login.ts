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

        // El JWT ya trae el rol y el employeeId en el payload
        const payload = this.authService.getTokenPayload();
        const role = payload?.role ?? null;
        const employeeId = payload?.employeeId ?? null;

        if (role && employeeId) {
          //Usar directamente los datos del JWT sin llamada extra
          this.authService.saveRole(role);
          this.authService.saveEmployeeId(employeeId);
          this.redirect(role);
        } else {
          // Fallback: buscar por ID del empleado directamente
          this.authService.getEmployeeById(employeeId, response.access_token).subscribe({
            next: (employee: any) => {
              if (employee) {
                this.authService.saveRole(employee.role);
                this.authService.saveEmployeeId(employee.id_employee);
                this.redirect(employee.role);
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
      },
      error: () => {
        this.loading = false;
        this.error = 'Usuario o contraseña incorrectos';
      }
    });
  }

  private redirect(role: string) {
    const redirect = sessionStorage.getItem('redirect_after_login');
    if (redirect && redirect !== '/Bus.inc.com' && redirect !== '/') {
      sessionStorage.removeItem('redirect_after_login');
      this.router.navigate([redirect]);
      return;
    }

    const r = role.toLowerCase();
    if (r === 'admin') {
      this.router.navigate(['/app/admin/dashboard']);
    } else {
      this.router.navigate(['/app/driver/dashboard']);
    }
  }
}