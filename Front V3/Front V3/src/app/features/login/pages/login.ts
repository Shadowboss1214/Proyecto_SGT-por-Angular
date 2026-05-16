import { Component } from '@angular/core';
import { AuthService } from '../services/auth';
import { FormsModule } from '@angular/forms';
import { NavigationService } from '../../../core/services/nav.service';

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
    private router: NavigationService
  ) {}

  login() {
    if (!this.username || !this.password) {
      alert('Por favor, llena todos los campos');
      return;
    }

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (response: any) => {
        this.authService.saveToken(response.access_token);
        if (response.refresh_token) {
          this.authService.saveRefreshToken(response.refresh_token);
        }

        const role = this.authService.getRole();
        if (role === 'admin') {
          this.router.navigate(['/app/admin/dashboard']);
        } else {
          this.router.navigate(['/app/driver/dashboard']);
        }
      },
      error: (error: any) => {
        console.error('Error en el login:', error);
        alert('Usuario o contraseña incorrectos');
      }
    });
  }
}
