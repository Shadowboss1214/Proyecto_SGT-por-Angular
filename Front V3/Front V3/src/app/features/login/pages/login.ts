import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NavigationService } from '../../../core/services/nav.service';

/**
 * Login component that handles user authentication.
 * Submits credentials to the OAuth2 endpoint, stores the received token,
 * resolves the employee's role and redirects to the appropriate dashboard.
 */

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

  /**
   * @param authService - Service that handles authentication, token storage and employee lookup
   * @param router      - Role-aware navigation service for redirecting after login
   */
  constructor(
    private authService: AuthService,
    private router: NavigationService
  ) {}

   /**
   * Handles the login form submission.
   *
   * Performs the following steps:
   * 1. Validates that both fields are filled.
   * 2. Sends credentials to the OAuth2 endpoint via `AuthService.login()`.
   * 3. Stores the received access token and optional refresh token.
   * 4. Fetches the employee record matching the username to resolve the role.
   * 5. Stores the role and employee ID, then redirects to the correct dashboard.
   *
   * @remarks
   * Redirects to `/app/admin/dashboard` for `ADMIN` role,
   * or `/app/driver/dashboard` for any other role.
   */
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
            const employees = data._embedded?.employees ?? [];
            const current = employees.find((e: any) => e.username === this.username);

            if (current) {
              this.authService.saveRole(current.role);
              this.authService.saveEmployeeId(current.id_employee);

              if (current.role === 'ADMIN') {
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
