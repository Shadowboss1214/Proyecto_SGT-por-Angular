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
        console.log('Token obtenido con éxito');

        // Consultamos el rol dinámicamente
        this.authService.getEmployeeByUsername(this.username, response.access_token).subscribe({
          next: (data: any) => {
            const employees = data._embedded?.employees;

            if (employees && employees.length > 0) {
              const currentEmployee = employees.find((e: any) => e.username === this.username);

              if (currentEmployee) {
                console.log('Rol detectado:', currentEmployee.role);
                localStorage.setItem('role', currentEmployee.role);

                if (currentEmployee.role === 'ADMIN') {
                  this.router.navigate(['/app/admin/dashboard']);
                } else {
                  this.router.navigate(['/app/driver/dashboard']);
                }
              } else {
                alert('Usuario no encontrado en la base de datos de empleados');
              }
            } else {
              alert('No se pudieron recuperar los datos del perfil');
            }
          },
          error: (err: any) => {
            console.error('Error al obtener datos del empleado:', err);
            alert('Error al verificar el rol del usuario');
          }
        });
      },
      error: (error: any) => {
        console.error('Error en el login:', error);
        alert('Usuario o contraseña incorrectos');
      }
    });
  }
}