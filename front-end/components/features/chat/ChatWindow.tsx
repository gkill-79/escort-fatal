import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { Send, ArrowLeft, Loader2, User, Video } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface ChatWindowProps {
  roomId: string;
  socket: Socket;
  currentUserId: string;
  room: any;
  onBack: () => void;
  onVideoCall: (targetId: string, targetName: string) => void;
}

export function ChatWindow({ roomId, socket, currentUserId, room, onBack, onVideoCall }: ChatWindowProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isMember = currentUserId === room?.memberId;
  const otherName = isMember ? room?.profile?.name : room?.member?.username;

  // Fetch History
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    fetch(`/api/chat/messages?roomId=${roomId}`)
      .then(res => res.json())
      .then(data => {
        if (mounted && Array.isArray(data)) {
          setMessages(data);
          
          // Emit "mark_as_read" for messages from the OTHER user that are not read
          const unreadIds = data.filter(m => m.senderId !== currentUserId && !m.readAt).map(m => m.id);
          if (unreadIds.length > 0) {
             socket.emit("mark_as_read", { roomId, messageIds: unreadIds });
          }
        }
      })
      .catch(console.error)
      .finally(() => {
         if (mounted) setIsLoading(false);
      });

    return () => { mounted = false; };
  }, [roomId, currentUserId, socket]);

  // Listen for socket events
  useEffect(() => {
    const onReceiveMessage = (msg: any) => {
      if (msg.roomId === roomId) {
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        
        // Auto-read if window is open
        if (msg.senderId !== currentUserId) {
           socket.emit("mark_as_read", { roomId, messageIds: [msg.id] });
        }
      }
    };

    const onUserTyping = (data: { userId: string, isTyping: boolean }) => {
       if (data.userId !== currentUserId) {
         setIsTyping(data.isTyping);
       }
    };

    const onMessagesRead = (data: { messageIds: string[], readAt: string }) => {
       setMessages(prev => prev.map(m => 
          data.messageIds.includes(m.id) ? { ...m, readAt: data.readAt } : m
       ));
    };

    const onError = (err: { code: string, message: string }) => {
       setErrorMsg(err.message);
       if (err.code === "INSUFFICIENT_CREDITS") {
         setTimeout(() => {
            window.location.href = "/dashboard/member/credits";
         }, 3000);
       }
    };
    
    socket.on("receive_message", onReceiveMessage);
    socket.on("user_typing", onUserTyping);
    socket.on("messages_read", onMessagesRead);
    socket.on("chat_error", onError);
    
    return () => {
      socket.off("receive_message", onReceiveMessage);
      socket.off("user_typing", onUserTyping);
      socket.off("messages_read", onMessagesRead);
      socket.off("chat_error", onError);
    };
  }, [socket, roomId, currentUserId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isTyping]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    socket.emit("typing_start", { roomId, senderId: currentUserId });
    
    typingTimeoutRef.current = setTimeout(() => {
       socket.emit("typing_stop", { roomId, senderId: currentUserId });
    }, 1500);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Emit to socket
    socket.emit("send_message", {
      roomId,
      senderId: currentUserId,
      content: input.trim()
    });

    // Optimistic UI update
    setMessages(prev => [...prev, {
      id: `temp-${Date.now()}`,
      roomId,
      senderId: currentUserId,
      contentEncrypted: input.trim(),
      sentAt: new Date().toISOString(),
      sender: { id: currentUserId }
    }]);

    setInput("");
    socket.emit("typing_stop", { roomId, senderId: currentUserId });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
       alert("L'image ne doit pas dépasser 5 Mo");
       return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
       const base64 = ev.target?.result as string;
       const payload = `[IMAGE]${base64}`;
       
       socket.emit("send_message", {
          roomId,
          senderId: currentUserId,
          content: payload
       });

       // Optimistic UI update
       setMessages(prev => [...prev, {
         id: `temp-${Date.now()}`,
         roomId,
         senderId: currentUserId,
         contentEncrypted: payload,
         sentAt: new Date().toISOString(),
         sender: { id: currentUserId }
       }]);
    };
    reader.readAsDataURL(file);
  };

  const renderMessageContent = (content: string) => {
    if (content.startsWith("[IMAGE]")) {
      const src = content.replace("[IMAGE]", "");
      return <img src={src} alt="Média envoyé" className="max-w-[200px] sm:max-w-xs rounded-xl shadow-md mt-1 mb-1" />;
    }
    return content;
  };

  return (
    <div className="flex flex-col h-full bg-dark-950">
      {/* Header */}
      <div className="h-16 border-b border-white/5 bg-dark-900/80 backdrop-blur flex items-center px-4 gap-4 shrink-0 relative z-10">
        <button onClick={onBack} className="md:hidden p-2 -ml-2 text-dark-400 hover:text-white rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-dark-400" />
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-[2px] border-dark-900"></div>
        </div>
        <div>
          <h3 className="font-bold text-white leading-tight flex items-center gap-2">
            {otherName || "Conversation"}
          </h3>
          <p className="text-xs text-brand-400">En ligne</p>
        </div>

        {/* Video Call Button */}
        <button 
          onClick={() => {
             const targetId = isMember ? room?.profileId : room?.memberId;
             onVideoCall(targetId, otherName || "Correspondant");
          }}
          className="ml-auto p-2.5 bg-brand-500/10 hover:bg-brand-500 text-brand-500 hover:text-white rounded-xl transition-all border border-brand-500/20"
          title="Appel Vidéo"
        >
          <Video className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
             </div>
             <p className="text-dark-300 font-semibold">Messagerie Chiffrée & Privée</p>
             <p className="text-dark-500 text-xs mt-1 max-w-[250px] mx-auto">
               Ceci est le début de votre discussion avec {otherName}. Chaque message vous coûte 1 Crédit.
             </p>
          </div>
        ) : (
          messages.map((msg, i) => {
             const isMe = msg.senderId === currentUserId;
             const showHeader = i === 0 || messages[i - 1].senderId !== msg.senderId;
             
             return (
               <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                 {showHeader && !isMe && (
                   <span className="text-[10px] font-bold text-dark-400 ml-1 mb-1.5 uppercase tracking-wider">{otherName}</span>
                 )}
                 <div className={`max-w-[75%] px-4 py-2 text-sm drop-shadow-md ${
                   isMe 
                     ? "bg-brand-500 text-white rounded-[20px] rounded-br-[4px]" 
                     : "bg-dark-800 text-white rounded-[20px] rounded-bl-[4px] border border-white/5"
                 }`}>
                   {renderMessageContent(msg.contentEncrypted)}
                 </div>
                 <div className={`flex items-center gap-1 mt-1 text-[10px] text-dark-600 ${isMe ? "mr-1" : "ml-1"}`}>
                   <span>{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   {isMe && msg.readAt && <span className="text-blue-400 font-black">✓✓</span>}
                   {isMe && !msg.readAt && <span className="text-dark-500 font-bold">✓</span>}
                 </div>
               </div>
             );
          })
        )}
        
        {isTyping && (
          <div className="flex items-end gap-2 text-dark-500 text-xs italic opacity-70">
             <div className="flex items-center bg-dark-800/50 rounded-full px-3 py-2 gap-1 border border-white/5">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce delay-200"></span>
             </div>
             {otherName} est en train d'écrire...
          </div>
        )}
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Input */}
      <div className="p-4 bg-dark-900 shrink-0 border-t border-white/5 relative">
        {errorMsg && (
          <div className="absolute bottom-full left-0 right-0 mb-4 mx-4 bg-red-500 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between border border-red-400/50 backdrop-blur-md">
            <span>⚠️ {errorMsg}</span>
            <div className="flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Redirection...
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2">
          
          <div className="relative">
            <input 
              type="file" 
              accept="image/*" 
              id="file-upload" 
              className="hidden" 
              onChange={handleImageUpload}
            />
            <label 
              htmlFor="file-upload" 
              className="w-12 h-12 shrink-0 rounded-full bg-dark-800 hover:bg-white/5 text-dark-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </label>
          </div>

          <input 
            type="text" 
            value={input}
            onChange={handleTyping}
            placeholder={isMember ? "1 Message = 1 Crédit..." : "Répondez à votre client..."} 
            className="flex-1 bg-dark-800 border border-white/5 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-dark-500"
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="w-12 h-12 shrink-0 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(233,69,96,0.3)]"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
