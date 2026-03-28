"use client";

import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, Minimize2, User } from "lucide-react";
import { rtcConfig, mediaConstraints } from "@/lib/webrtc";

interface VideoCallOverlayProps {
  socket: Socket;
  currentUserId: string;
  targetId: string;
  targetName: string;
  isIncoming: boolean;
  onClose: () => void;
}

export function VideoCallOverlay({ socket, currentUserId, targetId, targetName, isIncoming, onClose }: VideoCallOverlayProps) {
  const [callStatus, setCallStatus] = useState<"connecting" | "ringing" | "connected" | "ended">("connecting");
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  // Initialize WebRTC & Ringtone
  useEffect(() => {
    if (typeof window !== "undefined") {
      // High-quality digital ringtone
      ringtoneRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/1350/1350-preview.mp3");
      ringtoneRef.current.loop = true;
    }

    const initCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // Initialize PeerConnection
        const pc = new RTCPeerConnection(rtcConfig);
        peerRef.current = pc;

        // Add local tracks to peer
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // Listen for remote tracks
        pc.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          setCallStatus("connected");
        };

        // Listen for ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("webrtc:signal", {
              targetId,
              data: { type: "candidate", candidate: event.candidate }
            });
          }
        };

        if (isIncoming) {
          setCallStatus("ringing");
        } else {
          // Outgoing call: Create Offer
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("webrtc:signal", {
            targetId,
            data: { type: offer.type, sdp: offer.sdp }
          });
          setCallStatus("ringing");
        }

      } catch (err) {
        console.error("WebRTC Init Error:", err);
        setCallStatus("ended");
      }
    };

    initCall();

    // Signaling Listeners
    const onSignal = async ({ data }: { data: any }) => {
      const pc = peerRef.current;
      if (!pc) return;

      try {
        if (data.type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("webrtc:signal", {
            targetId,
            data: { type: answer.type, sdp: answer.sdp }
          });
        } else if (data.type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(data));
        } else if (data.type === "candidate" && data.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (err) {
        console.error("Signaling Error:", err);
      }
    };

    socket.on("webrtc:signal", onSignal);

    return () => {
      socket.off("webrtc:signal", onSignal);
      localStream?.getTracks().forEach(t => t.stop());
      peerRef.current?.close();
    };
  }, [socket, targetId, isIncoming]);

  // Handle Ringtone Playback
  useEffect(() => {
    if (isIncoming && callStatus === "ringing") {
      ringtoneRef.current?.play().catch(() => {
        console.log("Autoplay blocked: user interaction required for sound.");
      });
    } else {
      ringtoneRef.current?.pause();
      if (ringtoneRef.current) ringtoneRef.current.currentTime = 0;
    }
    
    return () => {
      ringtoneRef.current?.pause();
    };
  }, [isIncoming, callStatus]);

  const handleEndCall = () => {
    onClose();
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = muted);
      setMuted(!muted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => t.enabled = videoOff);
      setVideoOff(!videoOff);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-dark-950 flex flex-col items-center justify-center p-4">
      {/* Remote Video (Full Screen) */}
      <div className="relative w-full h-full max-w-4xl bg-dark-900 rounded-3xl overflow-hidden shadow-2xl border border-white/5">
        
        {callStatus !== "connected" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-dark-800 flex items-center justify-center relative z-10">
                <User className="w-16 h-16 text-dark-500" />
              </div>
              <div className="absolute -inset-4 bg-brand-500/20 rounded-full animate-ping"></div>
              <div className="absolute -inset-8 bg-brand-500/10 rounded-full animate-ping delay-300"></div>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white capitalize">{targetName}</h2>
              <p className="text-brand-400 font-medium animate-pulse mt-1">
                {isIncoming ? "Appel entrant..." : "Appel en cours..."}
              </p>
            </div>
            
            {isIncoming && (
              <button 
                onClick={() => setCallStatus("connecting")}
                className="mt-8 px-10 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
              >
                <Video className="w-5 h-5" />
                Accepter l'appel
              </button>
            )}
          </div>
        ) : (
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover" 
          />
        )}

        {/* Local Preview (PiP) */}
        <div className="absolute top-6 right-6 w-32 md:w-48 aspect-video bg-dark-800 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover ${videoOff ? "hidden" : "block"}`} 
          />
          {videoOff && (
            <div className="w-full h-full flex items-center justify-center bg-dark-800">
               <User className="w-8 h-8 text-dark-500" />
            </div>
          )}
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 p-4 bg-dark-900/60 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
          <button 
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all ${muted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
          >
            {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={handleEndCall}
            className="p-5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-500/30 transition-all transform hover:scale-110"
          >
            <PhoneOff className="w-8 h-8" />
          </button>

          <button 
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all ${videoOff ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
          >
            {videoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
        </div>

        {/* Branding */}
        <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-dark-950/40 backdrop-blur-md rounded-lg border border-white/5">
          <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Live WebRTC</span>
        </div>
      </div>
    </div>
  );
}
