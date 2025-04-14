
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LocationService, LocationData } from './location.service';
import { GeofenceService, Geofence } from './geofence.service';

export interface Notification {
  id: string;
  type: 'geofence_enter' | 'geofence_exit' | 'low_battery' | 'speed_alert' | 'system' | 'device_offline';
  title: string;
  message: string;
  deviceId?: string;
  deviceName?: string;
  timestamp: Date;
  read: boolean;
  geofenceId?: string;
  icon: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();

  private mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'geofence_enter',
      title: 'Mom\'s Phone entered Home',
      message: 'Mom\'s Phone has entered the geofence "Home" at 5:30 PM',
      deviceId: '3',
      deviceName: 'Mom\'s Phone',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      geofenceId: 'home',
      icon: 'home',
      color: '#4ECDC4'
    },
    {
      id: '2',
      type: 'low_battery',
      title: 'Dad\'s Phone battery is low',
      message: 'Dad\'s Phone battery is at 15%. Charging needed soon.',
      deviceId: '2',
      deviceName: 'Dad\'s Phone',
      timestamp: new Date(Date.now() - 75 * 60 * 1000), // 75 minutes ago
      read: true,
      icon: 'battery-low',
      color: '#FF8A47'
    },
    {
      id: '3',
      type: 'speed_alert',
      title: 'My iPhone exceeded speed limit',
      message: 'My iPhone was detected moving at 82 mph in a 65 mph zone',
      deviceId: '1',
      deviceName: 'My iPhone',
      timestamp: new Date(Date.now() - 120 * 60 * 1000), // 2 hours ago
      read: true,
      icon: 'speed',
      color: '#FF6B6B'
    },
    {
      id: '4',
      type: 'system',
      title: 'Premium Subscription Activated',
      message: 'Your premium subscription has been activated. Enjoy all features!',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      icon: 'crown',
      color: '#FFD700'
    }
  ];

  constructor(
    private locationService: LocationService,
    private geofenceService: GeofenceService
  ) {
    // Initialize with mock data
    this.notificationsSubject.next(this.mockNotifications);
    this.updateUnreadCount();
    
    // Subscribe to location updates to check for geofence events
    this.locationService.locations$.subscribe(locations => {
      this.checkGeofenceEvents(locations);
      this.checkBatteryLevels(locations);
    });
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }

  markAsRead(id: string): Observable<boolean> {
    const notifications = this.notificationsSubject.value;
    const index = notifications.findIndex(n => n.id === id);
    
    if (index !== -1) {
      const updatedNotifications = [...notifications];
      updatedNotifications[index] = {
        ...updatedNotifications[index],
        read: true
      };
      
      this.notificationsSubject.next(updatedNotifications);
      this.updateUnreadCount();
      return of(true).pipe(delay(500)); // Simulate network delay
    }
    
    return of(false);
  }

  markAllAsRead(): Observable<boolean> {
    const notifications = this.notificationsSubject.value;
    const updatedNotifications = notifications.map(n => ({
      ...n,
      read: true
    }));
    
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
    return of(true).pipe(delay(800)); // Simulate network delay
  }

  deleteNotification(id: string): Observable<boolean> {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== id);
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
    return of(true).pipe(delay(500)); // Simulate network delay
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  private checkGeofenceEvents(locations: LocationData[]): void {
    const geofences = this.geofenceService.getGeofencesValue();
    
    locations.forEach(location => {
      geofences.forEach(geofence => {
        const isInside = this.isPointInGeofence(
          { lat: location.latitude, lng: location.longitude },
          geofence
        );
        
        // Check if we need to create a geofence entry notification
        const lastLocation = this.getPreviousLocationForDevice(location.deviceId);
        if (lastLocation) {
          const wasInside = this.isPointInGeofence(
            { lat: lastLocation.latitude, lng: lastLocation.longitude },
            geofence
          );
          
          if (isInside && !wasInside) {
            this.addNotification({
              type: 'geofence_enter',
              title: `${location.deviceName} entered ${geofence.name}`,
              message: `${location.deviceName} has entered the geofence "${geofence.name}" at ${new Date().toLocaleTimeString()}`,
              deviceId: location.deviceId,
              deviceName: location.deviceName,
              geofenceId: geofence.id,
              icon: 'map-marker',
              color: geofence.color
            });
          } else if (!isInside && wasInside) {
            this.addNotification({
              type: 'geofence_exit',
              title: `${location.deviceName} left ${geofence.name}`,
              message: `${location.deviceName} has left the geofence "${geofence.name}" at ${new Date().toLocaleTimeString()}`,
              deviceId: location.deviceId,
              deviceName: location.deviceName,
              geofenceId: geofence.id,
              icon: 'map-marker',
              color: geofence.color
            });
          }
        }
      });
    });
  }

  private checkBatteryLevels(locations: LocationData[]): void {
    locations.forEach(location => {
      if (location.batteryLevel <= 20) {
        // Check if we already have a recent low battery notification for this device
        const recentNotifications = this.notificationsSubject.value.filter(n => 
          n.deviceId === location.deviceId && 
          n.type === 'low_battery' && 
          n.timestamp > new Date(Date.now() - 3600000) // Within the last hour
        );
        
        if (recentNotifications.length === 0) {
          this.addNotification({
            type: 'low_battery',
            title: `${location.deviceName} battery is low`,
            message: `${location.deviceName} battery is at ${location.batteryLevel}%. Charging needed soon.`,
            deviceId: location.deviceId,
            deviceName: location.deviceName,
            icon: 'battery-low',
            color: '#FF8A47'
          });
        }
      }
    });
  }

  private getPreviousLocationForDevice(deviceId: string): LocationData | null {
    // This would typically come from a database or cache of previous locations
    // For demo purposes, we'll just return the current location
    return this.locationService.locations$.value.find(loc => loc.deviceId === deviceId) || null;
  }

  private isPointInGeofence(point: { lat: number, lng: number }, geofence: Geofence): boolean {
    // Calculate distance between point and geofence center using Haversine formula
    const R = 6371e3; // Earth radius in meters
    const φ1 = point.lat * Math.PI / 180;
    const φ2 = geofence.latitude * Math.PI / 180;
    const Δφ = (geofence.latitude - point.lat) * Math.PI / 180;
    const Δλ = (geofence.longitude - point.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance <= geofence.radius;
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    const notifications = [newNotification, ...this.notificationsSubject.value];
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
    
    // In a real app, this would also trigger a push notification
    this.showBrowserNotification(newNotification);
  }

  private showBrowserNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/assets/icons/notification.png'
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/assets/icons/notification.png'
          });
        }
      });
    }
  }
}
