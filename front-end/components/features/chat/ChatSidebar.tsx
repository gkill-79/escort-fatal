import { formatTimeAgo } from "@/lib/utils";
import { User, Search } from "lucide-react";
import { useState } from "react";

interface ChatSidebarProps {
  rooms: any[];
  activeRoomId: string | null;
  setActiveRoomId: (id: string) => void;
  currentUserId: string;
}

export function ChatSidebar({ rooms, activeRoomId, setActiveRoomId, currentUserId }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRooms = rooms.filter(room => {
    const isMember = currentUserId === room.memberId;
    const otherName = isMember ? room.profile?.name : room.member?.username;
    return otherName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-full flex flex-col bg-dark-900 border-r border-white/5">
      <div className="p-4 border-b border-white/5 bg-dark-800/50">
        <h2 className="text-xl font-bold text-white mb-4">Discussions</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input 
            type="text" 
            placeholder="Rechercher une discussion..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-950 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors placeholder:text-dark-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        {filteredRooms.length === 0 ? (
          <div className="p-6 text-center text-dark-400 text-sm">
             {searchQuery ? "Aucune conversation trouvée." : "Vous n'avez aucune conversation active."}
          </div>
        ) : (
          filteredRooms.map(room => {
            // Determine who the "other" person is
            const isMember = currentUserId === room.memberId;
            const otherName = isMember ? room.profile?.name : room.member?.username;
            const otherAvatar = isMember ? null : room.member?.avatarUrl; // Escorts load profile photos differently if needed
            
            const lastMsg = room.messages?.[0];
            const isUnread = false; // Could check from DB later

            return (
              <button
                key={room.id}
                onClick={() => setActiveRoomId(room.id)}
                className={`w-full text-left p-4 border-b border-white/5 flex items-center gap-3 transition-colors ${
                  activeRoomId === room.id ? "bg-brand-500/10 border-l-4 border-l-brand-500" : "hover:bg-white/5 border-l-4 border-l-transparent"
                }`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-dark-700 shrink-0 flex items-center justify-center">
                  {otherAvatar ? (
                    <img src={otherAvatar} alt={otherName || ""} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-dark-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className={`font-bold truncate ${isUnread ? "text-white" : "text-dark-200"}`}>
                      {otherName || "Utilisateur supprimé"}
                    </span>
                    {lastMsg && (
                      <span className="text-[10px] text-dark-500 shrink-0 ml-2">
                        {formatTimeAgo(new Date(lastMsg.sentAt))}
                      </span>
                    )}
                  </div>
                  <div className={`text-xs truncate ${isUnread ? "text-white font-medium" : "text-dark-400"}`}>
                    {lastMsg ? lastMsg.contentEncrypted : "Nouvelle conversation"}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
