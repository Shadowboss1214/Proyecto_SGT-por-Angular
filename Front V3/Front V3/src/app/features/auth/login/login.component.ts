import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
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
  private router = inject(Router);

  // Definimos el formulario con validaciones básicas
  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      
      this.authService.login(username!, password!).subscribe({
        next: (response) => {
          console.log('¡Login exitoso!', response);
          // Después del login, mandamos al usuario a la lista de viajes
          this.router.navigate(['/trips']);
        },
        error: (err) => {
          console.error('Error detallado:', err);
          alert('Error al iniciar sesión. Revisa la consola.');
        }
      });
    }
  }
}