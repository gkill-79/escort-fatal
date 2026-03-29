'use client';

import { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { PhoneOff, Mic, MicOff, Camera, Video, Shield } from 'lucide-react';

interface VideoCallOverlayProps {
  roomId: string;
  targetUserId: string;
  isCaller?: boolean;
}

export default function VideoCallOverlay({ roomId, targetUserId, isCaller = false }: VideoCallOverlayProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const { socket } = useSocket();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [status, setStatus] = useState('Connexion en cours...');

  useEffect(() => {
    if (!socket) return;

    const initWebRTC = async () => {
      try {
        // 1. Demander l'accès à la caméra et au micro
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Configuration du PeerConnection (STUN Google)
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        peerConnectionRef.current = pc;

        // 3. Ajouter nos flux vidéo au PeerConnection
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // 4. Recevoir le flux vidéo de l'autre participant
        pc.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setStatus('Appel en cours');
          }
        };

        // 5. Négociation ICE
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('webrtc-signal', { 
              targetUserId, 
              roomId, 
              candidate: event.candidate 
            });
          }
        };

        // 6. Si je suis l'appelant, je crée une offre
        if (isCaller) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc-signal', { targetUserId, roomId, offer });
          setStatus('Appel de l\'escorte...');
        }
      } catch (err) {
        console.error("Erreur WebRTC init:", err);
        setStatus('Erreur : Caméra ou Micro introuvable');
      }
    };

    initWebRTC();

    // 7. Écoute des signaux entrants
    socket.on('webrtc-signal', async (data) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      if (data.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-signal', { targetUserId, roomId, answer });
      } else if (data.answer) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      } else if (data.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    socket.on('video-call-ended', () => {
      endCall();
    });

    return () => {
      socket.off('webrtc-signal');
      socket.off('video-call-ended');
      peerConnectionRef.current?.close();
    };
  }, [roomId, targetUserId, socket, isCaller]);

  const endCall = () => {
    if (socket) {
      socket.emit('video-call-end', { targetUserId, roomId });
    }
    peerConnectionRef.current?.close();
    window.location.href = `/dashboard/messages?room=${roomId}`;
  };

  const toggleMute = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed inset-0 bg-dark-950 z-[9999] flex items-center justify-center overflow-hidden font-sans">
      {/* Background Pulsing Radar Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[500px] h-[500px] border border-brand-500 rounded-full animate-ping opacity-20"></div>
            <div className="absolute w-[800px] h-[800px] border border-brand-500 rounded-full animate-ping opacity-10 blur-sm"></div>
        </div>
      </div>

      {/* Vidéo Distante (Plein écran) */}
      <div className="relative w-full h-full">
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover bg-dark-900 shadow-2xl" 
        />
        
        {/* Status Overlay */}
        <div className="absolute top-8 left-8 flex items-center space-x-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <div className={`w-2 h-2 rounded-full ${status === 'Appel en cours' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            <span className="text-xs font-bold uppercase tracking-widest text-white/80">{status}</span>
        </div>

        {/* Branding */}
        <div className="absolute top-8 right-8 flex items-center space-x-2 text-brand-500 opacity-50">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-black italic tracking-tighter">ESCORTE FATAL</span>
        </div>
      </div>
      
      {/* Ma Vidéo (Miniature flottante) */}
      <div className="absolute bottom-28 right-8 md:bottom-32 md:right-12 w-32 h-48 md:w-48 md:h-64 bg-dark-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-white/20 transform rotate-1 hover:rotate-0 transition-transform group">
        <video 
          ref={localVideoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Moi (Local)</span>
        </div>
      </div>

      {/* Barre de contrôles flottante */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-dark-900/60 backdrop-blur-2xl p-4 md:p-6 rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        <button 
          onClick={toggleMute} 
          className={`p-4 md:p-5 rounded-full transition-all duration-300 transform active:scale-90 ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <button 
          onClick={() => {
            if (localVideoRef.current?.srcObject) {
              const stream = localVideoRef.current.srcObject as MediaStream;
              stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
              setIsVideoOff(!isVideoOff);
            }
          }} 
          className={`p-4 md:p-5 rounded-full transition-all duration-300 transform active:scale-90 ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          {isVideoOff ? <Camera className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>

        <div className="w-px h-10 bg-white/10 mx-2" />

        <button 
          onClick={endCall} 
          className="p-5 md:p-6 rounded-full bg-red-600 hover:bg-red-750 text-white shadow-xl shadow-red-600/40 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center"
        >
          <PhoneOff className="w-8 h-8 fill-current" />
        </button>
      </div>

      {/* Security Warning */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-[9px] text-dark-500 uppercase font-bold tracking-[0.2em] opacity-40">
        Communication Chiffrée de bout-en-bout • Escorte Fatal SECURE-LINE
      </div>
    </div>
  );
}
