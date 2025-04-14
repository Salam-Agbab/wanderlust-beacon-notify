
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  color: string;
  address?: string;
  type: 'home' | 'work' | 'school' | 'custom';
  notifications: boolean;
  devices: string[]; // Device IDs to monitor
}

@Injectable({
  providedIn: 'root'
})
export class GeofenceService {
  private geofencesSubject = new BehaviorSubject<Geofence[]>([]);
  geofences$ = this.geofencesSubject.asObservable();

  private mockGeofences: Geofence[] = [
    {
      id: 'home',
      name: 'Home',
      latitude: 40.7128,
      longitude: -74.006,
      radius: 100,
      color: '#4ECDC4',
      address: '123 Main St, New York, NY',
      type: 'home',
      notifications: true,
      devices: ['1', '2', '3']
    },
    {
      id: 'work',
      name: 'Work',
      latitude: 40.7127,
      longitude: -73.9974,
      radius: 150,
      color: '#FF8A47',
      address: '456 Business Ave, New York, NY',
      type: 'work',
      notifications: true,
      devices: ['1']
    },
    {
      id: 'school',
      name: 'School',
      latitude: 40.7201,
      longitude: -74.0048,
      radius: 200,
      color: '#A76EC9',
      address: '789 Education Blvd, New York, NY',
      type: 'school',
      notifications: true,
      devices: ['2', '3']
    }
  ];

  constructor() {
    // Initialize with mock data
    this.geofencesSubject.next(this.mockGeofences);
  }

  getGeofences(): Observable<Geofence[]> {
    return this.geofences$;
  }

  getGeofencesValue(): Geofence[] {
    return this.geofencesSubject.value;
  }

  getGeofenceById(id: string): Observable<Geofence | undefined> {
    return of(this.geofencesSubject.value.find(g => g.id === id))
      .pipe(delay(500)); // Simulate network delay
  }

  addGeofence(geofence: Omit<Geofence, 'id'>): Observable<Geofence> {
    const newGeofence: Geofence = {
      ...geofence,
      id: Math.random().toString(36).substr(2, 9)
    };

    const geofences = [...this.geofencesSubject.value, newGeofence];
    this.geofencesSubject.next(geofences);
    
    return of(newGeofence).pipe(delay(1000)); // Simulate network delay
  }

  updateGeofence(geofence: Geofence): Observable<Geofence> {
    const geofences = this.geofencesSubject.value;
    const index = geofences.findIndex(g => g.id === geofence.id);
    
    if (index !== -1) {
      const updatedGeofences = [...geofences];
      updatedGeofences[index] = geofence;
      this.geofencesSubject.next(updatedGeofences);
      return of(geofence).pipe(delay(800)); // Simulate network delay
    }
    
    throw new Error('Geofence not found');
  }

  deleteGeofence(id: string): Observable<boolean> {
    const geofences = this.geofencesSubject.value.filter(g => g.id !== id);
    this.geofencesSubject.next(geofences);
    return of(true).pipe(delay(1000)); // Simulate network delay
  }
}
