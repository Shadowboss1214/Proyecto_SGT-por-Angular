import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, TokenResponse } from '../../features/login/models/login';

/**
 * Central authentication service: manages the full OAuth2 Password Grant flow,
 * token persistence, and JWT payload decoding.
 *
 * Single source of truth for authentication state in the SPA. Guards, interceptors,
 * and components that need to know whether the user is authenticated must go through
 * this service and never read localStorage directly.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl      = 'http://localhost:8080/oauth';
  private employeeUrl = 'http://localhost:8080/employees';

  constructor(private http: HttpClient) {}

  /**
   * Initiates an OAuth2 Password Grant request against the Laminas backend.
   *
   * Precondition: the client_id 'angular_app' must be registered in the backend's
   * `oauth_clients` table. The body is encoded as `application/x-www-form-urlencoded`
   * because the OAuth2 spec requires it for the password grant type.
   * @param data - Username and plaintext password credentials.
   * @returns Observable that emits the token response once on success, then completes.
   */
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

  /**
   * Fetches the employee record matching the given username to determine the role.
   *
   * Called immediately after login so the role can be stored in localStorage before
   * the first navigation. A separate HTTP call is needed because the JWT payload does
   * not include the role directly.
   * @param username - The authenticated user's username.
   * @param token - The freshly obtained access token used to authorize the request.
   * @returns Observable emitting the HAL+JSON employee collection from the backend.
   */
  getEmployeeByUsername(username: string, token: string): Observable<any> {
    return this.http.get<any>(`${this.employeeUrl}?username=${username}`, {
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

  // ── JWT helpers (works when token is JWT; falls back to localStorage) ───
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

  // ── Refresh token ────────────────────────────────────────────
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

  /**
   * Clears all OAuth2 tokens from localStorage, ending the session.
   * Postcondition: authGuard will redirect any subsequent protected route attempt to /app/login.
   */
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    localStorage.removeItem('employee_id');
  }
}
