import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, TokenResponse } from '../../features/login/models/login';

/**
 * Central authentication service: manages the full OAuth2 Password Grant flow,
 * token persistence, and JWT payload decoding.
 *
 * Single source of truth for authentication state in the SPA. Guards, interceptors,
 * and components that need to know whether the user is authenticated must go through
 * this service and never read localStorage directly.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/oauth';
  private employeesUrl = 'http://localhost:8080/employees';

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

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<TokenResponse>(this.apiUrl, body.toString(), { headers });
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
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
    return this.http.get<any>(`${this.employeesUrl}?username=${username}`, { headers });
  }

  /**
   * Persists the JWT in localStorage so it survives page reloads.
   * Postcondition: subsequent calls to getToken() return this value until logout() is called.
   * @param token - The raw JWT string from the OAuth2 response.
   */
  saveToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  /**
   * Retrieves the stored JWT.
   * @returns The token string, or null if the user is not authenticated or has logged out.
   */
  getToken() {
    return localStorage.getItem('access_token');
  }

  /**
   * Clears all OAuth2 tokens from localStorage, ending the session.
   * Postcondition: authGuard will redirect any subsequent protected route attempt to /app/login.
   */
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Decodes the JWT payload without verifying the signature (server-side validation
   * happens on every API call via the oauth2postgres adapter).
   * Uses atob() for base64 decoding; returns null on any malformed input to avoid
   * crashing guards or interceptors when the token is corrupted.
   * @returns Parsed payload object, or null if the token is absent or malformed.
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

  /**
   * Convenience accessor for the employee ID embedded in the JWT payload.
   * @returns The `employeeId` claim as a string, or an empty string if unavailable.
   */
  getEmployeeId(): string {
    return this.getTokenPayload()?.employeeId || '';
  }
}
