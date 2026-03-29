"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, HeartOff, Flame, MapPin, User, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api-client";
import { toast } from "react-hot-toast";

interface TopMedia {
  id: string;
  url: string;
  hotScore: number;
  upvotes: number;
  downvotes: number;
  profile: {
    id: string;
    slug: string;
    name: string;
    isTopGirl: boolean;
    city?: { name: string };
  };
}

export function Top100Gallery() {
  const [media, setMedia] = useState<TopMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTopPhotos() {
      try {
        const data = await fetchApi("/v2/media/top-photos");
        setMedia(data);
      } catch (error) {
        console.error("Failed to load top photos:", error);
        toast.error("Impossible de charger la galerie.");
      } finally {
        setLoading(false);
      }
    }
    loadTopPhotos();
  }, []);

  const handleVote = async (id: string, direction: "up" | "down") => {
    if (votingId) return;
    setVotingId(id);
    
    try {
      await fetchApi(`/v2/media/${id}/vote`, {
        method: "POST",
        body: JSON.stringify({ direction })
      });
      
      // Optimistic Update
      setMedia(prev => prev.map(m => {
        if (m.id === id) {
          return {
            ...m,
            upvotes: direction === "up" ? m.upvotes + 1 : m.upvotes,
            downvotes: direction === "down" ? m.downvotes + 1 : m.downvotes
          };
        }
        return m;
      }));
      
      toast.success(direction === "up" ? "Vote enregistré ! ❤️" : "Cœur brisé... 💔");
    } catch (error) {
      toast.error("Échec du vote.");
    } finally {
      setVotingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-dark-400 font-medium animate-pulse">Calcul des tendances en cours...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 p-4 md:p-6">
      {media.map((item, index) => (
        <div 
          key={item.id} 
          className={`group relative aspect-[3/4] rounded-2xl overflow-hidden bg-dark-900 border transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${
            item.profile.isTopGirl ? "border-brand-500/50 shadow-[0_0_15px_rgba(233,69,96,0.2)]" : "border-white/5"
          }`}
        >
          {/* IMAGE */}
          <Image
            src={item.url || "/placeholder-escort.jpg"}
            alt={item.profile.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          />

          {/* GRADIENT OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

          {/* HOT BADGE */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
            <Flame className={`w-3.5 h-3.5 ${item.hotScore > 50 ? "text-orange-500 animate-pulse" : "text-brand-400"}`} />
            <span className="text-[10px] font-bold text-white uppercase tracking-tighter"># {index + 1} Hot</span>
          </div>

          {/* TOP GIRL BADGE */}
          {item.profile.isTopGirl && (
            <div className="absolute top-3 right-3 px-2 py-0.5 bg-brand-500 text-white text-[9px] font-black uppercase rounded shadow-lg">
              Top Girl
            </div>
          )}

          {/* INFO */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
             <Link href={`/escorts/${item.profile.slug}`} className="block">
                <h3 className="text-white font-bold text-lg leading-tight group-hover:text-brand-400 transition-colors uppercase tracking-tight truncate">
                    {item.profile.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 text-dark-400">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">{item.profile.city?.name || "France"}</span>
                </div>
             </Link>

             {/* VOTING BUTTONS */}
             <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                <button 
                  onClick={() => handleVote(item.id, "up")}
                  disabled={votingId === item.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-brand-500/20 hover:bg-brand-500 text-brand-400 hover:text-white rounded-full transition-all border border-brand-500/30 text-xs font-bold"
                >
                  <Heart className="w-4 h-4" />
                  {item.upvotes}
                </button>
                <button 
                  onClick={() => handleVote(item.id, "down")}
                  disabled={votingId === item.id}
                  className="flex items-center justify-center w-8 h-8 bg-white/5 hover:bg-white/10 text-dark-500 hover:text-white rounded-full transition-all border border-white/10"
                >
                  <HeartOff className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
}
