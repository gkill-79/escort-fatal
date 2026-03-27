import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Clock, Eye, Heart, Star, Phone,
  MessageCircle, Share2, Flag, CheckCircle,
  Shield, Crown, Ruler, Globe, Languages,
} from "lucide-react";
import { cn, formatPriceRange, formatTimeAgo, formatServiceLabel, formatHeight } from "@/lib/utils";
import { ProfileStats } from "./ProfileStats";
import { ProfileServices } from "./ProfileServices";
import { FollowButton } from "./FollowButton";
import { PhotoGallery } from "@/components/features/media/PhotoGallery";
import { Badge, TopGirlBadge, OnlineBadge, VerifiedBadge, ExclusiveBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Profile } from "@/types/profile.types";

interface ProfileDetailProps {
  profile:     Profile;
  isFollowing?: boolean;
  currentUserId?: string;
}

export function ProfileDetail({ profile, isFollowing, currentUserId }: ProfileDetailProps) {
  const isOwn = currentUserId && profile.userId === currentUserId;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Left: media + info ──────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Photo gallery */}
          <PhotoGallery photos={profile.photos as any} />

          {/* Bio */}
          {profile.bio && (
            <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-5">
              <h2 className="text-xs font-bold text-dark-500 uppercase tracking-widest mb-3">À propos</h2>
              <p className="text-sm text-dark-300 leading-relaxed whitespace-pre-line">{profile.bio}</p>
            </div>
          )}

          {/* Services */}
          <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-5">
            <h2 className="text-xs font-bold text-dark-500 uppercase tracking-widest mb-3">Services</h2>
            <ProfileServices services={profile.services as any} editable={!!isOwn} />
          </div>

          {/* Physical details */}
          <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-5">
            <h2 className="text-xs font-bold text-dark-500 uppercase tracking-widest mb-4">Détails</h2>
            <dl className="grid grid-cols-2 gap-3">
              {profile.age && (
                <DetailRow icon={<span className="text-base">🎂</span>} label="Âge" value={`${profile.age} ans`} />
              )}
              {profile.nationality && (
                <DetailRow icon={<Globe className="w-4 h-4 text-blue-400" />} label="Nationalité" value={profile.nationality} />
              )}
              {profile.height && (
                <DetailRow icon={<Ruler className="w-4 h-4 text-purple-400" />} label="Taille" value={formatHeight(profile.height)} />
              )}
              {profile.hairColor && (
                <DetailRow icon={<span className="text-base">💇</span>} label="Cheveux" value={profile.hairColor} />
              )}
              {profile.city && (
                <DetailRow icon={<MapPin className="w-4 h-4 text-brand-400" />} label="Ville" value={profile.city.name} />
              )}
              {profile.department && (
                <DetailRow icon={<MapPin className="w-4 h-4 text-dark-500" />} label="Département" value={profile.department.name} />
              )}
              {profile.languages && profile.languages.length > 0 && (
                <DetailRow
                  icon={<Languages className="w-4 h-4 text-green-400" />}
                  label="Langues"
                  value={profile.languages.join(", ")}
                  wide
                />
              )}
            </dl>
          </div>

          {/* Stats */}
          <ProfileStats
            viewCount={profile.viewCount}
            followerCount={profile.followerCount}
            commentCount={profile._count?.comments ?? 0}
            ratingAvg={profile.ratingAvg}
            ratingCount={profile.ratingCount}
          />
        </div>

        {/* ── Right: sticky card ──────────────────────── */}
        <div className="lg:w-[300px] xl:w-[320px] shrink-0">
          <div className="sticky top-28 space-y-4">
            <div className="bg-dark-800/80 backdrop-blur rounded-2xl border border-white/8 p-5 space-y-4">

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {profile.isTopGirl   && <TopGirlBadge />}
                {profile.isOnline    && <OnlineBadge />}
                {profile.isVerified  && <VerifiedBadge />}
                {profile.isExclusive && <ExclusiveBadge />}
              </div>

              {/* Name */}
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">
                  {profile.name}
                  {profile.age && <span className="text-dark-400 font-normal text-base ml-2">{profile.age} ans</span>}
                </h1>
                {profile.city && (
                  <p className="flex items-center gap-1.5 text-sm text-dark-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-400" />
                    <Link href={`/escorts/${profile.city.slug}`} className="hover:text-brand-400 transition-colors">
                      {profile.city.name}
                    </Link>
                  </p>
                )}
              </div>

              {/* Online status */}
              <div className="flex items-center gap-2 text-xs">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  profile.isOnline ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)] animate-pulse" : "bg-dark-600"
                )} />
                <span className={profile.isOnline ? "text-green-400 font-medium" : "text-dark-500"}>
                  {profile.isOnline ? "En ligne maintenant" : profile.lastOnlineAt
                    ? `Vue ${formatTimeAgo(new Date(profile.lastOnlineAt))}`
                    : "Hors ligne"}
                </span>
              </div>

              {/* Rating */}
              {profile.ratingAvg > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={cn(
                        "w-4 h-4",
                        n <= Math.round(profile.ratingAvg)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-dark-700"
                      )} />
                    ))}
                  </div>
                  <span className="text-sm text-white font-bold">{profile.ratingAvg.toFixed(1)}</span>
                  <span className="text-xs text-dark-500">({profile.ratingCount} avis)</span>
                </div>
              )}

              {/* Price */}
              <div className="text-lg font-bold text-white">
                {formatPriceRange(profile.priceFrom, profile.priceTo)}
              </div>

              {/* CTA buttons */}
              <div className="space-y-2">
                <Link href={`/messages?with=${profile.id}`} className="block">
                  <Button fullWidth size="lg">
                    <MessageCircle className="w-4 h-4" />
                    Envoyer un message
                  </Button>
                </Link>

                <FollowButton
                  profileId={profile.id}
                  isFollowing={isFollowing}
                  count={profile.followerCount}
                  size="md"
                />
              </div>

              {/* Report link */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <button className="flex items-center gap-1.5 text-xs text-dark-600 hover:text-red-400 transition-colors">
                  <Flag className="w-3 h-3" />
                  Signaler ce profil
                </button>
                <button className="flex items-center gap-1.5 text-xs text-dark-600 hover:text-brand-400 transition-colors">
                  <Share2 className="w-3 h-3" />
                  Partager
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function DetailRow({
  icon, label, value, wide,
}: { icon: React.ReactNode; label: string; value: string; wide?: boolean }) {
  return (
    <div className={cn("flex items-start gap-2.5", wide && "col-span-2")}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-dark-600 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm text-dark-200 font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
