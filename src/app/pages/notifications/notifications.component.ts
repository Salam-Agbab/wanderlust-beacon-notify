
import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  selectedFilter: 'all' | 'unread' | 'geofence' | 'battery' | 'system' = 'all';
  isLoading = false;

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications = this.filterNotifications(notifications);
      this.isLoading = false;
    });
  }

  filterNotifications(notifications: Notification[]): Notification[] {
    switch (this.selectedFilter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'geofence':
        return notifications.filter(n => n.type === 'geofence_enter' || n.type === 'geofence_exit');
      case 'battery':
        return notifications.filter(n => n.type === 'low_battery');
      case 'system':
        return notifications.filter(n => n.type === 'system');
      default:
        return notifications;
    }
  }

  applyFilter(filter: 'all' | 'unread' | 'geofence' | 'battery' | 'system'): void {
    this.selectedFilter = filter;
    this.loadNotifications();
  }

  markAllAsRead(): void {
    this.isLoading = true;
    this.notificationService.markAllAsRead().subscribe(() => {
      this.loadNotifications();
    });
  }

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id).subscribe(() => {
      this.loadNotifications();
    });
  }

  deleteNotification(id: string): void {
    this.notificationService.deleteNotification(id).subscribe(() => {
      this.loadNotifications();
    });
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

  getFormattedDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  getNotificationTypeText(type: string): string {
    switch (type) {
      case 'geofence_enter': return 'Geofence Enter';
      case 'geofence_exit': return 'Geofence Exit';
      case 'low_battery': return 'Low Battery';
      case 'speed_alert': return 'Speed Alert';
      case 'device_offline': return 'Device Offline';
      case 'system': return 'System';
      default: return type;
    }
  }
}
