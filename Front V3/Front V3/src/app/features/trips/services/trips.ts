import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Trip } from '../models/trips';

@Injectable({ providedIn: 'root' })
export class TripService {

  // Array vacío para iniciar desde cero
  private data: Trip[] = [];

  private subject = new BehaviorSubject<Trip[]>(this.data);
  data$: Observable<Trip[]> = this.subject.asObservable();

  getAll(): Observable<Trip[]> {
    return this.data$;
  }

  // Cambiado a id_trip y tipo number
  getById(id: number): Trip | undefined {
    return this.data.find(t => t.id_trip === id);
  }

  create(tripData: Trip): void {
    const newTrip: Trip = { 
      ...tripData, 
      // Generamos un ID numérico temporal para simular el SERIAL de la DB
      id_trip: Math.floor(Date.now() / 1000) 
    };
    
    this.data.push(newTrip);
    this.refresh();
  }

  // Cambiado a id_trip y tipo number
  update(id: number, tripData: Trip): void {
    const index = this.data.findIndex(t => t.id_trip === id);

    if (index !== -1) {
      // Mantenemos el id_trip original
      this.data[index] = { ...tripData, id_trip: id };
      this.refresh();
    }
  }

  // Cambiado a id_trip y tipo number
  delete(id: number): void {
    this.data = this.data.filter(t => t.id_trip !== id);
    this.refresh();
  }

  private refresh(): void {
    this.subject.next([...this.data]);
  }
}