import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

/**
 * Service responsible for fetching and caching logistics metrics from the API.
 * Implements a simple in-memory cache to avoid redundant HTTP requests
 * within the same session.
 */

@Injectable({ providedIn: 'root' })
export class LogisticsService {

 /** Base URL for the logistics metrics endpoint */
  private apiUrl = `${environment.apiUrl}/trips`;

  /**
   * In-memory cache for the last fetched metrics response.
   * Set to `null` when the cache is invalidated or not yet populated.
   */
  private cache: any = null;

   /**
   * @param http        - Angular HTTP client used to fetch metrics from the API
   * @param authService - Service used to retrieve the Bearer token for authorization
   */
  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Builds the HTTP headers required for authorized API requests.
   * Attaches the Bearer token retrieved from `AuthService`.
   *
   * @returns `HttpHeaders` object with `Authorization` and `Content-Type` set
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Retrieves logistics metrics from the API or from the in-memory cache.
   * If a cached response exists, returns it immediately without making an HTTP request.
   * Otherwise, fetches from the API and stores the result in the cache.
   *
   * @returns Observable emitting the logistics metrics object
   */
  getMetrics(): Observable<any> {
    if (this.cache) return of(this.cache);
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap(data => this.cache = data)
    );
  }

  /**
   * Clears the in-memory cache, forcing the next call to `getMetrics()`
   * to fetch fresh data from the API.
   * Should be called after any operation that modifies the underlying data
   * (e.g. creating, updating, or deleting trips).
   */
  invalidate(): void {
    this.cache = null;
  }
}
