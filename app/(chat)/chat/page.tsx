"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/utils";
import { MessageSquare, Users, Loader2, Info } from "lucide-react";

export default function ChatInboxPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chat/rooms")
      .then(res => res.json())
      .then(data => {
        setRooms(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-20">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
        <p className="text-dark-300 font-medium">Chargement de vos conversations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-white">Vos Conversations</h2>
        <span className="bg-dark-800 text-dark-300 text-sm font-medium px-4 py-1.5 rounded-full border border-white/5">
          {rooms.length} actif(s)
        </span>
      </div>

      {rooms.length === 0 ? (
        <div className="bg-dark-900 border border-white/5 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-dark-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Aucun message pour le moment</h3>
          <p className="text-dark-400 max-w-sm mx-auto">
            Vos futures discussions privées en temps réel apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map(room => {
            // Find the OTHER participant (not current user logic handled poorly in strictly strictly client if we don't have user ID, but we can compute it if there are 2)
            // Wait: since we just need the other person, we show the names of all participants
            const previewMsg = room.messages?.[0]?.content || "Nouvelle conversation prête.";
            const isRead = room.messages?.[0]?.isRead ?? true;

            return (
              <Link 
                key={room.id} 
                href={`/chat/${room.id}`}
                className="group flex items-center gap-4 p-4 bg-dark-900/50 hover:bg-dark-800 border border-transparent hover:border-white/5 rounded-2xl transition-all"
              >
                <div className="w-14 h-14 bg-dark-700 rounded-full flex shrink-0 items-center justify-center text-dark-400 font-medium overflow-hidden">
                   <Users className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-white font-bold truncate group-hover:text-brand-400 transition-colors">
                      Chambre {room.id.slice(0, 8)}...
                    </h4>
                    <span className="text-xs text-dark-500 font-medium shrink-0 ml-4">
                      {formatTimeAgo(new Date(room.lastMessageAt))}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${!isRead ? "text-white font-medium" : "text-dark-400"}`}>
                    {previewMsg}
                  </p>
                </div>

                {!isRead && (
                   <div className="w-3 h-3 bg-brand-500 rounded-full shadow-[0_0_10px_rgba(233,69,96,0.5)]"></div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Info notice */}
      <div className="mt-8 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 text-blue-400 text-sm">
        <Info className="w-5 h-5 shrink-0" />
        <p>Les messages sont chiffrés en transit et vous offrent une ligne directe entre escortes et clients sans intermédiaire externe.</p>
      </div>

    </div>
  );
}
