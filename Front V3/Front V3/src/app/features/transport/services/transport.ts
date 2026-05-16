import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Transport } from '../models/transport';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransportService {

  private data: Transport[] = [];
  private apiUrl = 'http://localhost:8080/transport';

  private dataSubject = new BehaviorSubject<Transport[]>(this.data);
  data$: Observable<Transport[]> = this.dataSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAll(): Observable<Transport[]> {
    return this.data$;
  }

  getById(id: number): Transport | undefined {
    return this.data.find(t => t.id_transport === id);
  }

  // ✅ CREATE: no envía id_transport, Supabase lo genera con nextval()
  create(data: Transport): Observable<any> {
    const { id_transport, ...payload } = data;
    return this.http.post<any>(this.apiUrl, payload, { headers: this.getHeaders() }).pipe(
      tap(() => { this.invalidate(); this.getLatestTransports().subscribe(); })
    );
  }

  update(id: number, transportData: Transport): Observable<any> {
    const { id_transport, ...payload } = transportData;
    return this.http.patch<any>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() }).pipe(
      tap(() => { this.invalidate(); this.getLatestTransports().subscribe(); })
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap(() => { this.invalidate(); this.getLatestTransports().subscribe();  })
    );
  }

  private refresh(): void {
    this.dataSubject.next([...this.data]);
  }

  getLatestTransports(): Observable<Transport[]> {
    if (this.data.length > 0) return of(this.data);
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(response => {
        const list = response._embedded?.transport || [];
        this.data = list;
        this.refresh();
        return [...list];
      })
    );
  }

  private invalidate(): void {
    this.data = [];
  }
}