import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, TokenResponse } from '../../features/login/models/login';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl      = `${environment.apiUrl}/oauth`;
  private employeeUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<TokenResponse> {
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('username', data.username);
    body.set('password', data.password);
    body.set('client_id', 'angular_app');
    return this.http.post<TokenResponse>(this.apiUrl, body.toString(), {
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    });
  }

  getEmployeeByUsername(username: string, token: string): Observable<any> {
    return this.http.get<any>(`${this.employeeUrl}?username=${username}`, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' })
    });
  }

  getEmployeeById(id: number, token: string): Observable<any> {
    return this.http.get<any>(`${this.employeeUrl}/${id}`, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' })
    });
  }

  // ── Token storage ────────────────────────────────────────────
  saveToken(token: string)        { localStorage.setItem('access_token', token); }
  getToken(): string | null       { return localStorage.getItem('access_token'); }

  saveRefreshToken(token: string) { localStorage.setItem('refresh_token', token); }
  getRefreshToken(): string | null{ return localStorage.getItem('refresh_token'); }

  saveRole(role: string)          { localStorage.setItem('role', role); }
  saveEmployeeId(id: number)      { localStorage.setItem('employee_id', String(id)); }

  // ── JWT helpers ───────────────────────────────────────────────
  getTokenPayload(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
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
    const fromJwt = this.getTokenPayload()?.role;
    if (fromJwt) return fromJwt.toLowerCase();
    return (localStorage.getItem('role') ?? '').toLowerCase();
  }

  getEmployeeId(): string {
    const fromJwt = this.getTokenPayload()?.employeeId;
    if (fromJwt) return String(fromJwt);
    return localStorage.getItem('employee_id') ?? '';
  }

  // ── Refresh token ─────────────────────────────────────────────
  refreshToken(): Observable<any> {
    const token = this.getRefreshToken();
    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', token!);
    body.set('client_id', 'angular_app');
    return this.http.post<any>(this.apiUrl, body.toString(), {
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    }).pipe(
      tap(response => {
        this.saveToken(response.access_token);
        if (response.refresh_token) this.saveRefreshToken(response.refresh_token);
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    localStorage.removeItem('employee_id');
  }
}