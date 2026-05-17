import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, TokenResponse } from '../models/login'; 

/**
 * Service responsible for authentication and session management.
 * Handles OAuth2 login, token storage, JWT decoding, and employee lookup.
 */

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/oauth';
  private employeesUrl = 'http://localhost:8080/employees';


  /**
   * @param http - Angular HTTP client used to communicate with the backend API
   */

  constructor(private http: HttpClient) {}

  /**
   * Authenticates the user against the OAuth2 endpoint using the password grant type.
   * Sends credentials as `application/x-www-form-urlencoded` as required by the OAuth2 spec.
   *
   * @param data - Object containing the user's `username` and `password`
   * @returns Observable that emits a `TokenResponse` with the access and refresh tokens
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
   * Retrieves an employee record from the API filtered by username.
   * Used after login to resolve the employee's role and ID.
   *
   * @param username - Username to search for in the employees endpoint
   * @param token    - Valid Bearer token to authorize the request
   * @returns Observable with the HAL+JSON response containing the matching employee
   */
  getEmployeeByUsername(username: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
    return this.http.get<any>(`${this.employeesUrl}?username=${username}`, { headers });
  }

  /**
   * Persists the OAuth2 access token in `localStorage`.
   *
   * @param token - Access token string received from the OAuth2 endpoint
   */
  saveToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  /**
   * Retrieves the stored access token from `localStorage`.
   *
   * @returns The access token string, or `null` if not found
   */
  getToken() {
    return localStorage.getItem('access_token');
  }

 /**
   * Decodes the JWT payload from the stored access token.
   * Splits the token, base64-decodes the payload segment and parses it as JSON.
   *
   * @returns Parsed JWT payload object, or `null` if the token is missing or malformed
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
   * Reads the `employeeId` claim from the JWT payload.
   * This claim is a custom extension added by the Laminas backend, not part of standard OAuth2.
   * @returns The employee ID string, or empty string if the token is missing or lacks the claim.
   */
  getEmployeeId(): string {
    // Esto es lo que busca trips-list.ts
    return this.getTokenPayload()?.employeeId || '';
  }

  /** Removes the access token from `localStorage`, ending the browser session. */
  logout() {
    localStorage.removeItem('access_token');
  }
}