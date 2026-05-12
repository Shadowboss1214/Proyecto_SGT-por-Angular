import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  // URL de tu backend en Laminas
  private readonly API_URL = 'http://localhost:8080/oauth';

  /**
   * Realiza la petición de autenticación OAuth2
   */
  login(username: string, password: string) {
    // Formateamos el cuerpo como x-www-form-urlencoded
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('client_id', 'angular_app'); // Debe coincidir con tu tabla oauth_clients en Supabase
    body.set('username', username);
    body.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    });

    return this.http.post<any>(this.API_URL, body.toString(), { headers }).pipe(
      tap(res => {
        // Guardamos automáticamente al tener éxito
        if (res && res.access_token) {
          this.saveToken(res.access_token);
          this.saveRefreshToken(res.refresh_token);
        }
      })
    );
  }

  /**
   * Métodos de gestión de tokens
   */
  saveToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  private saveRefreshToken(token: string) {
    localStorage.setItem('refresh_token', token);
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  /**
   * Limpia la sesión
   */
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}