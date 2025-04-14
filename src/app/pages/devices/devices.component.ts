
import { Component, OnInit } from '@angular/core';
import { LocationService, Device } from '../../services/location.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit {
  devices: Device[] = [];
  selectedDeviceId: string | null = null;
  
  // For device form modal
  showDeviceModal = false;
  isNewDevice = true;
  deviceForm!: FormGroup;
  
  // For confirmation modal
  showConfirmModal = false;
  deviceToDelete: string | null = null;
  
  colorOptions = [
    { value: '#4ECDC4', name: 'Teal' },
    { value: '#FF8A47', name: 'Orange' },
    { value: '#A76EC9', name: 'Purple' },
    { value: '#5DA5DA', name: 'Blue' },
    { value: '#FAA43A', name: 'Amber' },
    { value: '#60BD68', name: 'Green' },
    { value: '#F17CB0', name: 'Pink' },
    { value: '#B2912F', name: 'Brown' }
  ];

  constructor(
    private locationService: LocationService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.locationService.getDevices().subscribe(devices => {
      this.devices = devices;
      
      // Auto-select first device if none selected
      if (this.devices.length > 0 && !this.selectedDeviceId) {
        this.selectedDeviceId = this.devices[0].id;
      }
    });
    
    this.initDeviceForm();
  }

  initDeviceForm(): void {
    this.deviceForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      owner: ['', Validators.required],
      type: ['phone', Validators.required],
      color: ['#4ECDC4', Validators.required],
      icon: ['phone'],
      batteryLevel: [100, [Validators.min(0), Validators.max(100)]],
      isActive: [true]
    });
  }

  selectDevice(deviceId: string): void {
    this.selectedDeviceId = deviceId;
  }

  openAddDeviceModal(): void {
    this.isNewDevice = true;
    this.deviceForm.reset({
      type: 'phone',
      color: '#4ECDC4',
      icon: 'phone',
      batteryLevel: 100,
      isActive: true
    });
    this.showDeviceModal = true;
  }

  openEditDeviceModal(device: Device): void {
    this.isNewDevice = false;
    this.deviceForm.setValue({
      name: device.name,
      owner: device.owner,
      type: device.type,
      color: device.color,
      icon: device.icon,
      batteryLevel: device.batteryLevel || 100,
      isActive: device.isActive
    });
    this.selectedDeviceId = device.id;
    this.showDeviceModal = true;
  }

  confirmDeleteDevice(deviceId: string): void {
    this.deviceToDelete = deviceId;
    this.showConfirmModal = true;
  }

  deleteDevice(): void {
    if (this.deviceToDelete) {
      this.locationService.removeDevice(this.deviceToDelete).subscribe(() => {
        if (this.selectedDeviceId === this.deviceToDelete) {
          this.selectedDeviceId = this.devices.length > 0 ? this.devices[0].id : null;
        }
        this.showConfirmModal = false;
        this.deviceToDelete = null;
      });
    }
  }

  saveDevice(): void {
    if (this.deviceForm.invalid) {
      this.deviceForm.markAllAsTouched();
      return;
    }
    
    const deviceData = this.deviceForm.value;
    
    if (this.isNewDevice) {
      // Add new device
      this.locationService.addDevice(deviceData).subscribe(newDevice => {
        this.selectedDeviceId = newDevice.id;
        this.showDeviceModal = false;
      });
    } else {
      // Update existing device
      const device = this.devices.find(d => d.id === this.selectedDeviceId);
      if (device) {
        const updatedDevice: Device = {
          ...device,
          ...deviceData
        };
        
        this.locationService.updateDevice(updatedDevice).subscribe(() => {
          this.showDeviceModal = false;
        });
      }
    }
  }

  updateDevice(device: Device): void {
    this.locationService.updateDevice(device).subscribe();
  }

  closeDeviceModal(): void {
    this.showDeviceModal = false;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.deviceToDelete = null;
  }
}
