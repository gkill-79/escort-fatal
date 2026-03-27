"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { LocateFixed, MapPin, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix missing marker icons in leaflet with next/image
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const customTopGirlIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const customPinkIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle user geolocation
function LocationMarker() {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Vous êtes ici</Popup>
    </Marker>
  );
}

export default function MapComponent() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/radar")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProfiles(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 z-0">
       <MapContainer 
          center={[46.603354, 1.888334]} // France center
          zoom={6} 
          scrollWheelZoom={false} 
          className="w-full h-full"
       >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png" // Dark mode map!
          />
          {profiles.map(p => (
            <Marker 
               key={p.id} 
               position={[p.coordinates[0], p.coordinates[1]]}
               icon={p.isTopGirl ? customTopGirlIcon : customPinkIcon}
            >
              <Popup className="custom-popup">
                <div className="w-48 overflow-hidden rounded-xl bg-dark-900 border border-white/10 shadow-xl m-0 p-0 text-white font-sans">
                  {p.avatar ? (
                     <img src={p.avatar} alt={p.name} className="w-full h-32 object-cover" />
                  ) : (
                     <div className="w-full h-32 bg-dark-800 flex items-center justify-center text-dark-500 text-xs">Pas de photo</div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <h4 className="font-bold text-base truncate m-0 leading-none">{p.name}</h4>
                      {p.isOnline && <span className="w-2 h-2 rounded-full bg-brand-500 inline-block ml-1"></span>}
                    </div>
                    <p className="text-xs text-dark-400 mb-2 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {p.city || "Ville inconnue"}
                    </p>
                    <Link href={`/escorts/${p.slug}`} className="block w-full text-center py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-bold transition-colors">
                      Voir le profil
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          <LocationMarker />
       </MapContainer>

       {/* Overlay Controls */}
       {loading && (
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-[1000]">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
       )}
    </div>
  );
}
