"use client";
import { useEffect, useRef, useState } from 'react';
import { WebRTCManager } from '@/lib/webrtc';
// import { useSocket } from '@/hooks/useSocket';

interface VideoCallOverlayProps {
  targetUserId: string;
  isCaller: boolean;
  onEndCall: () => void;
}

export default function VideoCallOverlay({ targetUserId, isCaller, onEndCall }: VideoCallOverlayProps) {
  // const socket = useSocket();
  const socket = null as any; // Placeholder pour ton socket
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [rtcManager, setRtcManager] = useState<WebRTCManager | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;
    const manager = new WebRTCManager(socket, targetUserId);
    setRtcManager(manager);

    const setupCall = async () => {
      await manager.initialize();
      if (localVideoRef.current) {
        await manager.startLocalMedia(localVideoRef.current);
      }
      
      if (remoteVideoRef.current && manager.remoteStream) {
        remoteVideoRef.current.srcObject = manager.remoteStream;
      }

      // Si c'est nous qui appelons, on crée l'offre
      if (isCaller) {
        await manager.createOffer();
      }
    };

    setupCall();

    // Écouteurs de signalisation WebSocket
    socket.on('webrtc-offer', async ({ offer }: any) => await manager.handleOffer(offer));
    socket.on('webrtc-answer', async ({ answer }: any) => await manager.handleAnswer(answer));
    socket.on('webrtc-ice-candidate', async ({ candidate }: any) => await manager.handleIceCandidate(candidate));
    socket.on('video-call-ended', () => handleHangUp(manager));

    // ÉCOUTE DES ÉVÉNEMENTS DE FACTURATION SERVEUR
    socket.on('call-warning-funds', ({ remainingMinutes }: any) => {
      setWarningMessage(`⚠️ Attention : Il vous reste de quoi payer ${remainingMinutes} minute(s).`);
      setTimeout(() => setWarningMessage(null), 10000);
    });

    socket.on('call-force-ended', ({ reason }: any) => {
      if (reason === 'INSUFFICIENT_FUNDS') {
        alert("Appel terminé : Vos crédits sont épuisés. Veuillez recharger votre portefeuille.");
      }
      handleHangUp(manager);
    });

    return () => {
      // Nettoyage si le composant est démonté
      manager.hangUp();
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('webrtc-ice-candidate');
      socket.off('video-call-ended');
      socket.off('call-warning-funds');
      socket.off('call-force-ended');
    };
  }, [targetUserId, isCaller, socket]);

  const handleHangUp = (managerToUse = rtcManager) => {
    managerToUse?.hangUp();
    socket?.emit('video-call-end', { targetUserId });
    onEndCall();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Affichage de l'alerte de facturation par-dessus la vidéo */}
      {warningMessage && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-red-600/90 text-white px-6 py-2 rounded-full font-bold animate-pulse z-[60] shadow-2xl">
          {warningMessage}
        </div>
      )}

      {/* Vidéo de l'interlocuteur (Plein écran) */}
      <video 
        ref={remoteVideoRef} 
        autoPlay playsInline 
        className="w-full h-full object-cover"
      />

      {/* Ma vidéo (Petite vignette en haut à droite) */}
      <div className="absolute top-4 right-4 w-32 h-48 bg-gray-900 rounded-lg overflow-hidden shadow-lg border-2 border-white">
        <video 
          ref={localVideoRef} 
          autoPlay playsInline muted 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Contrôles */}
      <div className="absolute bottom-10 flex gap-6">
        <button 
          onClick={() => handleHangUp()} 
          className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-xl transition-transform active:scale-95 cursor-pointer"
        >
          Raccrocher
        </button>
      </div>
    </div>
  );
}
