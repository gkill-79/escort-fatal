"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

interface ProfileCardProps {
  profile: {
    id: string;
    slug: string;
    name: string;
    age?: number | null;
    city?: { name: string } | null;
    ratingAvg?: number;
    isOnline?: boolean;
    isTopGirl?: boolean;
    isExclusive?: boolean;
    averageResponseTime?: number;
    calendarUpdatedAt?: string | Date;
    photos?: Array<{ url: string; thumbnailUrl?: string | null }>;
  };
  priority?: boolean;
}

export function ProfileCard({ profile, priority }: ProfileCardProps) {
  const photo = profile.photos?.[0];
  const src = photo?.thumbnailUrl || photo?.url || "https://placehold.co/280x380/1e293b/64748b?text=Photo";

  return (
    <Link
      href={`/escort/${profile.slug}`}
      className={cn(
        "group block rounded-2xl overflow-hidden border border-white/5 bg-dark-800/50",
        "hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5 transition-all"
      )}
    >
      <div className="relative aspect-[280/380] bg-dark-700">
        <Image
          src={src}
          alt={profile.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, 280px"
          priority={priority}
        />
        
        {/* Affichage du badge de vérification biométrique (IDCheck/IDNow) */}
        {profile.biometricVerified && (
          <div className="absolute top-2 left-2 z-10 w-full scale-75 origin-top-left drop-shadow-md">
            <VerifiedBadge />
          </div>
        )}

        {profile.isOnline && !profile.biometricVerified && (
          <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/90 text-xs font-medium text-white shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            En ligne
          </span>
        )}

        {profile.isOnline && profile.biometricVerified && (
          <span className="absolute top-10 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/90 text-[10px] font-medium text-white shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            En ligne
          </span>
        )}
        
        <div className="absolute top-2 right-2 flex gap-1">
          {profile.isTopGirl && (
            <span className="px-2 py-0.5 rounded-lg bg-amber-500/90 text-[10px] font-bold text-white">
              TOP
            </span>
          )}
          {profile.isVerified && (
            <span className="w-5 h-5 rounded-full bg-blue-500/90 flex items-center justify-center text-white text-[10px]">
              ✓
            </span>
          )}
        </div>

        {/* Badges d'engagement (Gamification) */}
        <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1.5 z-10">
          {profile.averageResponseTime && profile.averageResponseTime <= 15 && (
            <div className="flex items-center gap-1 bg-green-500/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-lg shadow-lg">
              <Clock className="w-3 h-3" />
              Répond en {profile.averageResponseTime} min
            </div>
          )}
          {profile.calendarUpdatedAt && isCalendarRecent(profile.calendarUpdatedAt) && (
            <div className="flex items-center gap-1 bg-blue-600/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-lg shadow-lg">
              <Zap className="w-3 h-3 fill-current" />
              Agenda à jour
            </div>
          )}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-white truncate group-hover:text-brand-400 transition-colors">
          {profile.name}
          {profile.age != null && (
            <span className="text-dark-400 font-normal ml-1">{profile.age} ans</span>
          )}
        </h3>
        {profile.city && (
          <p className="text-xs text-dark-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            {profile.city.name}
          </p>
        )}
        {profile.ratingAvg != null && profile.ratingAvg > 0 && (
          <p className="text-xs text-amber-400 flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 fill-current" />
            {profile.ratingAvg.toFixed(1)}
          </p>
        )}
      </div>
    </Link>
  );
}

function isCalendarRecent(date: string | Date) {
  const diffTime = Math.abs(new Date().getTime() - new Date(date).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays <= 1; // Mis à jour dans les dernières 24h
}
