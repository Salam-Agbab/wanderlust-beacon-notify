
import { Component, OnInit, AfterViewInit, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { LocationData } from '../../services/location.service';
import { Geofence } from '../../services/geofence.service';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() locations: LocationData[] = [];
  @Input() geofences: Geofence[] = [];
  @Input() selectedDeviceId: string | null = null;
  @Input() height: string = '500px';

  private map: L.Map | null = null;
  private deviceMarkers: { [key: string]: L.Marker } = {};
  private geofenceCircles: { [key: string]: L.Circle } = {};
  private hasInitialized = false;

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.hasInitialized && this.map) {
      this.hasInitialized = true;
    }

    if (this.hasInitialized) {
      if (changes['locations'] && this.map) {
        this.updateDeviceMarkers();
      }

      if (changes['geofences'] && this.map) {
        this.updateGeofences();
      }

      if (changes['selectedDeviceId'] && this.map) {
        this.focusSelectedDevice();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeMap(): void {
    // Create the map
    this.map = L.map('map').setView([40.7128, -74.0060], 12);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Initialize device markers and geofences
    this.updateDeviceMarkers();
    this.updateGeofences();
    this.fitBounds();
  }

  private updateDeviceMarkers(): void {
    if (!this.map) return;

    // Remove existing markers
    Object.values(this.deviceMarkers).forEach(marker => marker.remove());
    this.deviceMarkers = {};

    // Add new markers
    this.locations.forEach(location => {
      const isSelected = this.selectedDeviceId === location.deviceId;
      
      // Create a custom icon
      const customIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: `
          <div class="marker-container ${isSelected ? 'selected' : ''}">
            <div class="marker-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${isSelected ? '#FF8A47' : '#4ECDC4'}" width="24" height="24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div class="marker-label">${location.deviceName}</div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      });

      // Create and add the marker
      const marker = L.marker([location.latitude, location.longitude], { icon: customIcon })
        .addTo(this.map!)
        .bindPopup(`
          <div class="device-popup">
            <h3>${location.deviceName}</h3>
            <p>Last updated: ${new Date(location.timestamp).toLocaleString()}</p>
            <p>Battery: ${location.batteryLevel}%</p>
            <p>Accuracy: ${location.accuracy} m</p>
            ${location.speed ? `<p>Speed: ${location.speed} km/h</p>` : ''}
          </div>
        `);

      // Add to the markers collection
      this.deviceMarkers[location.deviceId] = marker;
    });

    // Focus on the selected device
    this.focusSelectedDevice();
  }

  private updateGeofences(): void {
    if (!this.map) return;

    // Remove existing geofence circles
    Object.values(this.geofenceCircles).forEach(circle => circle.remove());
    this.geofenceCircles = {};

    // Add new geofence circles
    this.geofences.forEach(geofence => {
      const circle = L.circle([geofence.latitude, geofence.longitude], {
        radius: geofence.radius,
        color: geofence.color,
        fillColor: geofence.color,
        fillOpacity: 0.2,
        weight: 2
      })
        .addTo(this.map!)
        .bindPopup(`
          <div class="geofence-popup">
            <h3>${geofence.name}</h3>
            <p>Type: ${geofence.type}</p>
            ${geofence.address ? `<p>Address: ${geofence.address}</p>` : ''}
            <p>Radius: ${geofence.radius} m</p>
          </div>
        `);

      // Add to the circles collection
      this.geofenceCircles[geofence.id] = circle;
    });
  }

  private focusSelectedDevice(): void {
    if (!this.map || !this.selectedDeviceId) return;

    const marker = this.deviceMarkers[this.selectedDeviceId];
    if (marker) {
      this.map.setView(marker.getLatLng(), 15);
      marker.openPopup();
    }
  }

  private fitBounds(): void {
    if (!this.map || this.locations.length === 0) return;

    const bounds = L.latLngBounds(
      this.locations.map(loc => [loc.latitude, loc.longitude])
    );

    // Add geofence bounds if available
    if (this.geofences.length > 0) {
      this.geofences.forEach(geofence => {
        bounds.extend([geofence.latitude, geofence.longitude]);
        // Extend by the radius as well for better visibility
        const radiusInDegrees = geofence.radius / 111000; // approximate conversion to degrees
        bounds.extend([geofence.latitude + radiusInDegrees, geofence.longitude + radiusInDegrees]);
        bounds.extend([geofence.latitude - radiusInDegrees, geofence.longitude - radiusInDegrees]);
      });
    }

    // Add some padding
    this.map.fitBounds(bounds, { padding: [50, 50] });
  }
}
