"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

type MessageNode = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    username: string;
    avatarUrl?: string;
  };
};

export default function ChatRoomPage({ params }: { params: { roomId: string } }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<MessageNode[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Setup socket and Fetch History
  useEffect(() => {
    if (!session?.user) return;

    // Fetch message history
    fetch(`/api/chat/messages?roomId=${params.roomId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
           setMessages(data);
        }
        setLoading(false);
      });

    // Initialize socket
    const socket = io(); // Connects automatically to the same origin protocol
    socketRef.current = socket;

    socket.emit("join_room", params.roomId);

    socket.on("receive_message", (message: MessageNode) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [params.roomId, session]);

  // 2. Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !session?.user || !socketRef.current) return;

    socketRef.current.emit("send_message", {
      roomId: params.roomId,
      senderId: session.user.id,
      content: inputText.trim()
    });

    setInputText("");
  };

  if (loading || !session?.user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-20">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
        <p className="text-dark-300 font-medium">Connexion chiffrée en cours...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-dark-950">
      
      {/* Discussion Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-center mt-20 text-dark-400 text-sm">
            Début de la conversation sécurisée. N'hésitez pas à lancer la discussion.
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === session.user.id;
            
            return (
              <div key={msg.id || idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] ${isMe ? "ml-auto" : "mr-auto"}`}>
                <span className="text-xs text-dark-500 mb-1 px-1">
                  {isMe ? "Moi" : msg.sender.username} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                
                <div className={`
                  px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${isMe 
                    ? "bg-brand-500 text-white rounded-br-sm" 
                    : "bg-dark-800 text-dark-100 rounded-bl-sm border border-white/5"}
                `}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="bg-dark-900 border-t border-white/5 p-4 md:p-6 shrink-0">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-3">
          <div className="flex-1 bg-dark-800 border border-white/10 rounded-2xl overflow-hidden focus-within:border-brand-500/50 transition-colors">
            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Écrivez un message sécurisé..."
              className="w-full bg-transparent text-white px-4 py-3 focus:outline-none resize-none min-h-[50px] max-h-[150px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          <Button 
            type="submit" 
            disabled={!inputText.trim()} 
            className="w-12 h-[50px] shrink-0 rounded-2xl p-0 flex items-center justify-center bg-brand-500 hover:bg-brand-600 shadow-[0_0_15px_rgba(233,69,96,0.3)] disabled:shadow-none"
          >
            <Send className="w-5 h-5 ml-1" />
          </Button>
        </form>
      </div>

    </div>
  );
}
