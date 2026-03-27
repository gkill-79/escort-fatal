import type { Metadata } from "next";
import Link from "next/link";
import { Camera, AlertCircle, Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatTimeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Galerie Photos Escorte — Escorte Fatal",
  description: "Parcourez les dernières photos publiées par les escortes vérifiées.",
};

export const revalidate = 60;

export default async function EscortPhotosGalleryPage() {
  const photos = await prisma.profilePhoto.findMany({
    where: {
      isApproved: true,
      profile: {
        isActive: true,
        isApproved: true,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: {
      profile: {
        select: {
          slug: true,
          name: true,
          isTopGirl: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen">
      <section className="relative py-12 lg:py-16 border-b border-white/5 bg-dark-900/50">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 shadow-[0_0_20px_rgba(230,57,70,0.15)]">
              <Camera className="w-7 h-7 text-brand-400" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold text-white tracking-tight">
                Galerie Photos
              </h1>
              <p className="text-dark-400 mt-1">
                Découvrez les derniers clichés validés par la modération.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-2 sm:px-4">
        <div className="max-w-[1600px] mx-auto">
          {photos.length === 0 ? (
            <div className="py-24 max-w-xl mx-auto text-center bg-dark-800/30 rounded-3xl border border-white/5">
              <AlertCircle className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-xl text-white font-bold mb-2">
                Aucune photo disponible
              </h3>
              <p className="text-dark-400">
                Les profils n&apos;ont pas encore de photo publique approuvée.
              </p>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 xl:columns-4 2xl:columns-5 gap-3 lg:gap-4 space-y-3 lg:space-y-4">
              {photos.map((photo) => (
                <Link
                  href={`/escorts/${photo.profile.slug}`}
                  key={photo.id}
                  className="group relative block overflow-hidden rounded-2xl bg-dark-800 break-inside-avoid border border-white/5 hover:border-brand-500/50 transition-colors shadow-lg"
                >
                  <img
                    src={photo.url}
                    alt={`Photo de ${photo.profile.name}`}
                    loading="lazy"
                    className="w-full object-cover max-h-[600px] scale-100 group-hover:scale-105 transition-transform duration-500"
                  />

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="text-white font-bold text-lg leading-tight flex items-center gap-1.5">
                          {photo.profile.name}
                          {photo.profile.isTopGirl && (
                            <span className="text-brand-400 text-xs mt-1">⭐</span>
                          )}
                        </h3>
                        <p className="text-dark-300 text-xs mt-1">
                          {formatTimeAgo(new Date(photo.createdAt))}
                        </p>
                      </div>

                      {photo.ratingAvg > 0 && (
                        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                          <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
                          <span className="text-xs font-bold text-white">
                            {photo.ratingAvg.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

