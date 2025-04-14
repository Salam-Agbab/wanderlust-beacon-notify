
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Device } from '../../services/location.service';

@Component({
  selector: 'app-device-card',
  templateUrl: './device-card.component.html',
  styleUrls: ['./device-card.component.scss']
})
export class DeviceCardComponent {
  @Input() device!: Device;
  @Input() isSelected: boolean = false;
  @Output() select = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Device>();
  @Output() delete = new EventEmitter<string>();

  toggleActive(): void {
    this.edit.emit({
      ...this.device,
      isActive: !this.device.isActive
    });
  }

  getTimeAgo(date?: Date): string {
    if (!date) return 'Never';
    
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
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  }

  getBatteryClass(batteryLevel?: number): string {
    if (!batteryLevel) return 'text-gray-400';
    if (batteryLevel <= 20) return 'text-red-500';
    if (batteryLevel <= 50) return 'text-orange-500';
    return 'text-green-500';
  }

  getBatteryIcon(batteryLevel?: number): string {
    if (!batteryLevel) return 'battery-unknown';
    if (batteryLevel <= 10) return 'battery-alert';
    if (batteryLevel <= 30) return 'battery-low';
    if (batteryLevel <= 60) return 'battery-medium';
    if (batteryLevel <= 90) return 'battery-high';
    return 'battery-full';
  }
}
