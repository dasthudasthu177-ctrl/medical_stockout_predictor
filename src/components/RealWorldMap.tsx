import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Facility, Medicine } from '../types';
import {
  Building2,
  AlertTriangle,
  Send,
  Navigation,
  Layers,
  MapPin,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  Info,
} from 'lucide-react';

interface RealWorldMapProps {
  facilities: Facility[];
  selectedFacility: Facility;
  onSelectFacility: (facility: Facility) => void;
  medicines: Medicine[];
  onTriggerNudge: (medicine: Medicine) => void;
}

export const RealWorldMap: React.FC<RealWorldMapProps> = ({
  facilities,
  selectedFacility,
  onSelectFacility,
  medicines,
  onTriggerNudge,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const linesRef = useRef<L.Polyline[]>([]);

  const [filterType, setFilterType] = useState<'ALL' | 'CRITICAL' | 'DEPOTS'>('ALL');
  const [activePopupFacility, setActivePopupFacility] = useState<Facility | null>(null);

  // Central Warehouse (TNMSC Egmore)
  const centralDepot = facilities.find((f) => f.type === 'Regional Warehouse') || facilities[facilities.length - 1];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered around Chennai & surrounding districts (Tambaram, Ambattur, Thiruvallur, Kanchipuram)
    const map = L.map(mapContainerRef.current, {
      center: [13.04, 80.05],
      zoom: 10,
      zoomControl: false,
    });

    // Dark styled OpenStreetMap tiles (CartoDB Dark Matter or clean standard with high contrast)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Corridors when facilities or filter change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers & polylines
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    linesRef.current.forEach((l) => l.remove());
    linesRef.current = [];

    // Filter facilities
    const filtered = facilities.filter((fac) => {
      if (filterType === 'CRITICAL') {
        return fac.id === 'fac-1' || fac.id === 'fac-4'; // Tambaram and Thiruvallur have critical shortages
      }
      if (filterType === 'DEPOTS') {
        return fac.type === 'Regional Warehouse' || fac.type === 'District Hospital';
      }
      return true;
    });

    // Draw supply route corridors from Central Depot to health facilities
    if (centralDepot && filterType !== 'CRITICAL') {
      filtered.forEach((fac) => {
        if (fac.id === centralDepot.id) return;

        const isCritical = fac.id === 'fac-1' || fac.id === 'fac-4';
        const polyline = L.polyline(
          [
            [centralDepot.latitude, centralDepot.longitude],
            [fac.latitude, fac.longitude],
          ],
          {
            color: isCritical ? '#ef4444' : '#10b981',
            weight: isCritical ? 2.5 : 1.5,
            opacity: isCritical ? 0.85 : 0.45,
            dashArray: isCritical ? '6, 6' : '3, 6',
          }
        ).addTo(map);

        linesRef.current.push(polyline);
      });
    }

    // Add Markers
    filtered.forEach((fac) => {
      const isDepot = fac.type === 'Regional Warehouse';
      const isCritical = fac.id === 'fac-1' || fac.id === 'fac-4';
      const isSelected = fac.id === selectedFacility.id;

      // Custom HTML Marker Icon
      const iconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          ${
            isCritical
              ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background: rgba(239,68,68,0.4); animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>`
              : ''
          }
          <div style="
            width: ${isDepot ? '36px' : '30px'};
            height: ${isDepot ? '36px' : '30px'};
            border-radius: 10px;
            background: ${isDepot ? '#0284c7' : isCritical ? '#dc2626' : '#059669'};
            border: 2px solid ${isSelected ? '#facc15' : '#ffffff'};
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 13px;
            cursor: pointer;
            transition: transform 0.2s;
          ">
            ${isDepot ? '🏢' : isCritical ? '🚨' : '🏥'}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-facility-pin',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([fac.latitude, fac.longitude], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        onSelectFacility(fac);
        setActivePopupFacility(fac);
      });

      markersRef.current.push(marker);
    });
  }, [facilities, selectedFacility, filterType, centralDepot, onSelectFacility]);

  // Center on selected facility
  const handleFlyTo = (fac: Facility) => {
    onSelectFacility(fac);
    setActivePopupFacility(fac);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([fac.latitude, fac.longitude], 12, { duration: 1.2 });
    }
  };

  // Find critical medicines
  const criticalMeds = medicines.filter((m) => m.riskLevel === 'CRITICAL');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
      {/* Map Control Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Real-World Public Health Supply Chain Map
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Chennai & Northern Tamil Nadu
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Geospatial tracking of Primary Health Centres, Sub-District Hospitals, and Central Drug Warehouses.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterType === 'ALL'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Nodes ({facilities.length})
          </button>
          <button
            onClick={() => setFilterType('CRITICAL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1 ${
              filterType === 'CRITICAL'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Shortage Zones</span>
          </button>
          <button
            onClick={() => setFilterType('DEPOTS')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterType === 'DEPOTS'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Depots
          </button>
        </div>
      </div>

      {/* Map Canvas + Overlay Cards */}
      <div className="relative w-full h-[400px] sm:h-[480px]">
        {/* Leaflet Container */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Legend Overlay Card */}
        <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 text-[11px] text-slate-300 shadow-xl space-y-1.5 hidden sm:block pointer-events-auto max-w-[200px]">
          <div className="font-bold text-white text-xs border-b border-slate-800 pb-1 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Map Legend</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded bg-rose-600 flex items-center justify-center text-[10px]">🚨</span>
            <span>Critical Shortage (&lt; 4d)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded bg-emerald-600 flex items-center justify-center text-[10px]">🏥</span>
            <span>Stable PHC / Hospital</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded bg-sky-600 flex items-center justify-center text-[10px]">🏢</span>
            <span>TNMSC Central Depot</span>
          </div>
          <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            <span className="w-3 h-0.5 bg-rose-500" />
            <span>Emergency Replenishment Path</span>
          </div>
        </div>

        {/* Quick Facility Jumper (Horizontal scroll on bottom left) */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[1000] flex items-center space-x-2 overflow-x-auto pb-1 max-w-full">
          {facilities.map((fac) => {
            const isSelected = fac.id === selectedFacility.id;
            const isCritical = fac.id === 'fac-1' || fac.id === 'fac-4';
            return (
              <button
                key={fac.id}
                onClick={() => handleFlyTo(fac)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shadow-lg backdrop-blur-md transition-all flex items-center space-x-1.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-400 scale-105'
                    : isCritical
                    ? 'bg-slate-900/90 text-rose-300 border-rose-800 hover:bg-slate-800'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>{fac.type === 'Regional Warehouse' ? '🏢' : isCritical ? '🚨' : '🏥'}</span>
                <span>{fac.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Facility Context Bar */}
      <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-emerald-400 font-mono">
              GPS: {selectedFacility.latitude.toFixed(4)}° N, {selectedFacility.longitude.toFixed(4)}° E
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400">{selectedFacility.address}</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
            <span>{selectedFacility.name}</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {selectedFacility.type}
            </span>
          </div>
        </div>

        {/* Actions for this facility */}
        <div className="flex items-center space-x-2 shrink-0">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${selectedFacility.name}, ${selectedFacility.address}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </a>

          {criticalMeds[0] && (
            <button
              onClick={() => onTriggerNudge(criticalMeds[0])}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nudge Restock for {selectedFacility.name.split(' ')[0]}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
