import { useState } from 'react';
import { MapPin, AlertTriangle, ShieldCheck } from 'lucide-react';
import { hotspots as mockHotspots } from '../../data/mockData';
import { cn } from '../../utils/cn';
import type { Hotspot, DataSourceType } from '../../types';

export interface MockMapProps {
  items?: (Hotspot & { dataSource?: DataSourceType })[];
}

export function MockMap({ items }: MockMapProps) {
  const [activePin, setActivePin] = useState<string | null>(null);
  const dataList = items || mockHotspots;

  // Simple mock mapping coordinates to percentage for visual placement
  const getMapPosition = (lat: number, lng: number) => {
    // Normalizing coordinates roughly around New York for the mock data
    const normalizedLat = ((lat - 40.70) / 0.03) * 100; 
    const normalizedLng = ((lng + 74.02) / 0.03) * 100;
    
    return {
      top: `${100 - Math.max(10, Math.min(90, normalizedLat))}%`,
      left: `${Math.max(10, Math.min(90, normalizedLng))}%`,
    };
  };

  return (
    <div className="relative w-full h-full bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200">
      {/* Grid Pattern Background to look like a map */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Some fake map features */}
      <div className="absolute top-1/4 left-0 right-0 h-8 bg-blue-100 opacity-50 transform -skew-y-3"></div>
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-forest-100 rounded-full opacity-50 blur-xl"></div>
      
      {/* Markers */}
      {dataList.map((hotspot) => {
        const pos = getMapPosition(hotspot.coordinates.lat, hotspot.coordinates.lng);
        const isActive = activePin === hotspot.id;
        
        let colorClass = 'text-amber-500';
        let bgClass = 'bg-amber-100';
        let Icon = MapPin;
        
        if (hotspot.severity === 'critical') {
          colorClass = 'text-coral-500';
          bgClass = 'bg-coral-100';
          Icon = AlertTriangle;
        } else if (hotspot.status === 'transformed' || hotspot.status === 'cleaned') {
          colorClass = 'text-fresh-500';
          bgClass = 'bg-fresh-100';
          Icon = ShieldCheck;
        }

        const dataSource = hotspot.dataSource || 'DEMO DATA';

        return (
          <div 
            key={hotspot.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={pos}
            onClick={() => setActivePin(isActive ? null : hotspot.id)}
          >
            <div className={cn(
              "relative z-10 flex items-center justify-center w-10 h-10 rounded-full shadow-md transition-transform",
              bgClass, colorClass,
              isActive ? 'scale-110 ring-4 ring-white' : 'hover:scale-110'
            )}>
              <Icon className="w-5 h-5" />
            </div>
            
            {/* Tooltip */}
            {isActive && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-52 bg-white p-3 rounded-xl shadow-lg border border-neutral-100 z-20">
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                    dataSource === 'DEMO DATA' ? "bg-amber-100 text-amber-800" : "bg-fresh-100 text-fresh-800"
                  )}>
                    {dataSource}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-neutral-900 truncate">{hotspot.title}</h4>
                <p className="text-xs text-neutral-500 mt-1 capitalize">{hotspot.category} waste</p>
                <div className="mt-2 text-xs font-semibold text-forest-600">
                  View details →
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Map Controls (Fake) */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center font-bold text-xl text-neutral-600 hover:bg-neutral-50">+</button>
        <button className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center font-bold text-xl text-neutral-600 hover:bg-neutral-50">-</button>
      </div>
    </div>
  );
}
