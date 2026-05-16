import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, TokenResponse } from '../../features/login/models/login';

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

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post<TokenResponse>(this.apiUrl, body.toString(), { headers });
  }

  saveToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  saveRefreshToken(token: string) {
    localStorage.setItem('refresh_token', token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  refreshToken(): Observable<any> {
    const token = this.getRefreshToken();
    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', token!);
    body.set('client_id', 'angular_app');

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post<any>(this.apiUrl, body.toString(), { headers }).pipe(
      tap(response => {
        this.saveToken(response.access_token);
        if (response.refresh_token) {
          this.saveRefreshToken(response.refresh_token);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  getTokenPayload(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const exp = this.getTokenPayload()?.exp;
    if (!exp) return false;
    return Date.now() / 1000 > exp;
  }

  getRole(): string {
    return (this.getTokenPayload()?.role ?? '').toLowerCase();
  }

  getEmployeeId(): string {
    return String(this.getTokenPayload()?.employeeId ?? '');
  }
}
