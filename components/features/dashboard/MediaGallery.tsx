"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ProfilePhoto {
  id: string;
  url: string;
  isPrimary: boolean;
  isApproved: boolean;
}

interface MediaGalleryProps {
  initialPhotos: ProfilePhoto[];
}

export function MediaGallery({ initialPhotos }: MediaGalleryProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState<ProfilePhoto[]>(initialPhotos);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Seules les images sont autorisées.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Le fichier ne doit pas dépasser 5 Mo.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/profiles/me/photos", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("L'upload a échoué.");
      }

      const newPhoto = await res.json();
      setPhotos((prev) => [...prev, newPhoto]);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi.");
    } finally {
      setIsUploading(false);
      // reset file input
      e.target.value = "";
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette photo ?")) return;

    setDeletingId(photoId);
    setError(null);

    try {
      const res = await fetch(`/api/profiles/me/photos?id=${photoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Erreur de suppression.");
      }

      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erreur de suppression.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Uploader Box */}
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:bg-white/5 transition relative overflow-hidden group">
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <div className="flex flex-col items-center justify-center pointer-events-none">
          {isUploading ? (
            <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-3" />
          ) : (
            <Upload className="w-10 h-10 text-dark-400 group-hover:text-brand-400 transition mb-3" />
          )}
          <h3 className="text-lg font-medium text-white mb-1">
            {isUploading ? "Envoi en cours..." : "Cliquez ou glissez une photo"}
          </h3>
          <p className="text-sm text-dark-400">JPG, PNG, WEBP (Max 5 Mo).</p>
        </div>
      </div>

      {/* Grid of existing photos */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Vos photos ({photos.length})</h3>
        
        {photos.length === 0 ? (
          <div className="text-center py-10 bg-dark-900 rounded-2xl border border-white/5">
            <ImageIcon className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">Aucune photo pour l'instant.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative aspect-[3/4] bg-dark-900 rounded-xl overflow-hidden group border border-white/5">
                <Image
                  src={photo.url}
                  alt="Galerie Escorte"
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
                
                {/* Overlay actions */}
                <div className="absolute inset-x-0 top-0 p-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-black/60 to-transparent">
                  <button
                    onClick={() => handleDelete(photo.id)}
                    disabled={deletingId === photo.id}
                    className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition"
                    title="Supprimer"
                  >
                    {deletingId === photo.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  </button>
                </div>
                
                {photo.isPrimary && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-brand-500 text-xs font-bold text-white rounded-md shadow-lg">
                    Principale
                  </div>
                )}
                {!photo.isApproved && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="px-3 py-1 bg-yellow-500/80 text-white text-xs font-bold rounded-lg border border-yellow-400">En attente</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
