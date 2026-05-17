import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class LogisticsService {

  private apiUrl = 'http://localhost:8080/logistics';
  private cache: any = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getMetrics(): Observable<any> {
    if (this.cache) return of(this.cache);
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap(data => this.cache = data)
    );
  }

  invalidate(): void {
    this.cache = null;
  }
}
