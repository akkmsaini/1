import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DWLRStation } from '../types';

// Fix for default markers in leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  stations: DWLRStation[];
}

const MapView: React.FC<MapViewProps> = ({ stations }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize map
    mapInstance.current = L.map(mapRef.current).setView([23.5937, 78.9629], 5);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing markers
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstance.current!.removeLayer(layer);
      }
    });

    // Add markers for each station
    stations.forEach((station) => {
      if (!mapInstance.current) return;

      // Create custom icon based on status
      let iconColor = '#22c55e'; // green
      if (station.status === 'offline') iconColor = '#ef4444'; // red
      if (station.status === 'maintenance') iconColor = '#f59e0b'; // yellow

      // Check for critical alerts
      const hasCriticalAlert = station.alerts.some(alert => alert.type === 'critical');
      if (hasCriticalAlert) iconColor = '#ef4444';

      const customIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${iconColor};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
          ">
            ${station.alerts.filter(a => a.type === 'critical').length || ''}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        className: 'custom-div-icon',
      });

      const marker = L.marker(station.coordinates, { icon: customIcon }).addTo(mapInstance.current!);

      // Create popup content
      const alertsHtml = station.alerts.length > 0 
        ? `<div class="mt-2">
             <strong class="text-red-600">Alerts:</strong>
             ${station.alerts.map(alert => `
               <div class="text-xs px-2 py-1 mt-1 rounded" style="background-color: ${
                 alert.type === 'critical' ? '#fee2e2' : 
                 alert.type === 'warning' ? '#fef3c7' : '#dbeafe'
               }; color: ${
                 alert.type === 'critical' ? '#dc2626' : 
                 alert.type === 'warning' ? '#d97706' : '#2563eb'
               }">
                 ${alert.message}
               </div>
             `).join('')}
           </div>`
        : '';

      const popupContent = `
        <div style="min-width: 250px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; color: #1e40af;">
            ${station.name}
          </h3>
          <div style="font-size: 14px; line-height: 1.4;">
            <div><strong>Station ID:</strong> ${station.id}</div>
            <div><strong>Status:</strong> 
              <span style="color: ${
                station.status === 'online' ? '#059669' : 
                station.status === 'offline' ? '#dc2626' : '#d97706'
              }; font-weight: bold;">
                ${station.status.toUpperCase()}
              </span>
            </div>
            <div><strong>Current Level:</strong> ${station.currentLevel} m MSL</div>
            <div><strong>Last Reading:</strong> ${station.lastReading.toLocaleString()}</div>
            <div><strong>Coordinates:</strong> ${station.coordinates[0].toFixed(4)}, ${station.coordinates[1].toFixed(4)}</div>
            ${alertsHtml}
          </div>
          <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <button onclick="window.viewStationDetails('${station.id}')" 
                    style="background-color: #3b82f6; color: white; padding: 4px 12px; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">
              View Details
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
    });

    // Fit map to show all markers
    if (stations.length > 0) {
      const group = new L.FeatureGroup(
        stations.map(station => L.marker(station.coordinates))
      );
      mapInstance.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [stations]);

  // Global function for popup button
  useEffect(() => {
    (window as any).viewStationDetails = (stationId: string) => {
      console.log('View details for station:', stationId);
      // You can implement navigation to detailed view here
    };

    return () => {
      delete (window as any).viewStationDetails;
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full rounded-t-xl" />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 z-[1000]">
        <h4 className="font-semibold text-gray-800 mb-2">Station Status</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
            <span>Online</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow"></div>
            <span>Maintenance</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow"></div>
            <span>Offline/Critical</span>
          </div>
        </div>
      </div>

      {/* Station Count */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 z-[1000]">
        <div className="text-sm text-gray-600">Total Stations</div>
        <div className="text-2xl font-bold text-blue-600">{stations.length}</div>
        <div className="text-xs text-gray-500">
          {stations.filter(s => s.status === 'online').length} active
        </div>
      </div>
    </div>
  );
};

export default MapView;