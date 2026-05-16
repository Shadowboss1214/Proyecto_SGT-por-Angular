import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
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
              alert('Usuario no encontrado en la base de datos de empleados');
            }
          },
          error: () => alert('Error al verificar el rol del usuario')
        });
      },
      error: () => alert('Usuario o contraseña incorrectos')
    });
  }
}
