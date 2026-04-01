"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Camera, RefreshCw, Check } from "lucide-react";

export function SelfieCapture({ onCapture }: { onCapture: (file: File) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }, // Force la caméra frontale
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setError("Impossible d'accéder à la caméra. Autorisez l'accès dans votre navigateur.");
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      // Inverser l'image car la vidéo est en miroir horizontalement (effets visuels pour l'utilisateur)
      context?.translate(canvasRef.current.width, 0);
      context?.scale(-1, 1);
      context?.drawImage(videoRef.current, 0, 0);

      const dataUrl = canvasRef.current.toDataURL("image/jpeg");
      setPhoto(dataUrl);

      // Convertir en File pour l'envoi au serveur
      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
          onCapture(file);
        });

      // Arrêter la caméra pour ne pas vider la batterie
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // S'assurer de couper la caméra si l'utilisateur quitte le composant
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);

  return (
    <div className="flex flex-col items-center gap-4 p-4 border border-white/5 rounded-2xl bg-dark-950">
      {error && <p className="text-red-400 text-xs text-center">{error}</p>}
      
      {!photo ? (
        <>
          <div className="relative w-full aspect-square max-w-[200px] overflow-hidden rounded-2xl border-2 border-dark-800 bg-dark-900 flex items-center justify-center">
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="object-cover w-full h-full scale-x-[-1]"
              />
            ) : (
              <Camera className="w-10 h-10 text-dark-500" />
            )}
          </div>
          {!stream ? (
            <button
               onClick={startCamera} 
               type="button" 
               className="text-xs px-4 py-2 rounded-xl bg-dark-800 text-dark-200 border border-white/10 hover:text-white hover:bg-dark-700 transition flex items-center"
            >
              <Camera className="mr-2 w-4 h-4" /> Activer la caméra
            </button>
          ) : (
            <button 
               onClick={takePhoto} 
               type="button" 
               className="text-xs px-4 py-2 font-bold rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition flex items-center"
            >
              Prendre le selfie
            </button>
          )}
        </>
      ) : (
        <>
          <div className="relative w-full aspect-square max-w-[200px] overflow-hidden rounded-2xl border-2 border-green-500/50">
            <img src={photo} alt="Selfie Validé" className="w-full h-full object-cover scale-x-[-1]" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center text-green-400 text-xs font-bold bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
              <Check className="mr-1 w-3.5 h-3.5" /> Selfie Prêt
            </div>
            <button
              onClick={() => {
                setPhoto(null);
                startCamera();
              }}
              className="text-dark-400 hover:text-white transition-colors text-xs flex items-center mt-1"
              type="button"
            >
              <RefreshCw className="mr-1 w-3 h-3" /> Recommencer
            </button>
          </div>
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
