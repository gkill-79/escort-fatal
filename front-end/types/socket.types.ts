export interface ServerToClientEvents {
  "message:new": (msg: unknown) => void;
  "message:read": (payload: { roomId: string; messageId: string }) => void;
  "typing:start": (payload: { roomId: string; userId: string; username: string; isTyping: boolean }) => void;
  "typing:stop": (payload: { roomId: string; userId: string; username: string; isTyping: boolean }) => void;
  "notification:new": (n: unknown) => void;
}

export interface ClientToServerEvents {
  "room:join": (roomId: string) => void;
  "room:leave": (roomId: string) => void;
  "message:send": (payload: { roomId: string; content: string; type?: string }) => void;
  "message:read": (payload: { roomId: string; messageId: string }) => void;
  "typing:start": (roomId: string) => void;
  "typing:stop": (roomId: string) => void;
}
