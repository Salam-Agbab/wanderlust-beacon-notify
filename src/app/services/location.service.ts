
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface LocationData {
  id: string;
  deviceId: string;
  deviceName: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  timestamp: Date;
  batteryLevel: number;
}

export interface Device {
  id: string;
  name: string;
  type: 'phone' | 'tablet' | 'watch';
  owner: string;
  icon: string;
  color: string;
  lastSeen?: Date;
  batteryLevel?: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private locationsSubject = new BehaviorSubject<LocationData[]>([]);
  private devicesSubject = new BehaviorSubject<Device[]>([]);
  
  locations$ = this.locationsSubject.asObservable();
  devices$ = this.devicesSubject.asObservable();
  
  private watchId: number | null = null;
  private mockDevices: Device[] = [
    {
      id: '1',
      name: 'My iPhone',
      type: 'phone',
      owner: 'Me',
      icon: 'phone',
      color: '#4ECDC4',
      lastSeen: new Date(),
      batteryLevel: 85,
      isActive: true
    },
    {
      id: '2',
      name: 'Dad\'s Phone',
      type: 'phone',
      owner: 'Dad',
      icon: 'phone',
      color: '#FF8A47',
      lastSeen: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
      batteryLevel: 42,
      isActive: true
    },
    {
      id: '3',
      name: 'Mom\'s Phone',
      type: 'phone',
      owner: 'Mom',
      icon: 'phone',
      color: '#A76EC9',
      lastSeen: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
      batteryLevel: 78,
      isActive: true
    }
  ];
  
  private mockLocations: LocationData[] = [];
  
  constructor() {
    // Initialize with mock data
    this.devicesSubject.next(this.mockDevices);
    
    // Create initial mock locations
    this.mockDevices.forEach(device => {
      // Generate location within reasonable bounds
      const baseLat = 40.7128; // NYC latitude as base
      const baseLng = -74.0060; // NYC longitude as base
      
      // Add some randomness to create different locations for each device
      const randomLat = baseLat + (Math.random() - 0.5) * 0.1;
      const randomLng = baseLng + (Math.random() - 0.5) * 0.1;
      
      this.mockLocations.push({
        id: `loc_${device.id}`,
        deviceId: device.id,
        deviceName: device.name,
        latitude: randomLat,
        longitude: randomLng,
        accuracy: Math.floor(Math.random() * 50) + 5, // 5-55 meters accuracy
        speed: Math.random() > 0.3 ? Math.floor(Math.random() * 100) : null, // null for some devices
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000)), // Within last hour
        batteryLevel: device.batteryLevel || 100
      });
    });
    
    this.locationsSubject.next(this.mockLocations);
  }
  
  startTracking(): void {
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => this.handlePositionUpdate(position),
        (error) => console.error('Geolocation error:', error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }
  
  stopTracking(): void {
    if (this.watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
  
  private handlePositionUpdate(position: GeolocationPosition): void {
    // Update "My iPhone" location with real location
    const currentLocations = this.locationsSubject.value;
    const myPhoneIndex = currentLocations.findIndex(loc => loc.deviceId === '1');
    
    if (myPhoneIndex !== -1) {
      const updatedLocations = [...currentLocations];
      updatedLocations[myPhoneIndex] = {
        ...updatedLocations[myPhoneIndex],
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed,
        timestamp: new Date(),
        batteryLevel: this.mockLocations[myPhoneIndex].batteryLevel // Keep the mock battery level
      };
      
      this.locationsSubject.next(updatedLocations);
      
      // Also update device lastSeen
      const devices = this.devicesSubject.value;
      const myDeviceIndex = devices.findIndex(device => device.id === '1');
      if (myDeviceIndex !== -1) {
        const updatedDevices = [...devices];
        updatedDevices[myDeviceIndex] = {
          ...updatedDevices[myDeviceIndex],
          lastSeen: new Date()
        };
        this.devicesSubject.next(updatedDevices);
      }
    }
  }
  
  getDevices(): Observable<Device[]> {
    return this.devices$;
  }
  
  getLocations(): Observable<LocationData[]> {
    return this.locations$;
  }
  
  getDeviceById(id: string): Observable<Device | undefined> {
    return of(this.devicesSubject.value.find(device => device.id === id))
      .pipe(delay(500)); // Simulate network delay
  }
  
  updateDevice(device: Device): Observable<Device> {
    const devices = this.devicesSubject.value;
    const index = devices.findIndex(d => d.id === device.id);
    
    if (index !== -1) {
      const updatedDevices = [...devices];
      updatedDevices[index] = device;
      this.devicesSubject.next(updatedDevices);
      return of(device).pipe(delay(800)); // Simulate network delay
    }
    
    throw new Error('Device not found');
  }
  
  addDevice(device: Omit<Device, 'id'>): Observable<Device> {
    const newDevice: Device = {
      ...device,
      id: Math.random().toString(36).substr(2, 9),
      lastSeen: new Date(),
      isActive: true
    };
    
    const devices = [...this.devicesSubject.value, newDevice];
    this.devicesSubject.next(devices);
    
    // Add a mock location for this device
    const baseLat = 40.7128; // NYC latitude as base
    const baseLng = -74.0060; // NYC longitude as base
    const randomLat = baseLat + (Math.random() - 0.5) * 0.1;
    const randomLng = baseLng + (Math.random() - 0.5) * 0.1;
    
    const newLocation: LocationData = {
      id: `loc_${newDevice.id}`,
      deviceId: newDevice.id,
      deviceName: newDevice.name,
      latitude: randomLat,
      longitude: randomLng,
      accuracy: Math.floor(Math.random() * 50) + 5,
      speed: Math.random() > 0.3 ? Math.floor(Math.random() * 100) : null,
      timestamp: new Date(),
      batteryLevel: newDevice.batteryLevel || 100
    };
    
    const locations = [...this.locationsSubject.value, newLocation];
    this.locationsSubject.next(locations);
    
    return of(newDevice).pipe(delay(1000)); // Simulate network delay
  }
  
  removeDevice(id: string): Observable<boolean> {
    const devices = this.devicesSubject.value.filter(device => device.id !== id);
    this.devicesSubject.next(devices);
    
    const locations = this.locationsSubject.value.filter(loc => loc.deviceId !== id);
    this.locationsSubject.next(locations);
    
    return of(true).pipe(delay(1000)); // Simulate network delay
  }
  
  // Simulate movement for demo purposes
  simulateMovement(): void {
    setInterval(() => {
      const locations = this.locationsSubject.value;
      const updatedLocations = locations.map(loc => {
        // Skip updating if this is "My iPhone" when real tracking is active
        if (loc.deviceId === '1' && this.watchId !== null) {
          return loc;
        }
        
        // Small random movement
        const latChange = (Math.random() - 0.5) * 0.001;
        const lngChange = (Math.random() - 0.5) * 0.001;
        
        return {
          ...loc,
          latitude: loc.latitude + latChange,
          longitude: loc.longitude + lngChange,
          timestamp: new Date(),
          speed: Math.floor(Math.random() * 50), // 0-50 km/h
          batteryLevel: Math.max(0, loc.batteryLevel - Math.random() * 0.2) // Slowly decrease battery
        };
      });
      
      this.locationsSubject.next(updatedLocations);
      
      // Also update device lastSeen
      const devices = this.devicesSubject.value;
      const updatedDevices = devices.map(device => ({
        ...device,
        lastSeen: new Date(),
        batteryLevel: updatedLocations.find(loc => loc.deviceId === device.id)?.batteryLevel || device.batteryLevel
      }));
      
      this.devicesSubject.next(updatedDevices);
    }, 5000); // Update every 5 seconds
  }
}
