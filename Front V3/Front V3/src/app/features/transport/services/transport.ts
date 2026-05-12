import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Transport } from '../models/transport';

@Injectable({
  providedIn: 'root'
})
export class TransportService {

  private data: Transport[] = [];

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
}