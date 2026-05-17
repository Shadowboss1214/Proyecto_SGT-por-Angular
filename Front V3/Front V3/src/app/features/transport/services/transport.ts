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
  private _currentPage = 1;
  private _totalPages = 1;

  get page() { return this._currentPage; }
  get total() { return this._totalPages; }


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

  getLatestTransports(page: number = 1): Observable<Transport[]> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}`, { headers: this.getHeaders() }).pipe(
      map(response => {
         console.log('page_count transport:', response.page_count);
        const list = response._embedded?.transport || [];
        this.data = list;
        this._currentPage = response.page || page;
        this._totalPages = response.page_count || 1;
        this.refresh();
        return [...list];
      })
    );
  }

  private invalidate(): void {
    this.data = [];
  }
}