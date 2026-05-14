import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, TokenResponse } from '../../features/login/models/login';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/oauth';
  private employeesUrl = 'http://localhost:8080/employees';

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<TokenResponse> {
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('username', data.username);
    body.set('password', data.password);
    body.set('client_id', 'angular_app');

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<TokenResponse>(this.apiUrl, body.toString(), { headers });
  }

  /**
   * Obtiene datos del empleado desde la API de Laminas
   */
  getEmployeeByUsername(username: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
    return this.http.get<any>(`${this.employeesUrl}?username=${username}`, { headers });
  }

  saveToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * FUNCIONES RECUPERADAS PARA TRIPS-LIST
   */
  getTokenPayload(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  }

  getEmployeeId(): string {
    return this.getTokenPayload()?.employeeId || '';
  }
}