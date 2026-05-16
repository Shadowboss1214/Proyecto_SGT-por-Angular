import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Transport } from '../models/transport';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransportService {

  private data: Transport[] = [];
  private apiUrl = 'http://localhost:8080/transport';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
  }

  private dataSubject = new BehaviorSubject<Transport[]>(this.data);
  data$: Observable<Transport[]> = this.dataSubject.asObservable();

  getAll(): Observable<Transport[]> {
    return this.data$;
  }

  // Cambiado a id_transport y tipo number
  getById(id: number): Transport | undefined {
    return this.data.find(t => t.id_transport === id);
  }

  create(transportData: Transport): void {
    const newItem: Transport = {
      ...transportData,
      // Generamos un ID numérico temporal para simular el SERIAL
      id_transport: Math.floor(Date.now() / 1000)
    };

    this.data.push(newItem);
    this.refresh();
  }

  // Cambiado a id_transport y tipo number
  update(id: number, transportData: Transport): void {
    const index = this.data.findIndex(t => t.id_transport === id);

    if (index !== -1) {
      // Mantenemos el id_transport original y actualizamos los datos
      this.data[index] = { ...transportData, id_transport: id };
      this.refresh();
    }
  }

  // Cambiado a id_transport y tipo number
  delete(id: number): void {
    this.data = this.data.filter(t => t.id_transport !== id);
    this.refresh();
  }

  private refresh(): void {
    this.dataSubject.next([...this.data]);
  }

  getLatestTransports(): Observable<Transport[]> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(response => {
        // Accedemos a la estructura HAL JSON que te devolvió Postman
        const list = response._embedded?.transport || [];
        
        // Opcional: Como en el backend limitamos a 20 pero vienen por ID ascendente,
        // con .reverse() hacemos que los más nuevos aparezcan arriba en tu tabla.
        return [...list].reverse();
      })
    );
  }

}