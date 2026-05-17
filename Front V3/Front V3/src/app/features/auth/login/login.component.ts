import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * View component for the authentication screen (/app/login).
 *
 * Owns the reactive login form and orchestrates the OAuth2 exchange via AuthService.
 * Navigates to the role-appropriate layout after a successful login; never stores
 * the token or the role directly — those responsibilities belong to AuthService
 * and localStorage respectively.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  /**
   * Submits credentials to AuthService when the form is valid.
   *
   * Precondition: both username and password fields must satisfy Validators.required.
   * On success: the access token is persisted via AuthService.saveToken() and the
   * user navigates to /admin or /driver based on the role returned by the backend.
   * On failure: an alert is shown and the user remains on the login screen.
   */
  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.authService.login({
        username: username!,
        password: password!
      }).subscribe({
        next: (response: any) => {
          this.authService.saveToken(response.access_token);
          console.log('¡Login exitoso!', response);

          this.authService.getEmployeeByUsername(username!, response.access_token).subscribe({
            next: (data: any) => {
              const employees = data._embedded?.employees;
              const currentEmployee = employees?.find((e: any) => e.username === username);

              if (currentEmployee?.role === 'ADMIN') {
                const userRole = 'admin'
                localStorage.setItem('role', userRole);
                this.router.navigate(['/admin'],
                  { skipLocationChange: true }
                );
              } else {
                const userRole = 'driver';
                localStorage.setItem('role', userRole);
                this.router.navigate(['/driver'],
                  { skipLocationChange: true }
                );
              }
            },
            error: () => this.router.navigate(['/login'], { skipLocationChange: true })
          });
        },
        error: (err: any) => {
          console.error('Error en el login', err);
          alert('Usuario o contraseña incorrectos');
        }
      });
    }
  }
}
