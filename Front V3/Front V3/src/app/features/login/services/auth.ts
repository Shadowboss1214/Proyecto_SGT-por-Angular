import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, TokenResponse } from '../models/login';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/oauth';

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<TokenResponse> {

    const body = new URLSearchParams();

    body.set('grant_type', 'password');
    body.set('username', data.username);
    body.set('password', data.password);
    body.set('client_id', 'angular_app');

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic Y2xpZW50OnNlY3JldA=='
    });

    return this.http.post<TokenResponse>(
      this.apiUrl,
      body.toString(),
      { headers }
    );
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
  getTokenPayload(): any {
    const token = this.getToken();
    if (!token) return null;

    const payload = token.split('.')[1];         
    const decoded = atob(payload);               
    return JSON.parse(decoded);
  }

  getEmployeeId(): string {
    return this.getTokenPayload()?.employeeId;   
  }

  getRole(): string {
    return this.getTokenPayload()?.role;
  }
}