import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, AlertTriangle, Locate, RefreshCw } from 'lucide-react';
import type { Hotspot, DataSourceType } from '../../types';
import { cn } from '../../utils/cn';

// Helper to create custom animated map marker icons
const createCustomIcon = (status: string, severity: string, isSelected: boolean = false) => {
  let bgColor = 'bg-amber-500';
  let pulseColor = 'bg-amber-400';
  let symbol = '📍';

  if (severity === 'critical') {
    bgColor = 'bg-coral-500';
    pulseColor = 'bg-coral-400';
    symbol = '⚠️';
  } else if (status === 'transformed' || status === 'beautified') {
    bgColor = 'bg-purple-600';
    pulseColor = 'bg-purple-400';
    symbol = '✨';
  } else if (status === 'cleaned' || status === 'verified' || status === 'recovered') {
    bgColor = 'bg-fresh-500';
    pulseColor = 'bg-fresh-400';
    symbol = '🛡️';
  } else if (status === 'in_progress' || status === 'cleanup_scheduled') {
    bgColor = 'bg-yellow-500';
    pulseColor = 'bg-yellow-400';
    symbol = '🧹';
  }

  const ringStyle = isSelected ? 'ring-4 ring-fresh-400 scale-125 z-50 border-2 border-white' : 'border-2 border-white';

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-8 h-8 rounded-full ${pulseColor} opacity-75 animate-ping"></span>
        <div class="relative w-8 h-8 ${bgColor} text-white rounded-full flex items-center justify-center shadow-lg ${ringStyle} text-xs font-bold transition-all">
          ${symbol}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Map click event listener for reporting location
function MapClickEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Controller to dynamically set view when target center changes & invalidate map size
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    // Invalidate map size to recalculate bounds inside flex container
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [center, zoom, map]);
  return null;
}

export interface SatelliteMapProps {
  items?: (Hotspot & { dataSource?: DataSourceType })[];
  selectedHotspotId?: string | null;
  onSelectHotspot?: (hotspot: Hotspot) => void;
}

export function SatelliteMap({ items = [], selectedHotspotId, onSelectHotspot }: SatelliteMapProps) {
  const navigate = useNavigate();
  const [selectedClickCoords, setSelectedClickCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showLegend, setShowLegend] = useState<boolean>(true);

  // Compute default center from first hotspot or default coordinates
  const defaultCenter: [number, number] = items.length > 0 && items[0].coordinates
    ? [items[0].coordinates.lat, items[0].coordinates.lng]
    : [40.7128, -74.0060];

  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [zoom, setZoom] = useState<number>(13);

  // Browser Geolocation
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setMapCenter(coords);
        setZoom(15);
      },
      (err) => {
        console.warn('Geolocation permission denied or failed:', err);
        alert('Unable to access location. Please enable location permissions in your browser.');
      }
    );
  };

  const handleFitHotspots = () => {
    if (items.length > 0 && items[0].coordinates) {
      setMapCenter([items[0].coordinates.lat, items[0].coordinates.lng]);
      setZoom(13);
    }
  };

  const handleReportLocation = (lat: number, lng: number) => {
    navigate(`/report?lat=${lat.toFixed(6)}&lng=${lng.toFixed(6)}`);
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-inner">
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <ChangeView center={mapCenter} zoom={zoom} />
        <MapClickEvents onMapClick={(lat, lng) => setSelectedClickCoords({ lat, lng })} />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Real Satellite Imagery + Labels (Esri)">
            <>
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and GIS User Community'
                maxZoom={19}
              />
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                attribution=""
                maxZoom={19}
                opacity={0.85}
              />
            </>
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Street Map (OpenStreetMap)">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={userLocation}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `
                <div class="relative flex items-center justify-center">
                  <span class="absolute w-6 h-6 rounded-full bg-blue-500 opacity-50 animate-ping"></span>
                  <div class="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md"></div>
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })}
          >
            <Popup>
              <div className="text-xs font-bold text-neutral-900 p-1">Your Current Location</div>
            </Popup>
          </Marker>
        )}

        {/* Hotspot markers */}
        {items.map((hotspot) => {
          if (!hotspot.coordinates || typeof hotspot.coordinates.lat !== 'number' || typeof hotspot.coordinates.lng !== 'number') {
            return null;
          }

          const isSelected = selectedHotspotId === hotspot.id;
          const icon = createCustomIcon(hotspot.status, hotspot.severity, isSelected);
          const dataSource = hotspot.dataSource || 'DEMO DATA';

          return (
            <Marker 
              key={hotspot.id} 
              position={[hotspot.coordinates.lat, hotspot.coordinates.lng]} 
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (onSelectHotspot) {
                    onSelectHotspot(hotspot);
                  }
                }
              }}
            >
              <Tooltip 
                permanent 
                direction="top" 
                offset={[0, -18]}
                className="bg-neutral-950/90 text-white border border-neutral-800 rounded-lg px-2 py-1 text-[10px] font-mono font-bold shadow-lg backdrop-blur-md"
              >
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span>{hotspot.severity === 'critical' ? '🔴' : hotspot.status === 'cleaned' ? '🟢' : '🟠'}</span>
                  <span>{hotspot.title}</span>
                </div>
              </Tooltip>

              <Popup className="custom-hotspot-popup">
                <div className="p-1 space-y-2 max-w-xs font-sans">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                      dataSource === 'DEMO DATA' ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-fresh-100 text-fresh-900 border border-fresh-300"
                    )}>
                      {dataSource}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono font-bold uppercase">
                      {hotspot.severity}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white leading-snug">{hotspot.title}</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" /> {hotspot.location}
                  </p>

                  <div className="grid grid-cols-2 gap-1 text-[11px] font-mono bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <div>
                      <span className="text-neutral-400 block text-[9px] uppercase">Category</span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 capitalize">{hotspot.category}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[9px] uppercase">Est. Waste</span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">{hotspot.estimatedWaste || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectHotspot) onSelectHotspot(hotspot);
                      }}
                      className="flex-1 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white text-xs font-bold py-1.5 px-2 rounded-lg text-center transition-colors"
                    >
                      Select Hotspot
                    </button>
                    {(hotspot.status === 'reported' || hotspot.status === 'mission_active') && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/missions');
                        }}
                        className="flex-1 bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold py-1.5 px-2 rounded-lg text-center transition-colors"
                      >
                        Join Cleanup
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Click Action Banner for empty map clicks */}
      {selectedClickCoords && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-neutral-950/95 border border-neutral-800 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md max-w-sm w-[90%] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Report Pollution at Selected Location?</span>
            </div>
            <button onClick={() => setSelectedClickCoords(null)} className="text-neutral-400 hover:text-white text-xs font-bold p-1">✕</button>
          </div>
          <p className="text-xs text-neutral-400 font-mono">
            Coordinates: {selectedClickCoords.lat.toFixed(5)}, {selectedClickCoords.lng.toFixed(5)}
          </p>
          <button
            onClick={() => handleReportLocation(selectedClickCoords.lat, selectedClickCoords.lng)}
            className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-lg"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Report This Location
          </button>
        </div>
      )}

      {/* Floating Control Buttons */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={handleLocateUser}
          title="Locate My Position"
          className="w-10 h-10 bg-white hover:bg-neutral-100 text-neutral-800 rounded-xl shadow-md flex items-center justify-center transition-all border border-neutral-200"
        >
          <Locate className="w-5 h-5 text-forest-600" />
        </button>
        <button
          onClick={handleFitHotspots}
          title="Fit Hotspots View"
          className="w-10 h-10 bg-white hover:bg-neutral-100 text-neutral-800 rounded-xl shadow-md flex items-center justify-center transition-all border border-neutral-200"
        >
          <RefreshCw className="w-4 h-4 text-neutral-700" />
        </button>
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-neutral-950/90 border border-neutral-800 text-white p-3 rounded-2xl shadow-xl backdrop-blur-sm text-xs font-mono space-y-1.5 max-w-xs">
        <div className="flex items-center justify-between gap-4 font-bold text-[11px] text-neutral-300 border-b border-neutral-800 pb-1 mb-1">
          <span>Satellite Layers & Legend</span>
          <button onClick={() => setShowLegend(!showLegend)} className="text-neutral-500 hover:text-neutral-300">
            {showLegend ? 'Hide' : 'Show'}
          </button>
        </div>
        {showLegend && (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-coral-500"></span> <span>🔴 Active Critical</span></div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> <span>🟠 Reported</span></div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> <span>🟡 Cleanup Mission</span></div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-fresh-500"></span> <span>🟢 Recovered</span></div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> <span>🟣 Transformation</span></div>
          </div>
        )}
      </div>

      {/* Empty State Overlay if no hotspots exist */}
      {items.length === 0 && (
        <div className="absolute inset-0 z-[999] bg-neutral-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
          <AlertTriangle className="w-10 h-10 text-amber-400" />
          <h3 className="text-lg font-bold">No pollution hotspots recorded yet</h3>
          <p className="text-xs text-neutral-400 max-w-xs">Be the first to report illegal waste dumping or illegal landfill sites in your area.</p>
          <button 
            onClick={() => navigate('/report')}
            className="bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors"
          >
            Report a Hotspot
          </button>
        </div>
      )}
    </div>
  );
}
