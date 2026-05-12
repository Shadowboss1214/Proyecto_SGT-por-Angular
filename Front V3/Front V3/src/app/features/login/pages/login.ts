import { Component } from '@angular/core';
import { AuthService } from '../services/auth';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  username = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    // Validamos que no estén vacíos
    if (!this.username || !this.password) {
      alert('Por favor, llena todos los campos');
      return;
    }

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (response) => {
        // Guardamos el token usando el método de tu servicio
        this.authService.saveToken(response.access_token);

        // Lógica de redirección basada en tu diseño
        // Nota: Si Laminas no devuelve "role", por ahora usaremos tu lógica de nombre
        if (this.username === 'gael_Admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/driver']);
        }

        console.log('Login correcto');
      },
      error: (error) => {
        console.error('Error en el login:', error);
        alert('Credenciales incorrectas o error de conexión');
      }
    });
  }
}