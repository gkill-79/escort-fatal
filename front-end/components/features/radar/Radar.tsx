"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically load the MapComponent with SSR disabled
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-dark-900 rounded-3xl border border-white/5">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
      <p className="text-dark-400 font-medium animate-pulse">Initialisation du Radar Saptial...</p>
    </div>
  ),
});

export function Radar() {
  return (
    <div className="w-full h-[600px] lg:h-[700px]">
      <MapComponent />
    </div>
  );
}
