"use client";

import Image from "next/image";
import { useState } from "react";
import { Lock } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  isPrimary?: boolean;
  isPremium?: boolean;
  unlockPriceCredits?: number | null;
  isUnlocked?: boolean;
}

export function PhotoGallery({ photos = [] }: { photos: Photo[] }) {
  const [current, setCurrent] = useState(0);
  const list = photos.length ? photos : [];
  if (list.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-2xl bg-dark-800 flex items-center justify-center text-dark-500">
        Aucune photo
      </div>
    );
  }
  const main = list[current] ?? list[0];
  const isMainLocked = !!main.isPremium && !main.isUnlocked;
  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-dark-800">
        <Image
          src={main.url}
          alt=""
          fill
          className={`object-cover transition ${
            isMainLocked ? "scale-105 blur-sm brightness-75" : ""
          }`}
          sizes="(max-width: 1200px) 100vw, 800px"
          priority
        />
        {isMainLocked && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-black/60 border border-white/15 backdrop-blur-sm">
              <Lock className="w-5 h-5 text-yellow-400" />
              <p className="text-sm text-white font-semibold">Photo premium verrouillee</p>
              <p className="text-xs text-dark-300">
                Debloquer pour {main.unlockPriceCredits ?? 0} credits
              </p>
            </div>
          </div>
        )}
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {list.map((p, i) => {
            const isLocked = !!p.isPremium && !p.isUnlocked;
            return (
            <button
              key={p.id}
              type="button"
              onClick={() => setCurrent(i)}
              className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                i === current ? "border-brand-500" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={p.thumbnailUrl || p.url}
                alt=""
                fill
                className={`object-cover ${isLocked ? "blur-[2px] brightness-75" : ""}`}
                sizes="80px"
              />
              {isLocked && (
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-yellow-300" />
                </div>
              )}
            </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
