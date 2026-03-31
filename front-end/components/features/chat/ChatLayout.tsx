"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { Loader2, MessageSquare } from "lucide-react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatWindow } from "./ChatWindow";
import { VideoCallOverlay } from "./VideoCallOverlay";
import { toast } from "react-hot-toast";

interface ChatLayoutProps {
  currentUserId: string;
  initialRoomId?: string;
}

export function ChatLayout({ currentUserId, initialRoomId }: ChatLayoutProps) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(initialRoomId || null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Video Call State
  const [callData, setCallData] = useState<{
    targetId: string;
    targetName: string;
    isIncoming: boolean;
  } | null>(null);

  // Load Rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch("/api/chat/rooms");
        if (res.ok) {
          const data = await res.json();
          setRooms(data);
          if (!activeRoomId && data.length > 0 && !initialRoomId) {
             setActiveRoomId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, [initialRoomId]);

  // Connect Socket
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000", {
      path: "/socket.io",
      addTrailingSlash: false,
      query: { userId: currentUserId } // Critical for personal room joining
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
    });

    // Redis Heartbeat (Updates 'online_users' Sorted Set)
    const heartbeatInterval = setInterval(() => {
      socketInstance.emit("heartbeat", { userId: currentUserId });
    }, 45000);

    // Listen for Incoming Calls
    socketInstance.on("webrtc:call-init", (data: { senderId: string, senderName: string }) => {
       console.log("Incoming call from:", data.senderName);
       setCallData({
         targetId: data.senderId,
         targetName: data.senderName,
         isIncoming: true
       });
       toast.success(`Appel vidéo de ${data.senderName}`, { duration: 8000 });
    });

    setSocket(socketInstance);

    return () => {
      clearInterval(heartbeatInterval);
      socketInstance.disconnect();
    };
  }, [currentUserId]);

  // Whenever the active room changes, join that room
  useEffect(() => {
    if (socket && activeRoomId) {
      socket.emit("join_room", activeRoomId);
    }
  }, [socket, activeRoomId]);

  // Listen for incoming messages across all rooms to update Sidebar previews
  useEffect(() => {
    if (!socket) return;
    
    const onReceiveMessage = (message: any) => {
      setRooms(prevRooms => {
        // Find if this message belongs to any room
        const roomIndex = prevRooms.findIndex(r => r.id === message.roomId);
        if (roomIndex === -1) return prevRooms; // If it's a new room, we should ideally fetch again, but ignore for now

        const updatedRooms = [...prevRooms];
        // Replace messages preview
        updatedRooms[roomIndex] = {
           ...updatedRooms[roomIndex],
           messages: [message],
           lastMessageAt: message.sentAt
        };

        // Sort by lastMessageAt desc
        return updatedRooms.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      });
    };

    socket.on("receive_message", onReceiveMessage);

    return () => {
      socket.off("receive_message", onReceiveMessage);
    };
  }, [socket]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      {/* SIDEBAR */}
      <div className={`w-full md:w-[320px] lg:w-[380px] shrink-0 border-r border-white/5 flex flex-col ${activeRoomId ? "hidden md:flex" : "flex"}`}>
        <ChatSidebar 
          rooms={rooms} 
          activeRoomId={activeRoomId} 
          setActiveRoomId={setActiveRoomId} 
          currentUserId={currentUserId}
        />
      </div>

      {/* MAIN CHAT WINDOW */}
      <div className={`flex-1 flex flex-col min-w-0 ${!activeRoomId ? "hidden md:flex" : "flex"}`}>
        {activeRoomId && socket ? (
          <ChatWindow 
             roomId={activeRoomId} 
             socket={socket} 
             currentUserId={currentUserId} 
             room={rooms.find(r => r.id === activeRoomId)}
             onBack={() => setActiveRoomId(null)}
             onVideoCall={(targetId: string, targetName: string) => {
                setCallData({ targetId, targetName, isIncoming: false });
                socket.emit("webrtc:call-init", { targetId, senderName: currentUserId }); 
             }}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-dark-500 bg-dark-900/50">
            <div className="w-20 h-20 bg-dark-900 rounded-full flex items-center justify-center mb-4 border border-white/5 shadow-inner">
              <MessageSquare className="w-10 h-10 text-dark-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Vos Messages</h3>
            <p className="text-sm">Sélectionnez une conversation pour commencer à discuter.</p>
          </div>
        )}
      </div>

      {/* VIDEO CALL OVERLAY */}
      {callData && socket && (
        <VideoCallOverlay 
          socket={socket}
          currentUserId={currentUserId}
          targetId={callData.targetId}
          targetName={callData.targetName}
          isIncoming={callData.isIncoming}
          onClose={() => setCallData(null)}
        />
      )}
    </div>
  );
}
