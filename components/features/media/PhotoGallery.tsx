"use client";

import Image from "next/image";
import { useState } from "react";

interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  isPrimary?: boolean;
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
  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-dark-800">
        <Image
          src={main.url}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 1200px) 100vw, 800px"
          priority
        />
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {list.map((p, i) => (
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
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
