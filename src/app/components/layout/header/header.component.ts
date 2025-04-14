
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  user: User | null = null;
  unreadNotifications: number = 0;
  showProfileMenu: boolean = false;
  showNotificationsPanel: boolean = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
    
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadNotifications = count;
    });
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) {
      this.showNotificationsPanel = false;
    }
  }

  toggleNotificationsPanel(): void {
    this.showNotificationsPanel = !this.showNotificationsPanel;
    if (this.showNotificationsPanel) {
      this.showProfileMenu = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  closeMenus(): void {
    this.showProfileMenu = false;
    this.showNotificationsPanel = false;
  }

  viewProfile(): void {
    this.router.navigate(['/profile']);
    this.closeMenus();
  }

  viewAllNotifications(): void {
    this.router.navigate(['/notifications']);
    this.closeMenus();
  }
}
