import { Metadata } from "next";
import { fetchApi } from "@/lib/api-client";
import { Camera, Video, PlayCircle, Star, AlertCircle, Heart } from "lucide-react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Galerie Multimédia — Escorte Fatal",
  description: "Découvrez les dernières photos et vidéos postées par nos escortes.",
};

type MediaPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function MediaHubPage({ searchParams }: MediaPageProps) {
  const isVideo = searchParams.type === "videos";
  const isTop = searchParams.sort === "top";

  // Fetch Photos or Videos from backend API
  let items: any[] = [];
  try {
    const params = new URLSearchParams();
    if (isVideo) params.set("type", "videos");
    if (isTop) params.set("sort", "top");
    
    items = await fetchApi(`/media?${params.toString()}`);
  } catch (error) {
    console.error("Error fetching media:", error);
    items = [];
  }

  return (
    <div className="min-h-screen">
      
      {/* ─── Hero ──────────────────────────────────────── */}
      <section className="relative py-12 lg:py-16 border-b border-white/5 bg-dark-900/50">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 shadow-[0_0_20px_rgba(230,57,70,0.15)]">
                {isVideo ? <Video className="w-7 h-7 text-brand-400" /> : <Camera className="w-7 h-7 text-brand-400" />}
              </div>
              <div>
                <h1 className="font-display text-4xl font-bold text-white tracking-tight">
                  {isVideo ? "Galerie Vidéos" : isTop ? "Top 100 Photos" : "Murs de Photos"}
                </h1>
                <p className="text-dark-400 mt-1">
                  Découvrez les {isVideo ? "extraits" : "clichés"} postés par nos modèles.
                </p>
              </div>
            </div>

            {/* Quick Switch */}
            <div className="flex bg-dark-800 p-1.5 rounded-xl border border-white/5 w-max">
              <Link 
                href="/media?type=photos" 
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${!isVideo && !isTop ? 'bg-brand-500 text-white shadow-lg' : 'text-dark-400 hover:text-white hover:bg-white/5'}`}
              >
                <Camera className="w-4 h-4" /> Récents
              </Link>
              <Link 
                href="/media?sort=top" 
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${isTop ? 'bg-brand-500 text-white shadow-lg' : 'text-dark-400 hover:text-white hover:bg-white/5'}`}
              >
                <Star className="w-4 h-4" /> Top Notées
              </Link>
              <Link 
                href="/media?type=videos" 
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${isVideo ? 'bg-brand-500 text-white shadow-lg' : 'text-dark-400 hover:text-white hover:bg-white/5'}`}
              >
                <Video className="w-4 h-4" /> Vidéos
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Media Grid (Masonry effect using CSS Columns) ──────────────────────────────────────── */}
      <section className="py-12 px-2 sm:px-4">
        <div className="max-w-[1600px] mx-auto">
          
          {items.length === 0 ? (
             <div className="py-24 max-w-xl mx-auto text-center bg-dark-800/30 rounded-3xl border border-white/5">
                <AlertCircle className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                <h3 className="text-xl text-white font-bold mb-2">Aucun média pour le moment</h3>
                <p className="text-dark-400">Les escortes n'ont pas encore approuvé de médias publics pour cette catégorie.</p>
             </div>
          ) : (
             <div className="columns-2 md:columns-3 xl:columns-4 2xl:columns-5 gap-3 lg:gap-4 space-y-3 lg:space-y-4">
               {items.map((media) => (
                 <Link 
                   href={`/escorts/${media.profile.slug}`} 
                   key={media.id} 
                   className="group relative block overflow-hidden rounded-2xl bg-dark-800 break-inside-avoid border border-white/5 hover:border-brand-500/50 transition-colors shadow-lg"
                 >
                   <div className="relative w-full">
                     {isVideo ? (
                       <div className="aspect-[9/16] bg-dark-900 relative">
                         {media.thumbnailUrl ? (
                           <img src={media.thumbnailUrl} alt="Video thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center bg-dark-800">
                              <Video className="w-8 h-8 text-dark-600" />
                           </div>
                         )}
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                              <PlayCircle className="w-8 h-8 text-white" />
                            </div>
                         </div>
                       </div>
                     ) : (
                       <img 
                          src={media.url} 
                          alt={`Photo de ${media.profile.name}`} 
                          loading="lazy"
                          className="w-full object-cover max-h-[600px] scale-100 group-hover:scale-105 transition-transform duration-500"
                       />
                     )}
                   </div>

                   {/* Overlay details */}
                   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12">
                     <div className="flex items-end justify-between">
                       <div>
                         <h3 className="text-white font-bold text-lg leading-tight flex items-center gap-1.5">
                           {media.profile.name}
                           {media.profile.isTopGirl && <span className="text-brand-400 text-xs mt-1">⭐</span>}
                         </h3>
                         <p className="text-dark-300 text-xs mt-1">{formatTimeAgo(new Date(media.createdAt))}</p>
                       </div>
                       
                       {!isVideo && media.ratingAvg > 0 && (
                         <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                           <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
                           <span className="text-xs font-bold text-white">{media.ratingAvg.toFixed(1)}</span>
                         </div>
                       )}
                       {isVideo && media.duration && (
                         <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-mono text-white border border-white/10">
                           {Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}
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
