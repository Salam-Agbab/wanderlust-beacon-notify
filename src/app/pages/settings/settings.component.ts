
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  notificationSettings!: FormGroup;
  privacySettings!: FormGroup;
  generalSettings!: FormGroup;
  updateSuccess = false;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.initForms();
  }

  initForms(): void {
    this.notificationSettings = this.formBuilder.group({
      emailNotifications: [true],
      pushNotifications: [true],
      geofenceAlerts: [true],
      lowBatteryAlerts: [true],
      deviceOfflineAlerts: [true],
      speedAlerts: [false],
      systemUpdates: [true]
    });

    this.privacySettings = this.formBuilder.group({
      shareLocationData: [false],
      allowAnonymousUsageData: [true],
      showDeviceNamesToFriends: [true],
      showExactLocation: [true]
    });

    this.generalSettings = this.formBuilder.group({
      distanceUnit: ['miles'],
      timeFormat: ['12h'],
      language: ['english'],
      autoRefreshInterval: ['60']
    });
  }

  saveNotificationSettings(): void {
    console.log('Notification settings saved:', this.notificationSettings.value);
    this.showSuccessMessage();
  }

  savePrivacySettings(): void {
    console.log('Privacy settings saved:', this.privacySettings.value);
    this.showSuccessMessage();
  }

  saveGeneralSettings(): void {
    console.log('General settings saved:', this.generalSettings.value);
    this.showSuccessMessage();
  }

  showSuccessMessage(): void {
    this.updateSuccess = true;
    setTimeout(() => {
      this.updateSuccess = false;
    }, 3000);
  }
}
