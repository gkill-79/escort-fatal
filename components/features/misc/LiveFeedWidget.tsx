"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, ChevronRight } from "lucide-react";

interface FeedItem {
  id: string;
  type: "connection" | "profile_view";
  profileName?: string;
  city?: string;
  time: string;
}

export function LiveFeedWidget() {
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    // Placeholder: en production, brancher sur SSE ou Socket
    setItems([
      { id: "1", type: "connection", profileName: "Sophie", city: "Paris", time: "À l'instant" },
      { id: "2", type: "profile_view", profileName: "Léa", city: "Lyon", time: "Il y a 2 min" },
      { id: "3", type: "connection", profileName: "Emma", city: "Marseille", time: "Il y a 5 min" },
    ]);
  }, []);

  return (
    <div className="rounded-2xl bg-dark-800/60 border border-white/5 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Flame className="w-4 h-4 text-brand-400" />
          Flux en direct
        </h3>
        <Link
          href="/live-feed"
          className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-0.5"
        >
          Voir tout <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="text-xs text-dark-400 flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
            {item.profileName && (
              <span className="text-dark-200 truncate">{item.profileName}</span>
            )}
            {item.city && <span className="text-dark-500 truncate">· {item.city}</span>}
            <span className="ml-auto text-dark-600 shrink-0">{item.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
