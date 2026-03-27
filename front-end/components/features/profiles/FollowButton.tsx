"use client";

import { useState } from "react";
import { Heart, Check } from "lucide-react";
import { toast } from "react-hot-toast";

interface FollowButtonProps {
  profileId: string;
  initialIsFollowing?: boolean;
}

export function FollowButton({ profileId, initialIsFollowing = false }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFollow = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const res = await fetch(`/api/profiles/${profileId}/follow`, { method: "DELETE" });
        if (!res.ok) {
          if (res.status === 401) throw new Error("Veuillez vous connecter pour gérer vos abonnements.");
          throw new Error("Erreur serveur lors du désabonnement.");
        }
        setIsFollowing(false);
        toast.success("Désabonné avec succès", {
          style: { background: "#333", color: "#fff" }
        });
      } else {
        // Follow
        const res = await fetch(`/api/profiles/${profileId}/follow`, { method: "POST" });
        if (!res.ok) {
          if (res.status === 401) throw new Error("Veuillez vous connecter pour vous abonner.");
          throw new Error("Erreur serveur lors de l'abonnement.");
        }
        setIsFollowing(true);
        toast.success("Ajouté à vos abonnements ! ❤️", {
          style: { background: "#333", color: "#fff" }
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue.", {
        style: { background: "#333", color: "#fff" }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFollow}
      disabled={isLoading}
      className={`w-full py-3 flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-300 ${
        isFollowing
          ? "bg-dark-800 text-brand-400 border border-brand-500/30 hover:bg-dark-700"
          : "bg-dark-800 text-white border border-white/10 hover:border-brand-500/50 hover:text-brand-400 hover:bg-dark-700"
      }`}
    >
      {isFollowing ? (
        <>
          <Check className="w-5 h-5 text-brand-400" />
          Abonné
        </>
      ) : (
        <>
          <Heart className={`w-5 h-5 ${isLoading ? "animate-pulse fill-brand-400" : ""}`} />
          S'abonner
        </>
      )}
    </button>
  );
}
