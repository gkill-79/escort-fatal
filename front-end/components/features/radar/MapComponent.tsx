'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { useEffect } from 'react';

// Icône personnalisée pour les escortes
const createCustomIcon = (imageUrl: string, isOnline: boolean) => new L.DivIcon({
  className: 'custom-marker',
  html: `
    <div class="relative w-12 h-12 rounded-full border-2 ${isOnline ? 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse' : 'border-dark-600'} shadow-lg overflow-hidden bg-dark-800">
      <img src="${imageUrl}" class="w-full h-full object-cover" />
      ${isOnline ? '<div class="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>' : ''}
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

// Assistant pour recentrer la carte
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

interface MapProps {
  center: { lat: number; lng: number };
  profiles: any[];
  radius: number;
}

export function MapComponent({ center, profiles, radius }: MapProps) {
  const position: [number, number] = [center.lat, center.lng];

  return (
    <MapContainer 
      center={position} 
      zoom={11} 
      className="w-full h-full z-[1]"
      scrollWheelZoom={true}
    >
      <ChangeView center={position} />
      
      {/* Thème de carte Dark / Moderne (CartoDB Voyager Dark) */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      {/* Zone de recherche active (Cercle pulsant) */}
      <Circle 
        center={position} 
        pathOptions={{ fillColor: '#ef4444', fillOpacity: 0.05, color: '#ef4444', weight: 1, dashArray: '5, 10' }} 
        radius={radius} 
      />

      {/* Marqueur de l'utilisateur */}
      <Marker position={position} icon={new L.DivIcon({
        className: 'user-marker',
        html: `<div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-ping"></div>`,
        iconSize: [16, 16]
      })} />

      {/* Affichage des escortes trouvées */}
      {profiles.map((profile) => {
        const photo = profile.photos?.[0]?.url || profile.avatarUrl || "https://placehold.co/100x100/1e293b/64748b?text=Photo";
        return (
          <Marker 
            key={profile.id} 
            position={[profile._geo.lat, profile._geo.lng]}
            icon={createCustomIcon(photo, profile.isOnline)}
          >
            <Popup className="custom-popup" closeButton={false}>
              <div className="text-center p-1">
                <div className="mb-2 font-bold text-dark-900">{profile.name}</div>
                <div className="text-xs text-dark-600 mb-3">{profile.categories?.[0]} • {profile.priceFrom}€/h</div>
                <Link 
                  href={`/escorts/${profile.slug}`} 
                  className="bg-brand-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-brand-500 transition-colors inline-block"
                >
                  Voir le profil
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
