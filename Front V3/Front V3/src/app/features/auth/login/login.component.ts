import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NavigationService } from '../../../core/services/nav.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css' // Asegúrate de que este archivo exista aunque esté vacío
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(NavigationService);

  // Definimos el formulario con validaciones básicas
  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      // Aquí ya tienes los valores extraídos del formulario
      const { username, password } = this.loginForm.value;

      // DEBES QUITAR EL 'this.' porque son constantes locales, no propiedades de la clase
      // También agregamos el "!" o aseguramos que no sean nulos para TS
      this.authService.login({
        username: username!,
        password: password!
      }).subscribe({
        next: (response: any) => {
          this.authService.saveToken(response.access_token);
          console.log('¡Login exitoso!', response);

          // Lógica de redirección por roles (como la teníamos antes)
          this.authService.getEmployeeByUsername(username!, response.access_token).subscribe({
            next: (data: any) => {
              const employees = data._embedded?.employees;
              const currentEmployee = employees?.find((e: any) => e.username === username);

              if (currentEmployee?.role === 'ADMIN') {
                const userRole = 'admin'
                localStorage.setItem('role', userRole);
                this.router.navigate([''],
                  { skipLocationChange: true }
                );
              } else {
                const userRole = 'driver';
                localStorage.setItem('role', userRole);
                this.router.navigate([''],
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