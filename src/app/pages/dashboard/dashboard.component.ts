
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocationService, LocationData, Device } from '../../services/location.service';
import { GeofenceService, Geofence } from '../../services/geofence.service';
import { NotificationService, Notification } from '../../services/notification.service';
import { AuthService, User } from '../../services/auth.service';
import { PaymentService, SubscriptionPlan } from '../../services/payment.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: User | null = null;
  devices: Device[] = [];
  locations: LocationData[] = [];
  geofences: Geofence[] = [];
  notifications: Notification[] = [];
  currentPlan: SubscriptionPlan | null = null;
  
  selectedDeviceId: string | null = null;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private locationService: LocationService,
    private geofenceService: GeofenceService,
    private notificationService: NotificationService,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    // Start tracking the user's device
    this.locationService.startTracking();
    
    // Start simulating movement for other devices
    this.locationService.simulateMovement();
    
    // Subscribe to user info
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.user = user;
      })
    );
    
    // Subscribe to devices
    this.subscriptions.push(
      this.locationService.devices$.subscribe(devices => {
        this.devices = devices;
        
        // Auto-select first device if none selected
        if (this.devices.length > 0 && !this.selectedDeviceId) {
          this.selectedDeviceId = this.devices[0].id;
        }
      })
    );
    
    // Subscribe to locations
    this.subscriptions.push(
      this.locationService.locations$.subscribe(locations => {
        this.locations = locations;
      })
    );
    
    // Subscribe to geofences
    this.subscriptions.push(
      this.geofenceService.geofences$.subscribe(geofences => {
        this.geofences = geofences;
      })
    );
    
    // Subscribe to notifications
    this.subscriptions.push(
      this.notificationService.notifications$.subscribe(notifications => {
        // Get 3 most recent notifications
        this.notifications = notifications.slice(0, 3);
      })
    );
    
    // Subscribe to current plan
    this.subscriptions.push(
      this.paymentService.currentPlan$.subscribe(plan => {
        this.currentPlan = plan;
      })
    );
  }

  ngOnDestroy(): void {
    // Stop tracking when component is destroyed
    this.locationService.stopTracking();
    
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  selectDevice(deviceId: string): void {
    this.selectedDeviceId = deviceId;
  }

  getDeviceLocation(deviceId: string): LocationData | undefined {
    return this.locations.find(loc => loc.deviceId === deviceId);
  }

  getDeviceBatteryClass(batteryLevel: number): string {
    if (batteryLevel <= 20) return 'text-red-500';
    if (batteryLevel <= 50) return 'text-orange-500';
    return 'text-green-500';
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  }

  viewAllDevices(): void {
    this.router.navigate(['/devices']);
  }

  viewAllNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  upgradePlan(): void {
    this.router.navigate(['/subscription']);
  }
}
