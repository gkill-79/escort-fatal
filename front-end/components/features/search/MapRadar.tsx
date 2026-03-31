"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { Star, Flame, MapPin } from "lucide-react";
import { formatPriceRange } from "@/lib/utils";

// --- Leaflet default icon fix (prevent missing asset 404s in Next.js) ---
const CustomPinIcon = (profile: any) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        width: 44px; 
        height: 44px; 
        position: relative; 
        border-radius: 50%; 
        border: 2.5px solid ${profile.isTopGirl ? '#FBBF24' : '#ef4444'};
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
        background-image: url('${profile.photoUrl}');
        background-size: cover;
        background-position: center;
        transform: translate(-50%, -100%);
      ">
        ${profile.isOnline ? '<div style="position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; border-radius: 50%; background-color: #22C55E; border: 2px solid #111;"></div>' : ''}
      </div>
      <div style="
        position: absolute; 
        bottom: -6px; 
        left: 50%; 
        transform: translateX(-50%); 
        width: 0; 
        height: 0; 
        border-left: 6px solid transparent; 
        border-right: 6px solid transparent; 
        border-top: 8px solid ${profile.isTopGirl ? '#FBBF24' : '#ef4444'};
      "></div>
    `,
    iconSize: [44, 52],
    iconAnchor: [22, 52], // Bottom center
    popupAnchor: [0, -55], // Opens above the avatar
  });
};

function MapEventHandler({ onBoundsChange }: { onBoundsChange: (b: any) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLon: bounds.getWest(),
        maxLon: bounds.getEast()
      });
    },
    zoomend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLon: bounds.getWest(),
        maxLon: bounds.getEast()
      });
    }
  });

  // Initial trigger
  useEffect(() => {
    const bounds = map.getBounds();
    onBoundsChange({
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
      minLon: bounds.getWest(),
      maxLon: bounds.getEast()
    });
  }, [map, onBoundsChange]);

  return null;
}

interface MapRadarProps {
  profiles: any[];
  onBoundsChange: (bounds: any) => void;
  center?: [number, number];
  zoom?: number;
}

export default function MapRadar({ profiles, onBoundsChange, center = [46.603354, 1.888334], zoom = 6 }: MapRadarProps) {
  // Leaflet needs to run entirely on the client, so prevent SSR hydration mismatch.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-dark-900 flex items-center justify-center border border-white/5 rounded-2xl">
         <span className="text-dark-500 font-medium">Initialisation du Radar...</span>
      </div>
    );
  }

  // Use customized CartoDB Dark Matter tiles to fit our UI
  const CARTO_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="w-full h-full relative z-0 rounded-2xl overflow-hidden group">
      {/* 
        This is a dark styled Leaflet map. 
        Important: z-index must be kept relatively low to avoid overlaying the React navigation headers. 
      */}
      <MapContainer 
        center={center} 
        zoom={zoom} 
        zoomControl={false} // Custom placing
        className="w-full h-full z-0"
        style={{ background: '#121212' }}
      >
        <ZoomControl position="bottomright" />
        
        <TileLayer
          url={CARTO_URL}
          attribution='&copy; CARTO'
        />

        <MapEventHandler onBoundsChange={onBoundsChange} />

        {profiles.map(profile => {
          if (!profile.pinLat || !profile.pinLon) return null;

          return (
            <Marker 
              key={profile.id} 
              position={[profile.pinLat, profile.pinLon]}
              icon={CustomPinIcon(profile)}
            >
              <Popup 
                className="custom-popup" 
                closeButton={false} 
                minWidth={220}
              >
                <div className="p-1 -m-1">
                   <div 
                      className="w-full h-32 rounded-xl mb-3 bg-cover bg-center" 
                      style={{ backgroundImage: `url(${profile.photoUrl})` }} 
                   />
                   
                   <div className="flex justify-between items-start mb-1">
                     <h3 className="font-bold text-white text-base leading-tight truncate pr-2">
                       {profile.name} <span className="font-normal text-dark-400 text-sm">{profile.age} ans</span>
                     </h3>
                     {profile.isOnline && (
                       <span className="shrink-0 flex items-center justify-center w-5 h-5 bg-green-500/20 rounded-full">
                         <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                       </span>
                     )}
                   </div>

                   <p className="text-xs text-dark-400 flex items-center gap-1 mb-2">
                     <MapPin className="w-3 h-3 text-brand-500" /> {profile.city}
                   </p>

                   {(profile.ratingAvg > 0 || profile.isTopGirl) && (
                     <div className="flex items-center gap-2 mb-3">
                       {profile.isTopGirl && (
                         <span className="flex items-center gap-1 text-[10px] uppercase font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded border border-amber-200">
                           <Flame className="w-3 h-3" /> Top
                         </span>
                       )}
                       {profile.ratingAvg > 0 && (
                          <span className="flex items-center gap-0.5 text-xs font-bold text-dark-700">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            {profile.ratingAvg.toFixed(1)}
                          </span>
                       )}
                     </div>
                   )}

                   <div className="text-sm font-black text-brand-600 mb-3">
                     {profile.priceFrom ? `À partir de ${profile.priceFrom}€` : "Prix sur demande"}
                   </div>

                   <Link href={`/escorts/${profile.slug}`} className="block">
                     <button className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer">
                        Voir le profil
                     </button>
                   </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Injecting CSS overrides for the Leaflet popup to make it look modern (since default leaflet popup is white/gray with weird shadows and ugly close buttons) */}
      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-popup-content-wrapper {
          background: #1e1e1e !important;
          color: white !important;
          border-radius: 16px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6);
          padding: 8px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .leaflet-popup-tip {
          background: #1e1e1e !important;
        }
      `}} />
    </div>
  );
}
