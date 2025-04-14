
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Core Components
import { HeaderComponent } from './components/layout/header/header.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { SideNavComponent } from './components/layout/side-nav/side-nav.component';

// Feature Components
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { DevicesComponent } from './pages/devices/devices.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SubscriptionComponent } from './pages/subscription/subscription.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { GeofenceComponent } from './components/geofence/geofence.component';
import { DeviceCardComponent } from './components/device-card/device-card.component';
import { NotificationItemComponent } from './components/notification-item/notification-item.component';

// Services
import { AuthService } from './services/auth.service';
import { LocationService } from './services/location.service';
import { NotificationService } from './services/notification.service';
import { PaymentService } from './services/payment.service';
import { GeofenceService } from './services/geofence.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SideNavComponent,
    DashboardComponent,
    LoginComponent,
    RegisterComponent,
    DevicesComponent,
    MapViewComponent,
    NotificationsComponent,
    ProfileComponent,
    SubscriptionComponent,
    SettingsComponent,
    GeofenceComponent,
    DeviceCardComponent,
    NotificationItemComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AppRoutingModule
  ],
  providers: [
    AuthService,
    LocationService,
    NotificationService,
    PaymentService,
    GeofenceService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
