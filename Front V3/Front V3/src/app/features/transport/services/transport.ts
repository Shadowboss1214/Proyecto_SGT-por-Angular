import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
  // Destrucutramos para excluir id_transport del objeto enviado
  const { id_transport, ...payload } = data;
  console.log('📦 Body enviado al backend:', JSON.stringify(payload));
  return this.http.post<any>(this.apiUrl, payload, { headers: this.getHeaders() }).pipe(
    tap(() => this.getLatestTransports().subscribe())
  );
}

  // ✅ UPDATE: ahora hace PUT real al backend en vez de solo modificar el arreglo local
  update(id: number, transportData: Transport): Observable<any> {

    const {    id_transport, ...payload } = transportData;
   
    return this.http.patch<any>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() }).pipe(
      tap(() => this.getLatestTransports().subscribe()) // refresca la lista tras actualizar
    );
  }

  // ✅ DELETE: ahora hace DELETE real al backend en vez de solo modificar el arreglo local
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap(() => this.getLatestTransports().subscribe()) // refresca la lista tras eliminar
    );
  }

  private refresh(): void {
    this.dataSubject.next([...this.data]);
  }

  getLatestTransports(): Observable<Transport[]> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(response => {
        const list = response._embedded?.transport || [];

        // Sincroniza el arreglo local con los datos frescos de la API
        this.data = list;
        this.refresh();

        return [...list].reverse();
      })
    );
  }
}