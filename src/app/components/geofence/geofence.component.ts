
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Geofence } from '../../services/geofence.service';
import { Device } from '../../services/location.service';

@Component({
  selector: 'app-geofence',
  templateUrl: './geofence.component.html',
  styleUrls: ['./geofence.component.scss']
})
export class GeofenceComponent {
  @Input() geofence!: Geofence;
  @Input() devices: Device[] = [];
  @Output() edit = new EventEmitter<Geofence>();
  @Output() delete = new EventEmitter<string>();

  isExpanded = false;

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  toggleNotifications(): void {
    this.edit.emit({
      ...this.geofence,
      notifications: !this.geofence.notifications
    });
  }

  getDeviceName(deviceId: string): string {
    const device = this.devices.find(d => d.id === deviceId);
    return device ? device.name : 'Unknown device';
  }

  getDeviceCount(): string {
    const count = this.geofence.devices.length;
    return count === 0 ? 'No devices' : 
           count === 1 ? '1 device' : 
           `${count} devices`;
  }

  getTypeIcon(): string {
    switch(this.geofence.type) {
      case 'home': return 'home';
      case 'work': return 'briefcase';
      case 'school': return 'academic-cap';
      default: return 'location-marker';
    }
  }
}
